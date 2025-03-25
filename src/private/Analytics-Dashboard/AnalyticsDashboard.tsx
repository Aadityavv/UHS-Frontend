import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import axios from "axios";
import { Pill, Home, School, Users, Calendar } from "lucide-react";

// Types
type ViewType = "daily" | "monthly" | "yearly";

interface DataPoint {
  bidholi: number;
  kandoli: number;
  [key: string]: string | number;
}

interface DailyData extends DataPoint {
  day: string;
}

interface MonthlyData extends DataPoint {
  month: string;
}

interface YearlyData extends DataPoint {
  year: string;
}

interface MedicineData extends DataPoint {
  medicine: string;
}

interface DoctorData {
  name: string;
  patientCount: number;
}

interface ResidenceData {
  type: string;
  count: number;
}

interface SchoolData {
  name: string;
  count: number;
}

const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
];

const chartConfig = {
  bidholi: {
    label: "Bidholi",
    color: "#6366f1",
    icon: <Home className="w-4 h-4" />,
  },
  kandoli: {
    label: "Kandoli",
    color: "#10b981",
    icon: <School className="w-4 h-4" />,
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="text-sm text-gray-700">
                {entry.name}: <span className="font-medium">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard = () => {
  const [view, setView] = useState<ViewType>("daily");
  const [totalPatient, setTotalPatient] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [schoolData, setSchoolData] = useState<Array<SchoolData>>([]);
  const [medicineData, setMedicineData] = useState<Array<MedicineData>>([]);
  const [residenceData, setResidenceData] = useState<Array<ResidenceData>>([]);
  const [doctorData, setDoctorData] = useState<Array<DoctorData>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<MonthlyData>>([]);
  const [yearlyData, setYearlyData] = useState<Array<YearlyData>>([]);
  const [dailyData, setDailyData] = useState<Array<DailyData>>([]);

  const transformData = (data: [string, string, number][]): MedicineData[] => {
    const result: Record<string, { bidholi: number; kandoli: number }> = {};
  
    data.forEach(([medicine, campus, count]) => {
      if (!result[medicine]) {
        result[medicine] = { bidholi: 0, kandoli: 0 };
      }
      if (campus === "UPES Bidholi Campus") {
        result[medicine].bidholi += count;
      } else if (campus === "UPES Kandoli Campus") {
        result[medicine].kandoli += count;
      }
    });
  
    return Object.entries(result).map(([medicine, counts]) => ({
      medicine,
      bidholi: counts.bidholi,
      kandoli: counts.kandoli,
    }));
  };

  const transformDataMonthly = (data: [string, string, number][]): MonthlyData[] => {
    const result: Record<string, { bidholi: number; kandoli: number }> = {};
  
    data.forEach(([month, campus, count]) => {
      if (!result[month]) {
        result[month] = { bidholi: 0, kandoli: 0 };
      }
      if (campus === "UPES Bidholi Campus") {
        result[month].bidholi += count;
      } else if (campus === "UPES Kandoli Campus") {
        result[month].kandoli += count;
      }
    });
  
    return Object.entries(result).map(([month, counts]) => ({
      month,
      bidholi: counts.bidholi,
      kandoli: counts.kandoli,
    }));
  };

  const transformDataYearly = (data: [string, string, number][]): YearlyData[] => {
    const result: Record<string, { bidholi: number; kandoli: number }> = {};
  
    data.forEach(([year, campus, count]) => {
      if (!result[year]) {
        result[year] = { bidholi: 0, kandoli: 0 };
      }
      if (campus === "UPES Bidholi Campus") {
        result[year].bidholi += count;
      } else if (campus === "UPES Kandoli Campus") {
        result[year].kandoli += count;
      }
    });
  
    return Object.entries(result).map(([year, counts]) => ({
      year,
      bidholi: counts.bidholi,
      kandoli: counts.kandoli,
    }));
  };

  const transformDataDaily = (data: [string, string, number][]): DailyData[] => {
    const result: Record<string, { bidholi: number; kandoli: number }> = {};
  
    data.forEach(([day, campus, count]) => {
      if (!result[day]) {
        result[day] = { bidholi: 0, kandoli: 0 };
      }
      if (campus === "UPES Bidholi Campus") {
        result[day].bidholi += count;
      } else if (campus === "UPES Kandoli Campus") {
        result[day].kandoli += count;
      }
    });
  
    return Object.entries(result).map(([day, counts]) => ({
      day,
      bidholi: counts.bidholi,
      kandoli: counts.kandoli,
    }));
  };

  useEffect(() => {
    const getAllData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      try {
        // Get Total Patient
        const responseAllPatient = await axios.get("https://uhs-backend.onrender.com/api/analytics/geTotalPatient", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (responseAllPatient.status === 200) {
          setTotalPatient(responseAllPatient.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description: responseAllPatient?.data?.message ||
              "Error occurred while fetching prescription data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }

        // Get School wise data
        const responseSchoolWise = await axios.get("https://uhs-backend.onrender.com/api/analytics/getSchoolWise", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (responseSchoolWise.status === 200) {
          setSchoolData(responseSchoolWise.data.map((el: any) => ({
            name: el[0],
            count: el[1]
          })));
        }

        // Get Top 10 medicine
        const responseTopMedsPres = await axios.get("https://uhs-backend.onrender.com/api/analytics/getTopMeds", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (responseTopMedsPres.status === 200) {
          setMedicineData(transformData(responseTopMedsPres.data));
        }

        // Get Data By Residence Type
        const responseByResType = await axios.get("https://uhs-backend.onrender.com/api/analytics/getByResidenceType", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (responseByResType.status === 200) {
          setResidenceData(responseByResType.data.map((el: any) => ({
            type: el[0],
            count: el[1]
          })));
        }

        // Get Doctor-Wise Distribution
        const responseDoctorWise = await axios.get("https://uhs-backend.onrender.com/api/analytics/getByDoctorName", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (responseDoctorWise.status === 200) {
          setDoctorData(responseDoctorWise.data);
        }

        // Get Patient Visits Monthly
        const responseMonthlyData = await axios.get("https://uhs-backend.onrender.com/api/analytics/getMonthlyData", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (responseMonthlyData.status === 200) {
          setMonthlyData(transformDataMonthly(responseMonthlyData.data));
        }

        // Get Patient Visits Yearly
        const responseYearlyData = await axios.get("https://uhs-backend.onrender.com/api/analytics/getYearlyData", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (responseYearlyData.status === 200) {
          setYearlyData(transformDataYearly(responseYearlyData.data));
        }

        // Get Daily Data
        const responseDailyData = await axios.get("https://uhs-backend.onrender.com/api/analytics/getDailyData", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (responseDailyData.status === 200) {
          setDailyData(transformDataDaily(responseDailyData.data));
        }

      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description: err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setLoading(false);
      }
    };

    getAllData();
  }, []);

  const getChartData = (view: ViewType) => {
    switch (view) {
      case "daily":
        return dailyData;
      case "monthly":
        return monthlyData;
      case "yearly":
        return yearlyData;
      default:
        return dailyData;
    }
  };

  const getDataKey = (view: ViewType) => {
    switch (view) {
      case "daily":
        return "day";
      case "monthly":
        return "month";
      case "yearly":
        return "year";
      default:
        return "day";
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    loading,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    loading: boolean;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 mt-2" />
      ) : (
        <p className="text-2xl font-bold" style={{ color }}>
          {value}
        </p>
      )}
    </div>
  );

  const ChartContainer = ({
    title,
    children,
    loading,
    className = "",
  }: {
    title: string;
    children: React.ReactNode;
    loading: boolean;
    className?: string;
  }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4 h-[300px]">
        {loading ? (
          <Skeleton className="w-full h-full rounded-lg" />
        ) : (
          children
        )}
      </div>
    </div>
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
  
    doc.setFontSize(18);
    doc.text("UHS Full Analytics Report", 14, y);
    doc.setFontSize(12);
    y += 10;
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, y);
    y += 10;
  
    const addSection = (title: string, headers: string[], rows: any[][]) => {
      doc.setFontSize(14);
      doc.text(title, 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [headers],
        body: rows,
        margin: { top: 10 },
      });
 // Type-safe way to access finalY
 if (doc.lastAutoTable && typeof doc.lastAutoTable.finalY === "number") {
  y = doc.lastAutoTable.finalY + 10;
} else {
  y += 30; // fallback if somehow finalY is unavailable
}
};
  
    // Daily Visits
    addSection(
      "Daily Patient Visits",
      ["Day", "Bidholi", "Kandoli", "Total"],
      dailyData.map((d) => [d.day, d.bidholi, d.kandoli, d.bidholi + d.kandoli])
    );
  
    // Monthly Visits
    addSection(
      "Monthly Patient Visits",
      ["Month", "Bidholi", "Kandoli", "Total"],
      monthlyData.map((d) => [d.month, d.bidholi, d.kandoli, d.bidholi + d.kandoli])
    );
  
    // Yearly Visits
    addSection(
      "Yearly Patient Visits",
      ["Year", "Bidholi", "Kandoli", "Total"],
      yearlyData.map((d) => [d.year, d.bidholi, d.kandoli, d.bidholi + d.kandoli])
    );
  
    // Top Medicines
    addSection(
      "Top Medicines",
      ["Medicine", "Bidholi", "Kandoli", "Total"],
      medicineData.map((d) => [d.medicine, d.bidholi, d.kandoli, d.bidholi + d.kandoli])
    );
  
    // Doctor Distribution
    addSection(
      "Doctor-wise Patient Distribution",
      ["Doctor", "Patient Count"],
      doctorData.map((d) => [d.name, d.patientCount])
    );
  
    // Residence Distribution
    addSection(
      "Residence-wise Patient Distribution",
      ["Type", "Count"],
      residenceData.map((r) => [r.type, r.count])
    );
  
    // School-wise Distribution
    addSection(
      "School-wise Patient Distribution",
      ["School", "Patient Count"],
      schoolData.map((s) => [s.name, s.count])
    );
  
    // Save the PDF
    doc.save("UHS_Full_Analytics_Report.pdf");
  };
  

  

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Healthcare Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Insights and trends from patient data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </Button>
            <Button onClick={handleExportPDF}>Export Report</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={totalPatient}
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            color="#6366f1"
            loading={loading}
          />
          <StatCard
            title="Bidholi Patients"
            value={dailyData.reduce((sum, item) => sum + item.bidholi, 0)}
            icon={<Home className="w-5 h-5 text-emerald-600" />}
            color="#10b981"
            loading={loading}
          />
          <StatCard
            title="Kandoli Patients"
            value={dailyData.reduce((sum, item) => sum + item.kandoli, 0)}
            icon={<School className="w-5 h-5 text-blue-600" />}
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            title="Top Medicine"
            value={medicineData[0]?.medicine || "N/A"}
            icon={<Pill className="w-5 h-5 text-amber-600" />}
            color="#f59e0b"
            loading={loading}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Visits Chart */}
          <div className="lg:col-span-2">
            <ChartContainer
              title="Patient Visits"
              loading={loading}
              className="h-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    {Object.values(chartConfig).map((config, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span style={{ color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {["daily", "monthly", "yearly"].map((v) => (
                      <Button
                        key={v}
                        variant={view === v ? "default" : "ghost"}
                        size="sm"
                        className={`rounded-full ${
                          view === v ? "shadow-sm" : "text-gray-600"
                        }`}
                        onClick={() => setView(v as ViewType)}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getChartData(view)}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey={getDataKey(view)}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="bidholi"
                        fill={chartConfig.bidholi.color}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="kandoli"
                        fill={chartConfig.kandoli.color}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartContainer>
          </div>

{/* Doctor Distribution */}
<div>
  <ChartContainer
    title="Doctor Distribution"
    loading={loading}
    className="h-full"
  >
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={doctorData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="patientCount"
          nameKey="name"
          label={false}
        >
          {doctorData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
  layout="vertical"
  align="right"
  verticalAlign="middle"
  content={() => (
    <div className="flex flex-col text-sm">
      {doctorData.map((entry, index) => {
        const percentage = ((entry.patientCount / doctorData.reduce((sum, d) => sum + d.patientCount, 0)) * 100).toFixed(0);
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate max-w-[120px]">
              {entry.name} ({percentage}%)
            </span>
          </div>
        );
      })}
    </div>
  )}
/>

      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
</div>

{/* Residence Distribution */}
<div>
  <ChartContainer
    title="Residence Distribution"
    loading={loading}
    className="h-full"
  >
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={residenceData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="count"
          nameKey="type"
          label={false}
        >
          {residenceData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
  layout="vertical"
  align="right"
  verticalAlign="middle"
  content={() => (
    <div className="flex flex-col gap-2 pl-4 text-sm">
      {residenceData.map((entry, index) => {
        const percentage = ((entry.count / residenceData.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(0);
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate max-w-[120px]">
              {entry.type} ({percentage}%)
            </span>
          </div>
        );
      })}
    </div>
  )}
/>

      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
</div>

          {/* Medicine Distribution */}
          <div className="lg:col-span-2">
            <ChartContainer
              title="Top Medications"
              loading={loading}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={medicineData.slice(0, 10)}
                  margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="medicine"
                    angle={-45}
                    textAnchor="end"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="bidholi"
                    fill={chartConfig.bidholi.color}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="kandoli"
                    fill={chartConfig.kandoli.color}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

         {/* Residence Distribution */}
{/* <div>
  <ChartContainer
    title="Residence Distribution"
    loading={loading}
    className="h-full"
  >
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={residenceData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="count"
          nameKey="type"
          label={false}
        >
          {residenceData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip />}
          wrapperStyle={{
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{
            paddingLeft: 16,
            fontSize: 12,
          }}
          formatter={(value, entry, index) => (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate max-w-[120px]">
                {value} ({((entry.payload?.percent || 0) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
</div> */}

          {/* School Distribution */}
          <div className="lg:col-span-3">
            <ChartContainer
              title="School Distribution"
              loading={loading}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={schoolData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;