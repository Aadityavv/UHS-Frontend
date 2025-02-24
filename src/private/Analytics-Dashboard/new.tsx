import { useState, ReactElement, useEffect } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import Skeleton from '@mui/material/Skeleton';

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
  "#4f46e5", "#818cf8", "#34d399", "#fbbf24", "#f87171", "#60a5fa"
];

const chartConfig = {
  bidholi: { label: "Bidholi", color: "#4f46e5" },
  kandoli: { label: "Kandoli", color: "#818cf8" }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-600 mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-gray-700">{entry.name}: {entry.value}</span>
          </div>
        ))}
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

  // Dummy Data
  const [schoolData, setSchoolData] = useState<SchoolData[]>([
    { name: "School of Engineering", count: 120 },
    { name: "School of Business", count: 90 },
    { name: "School of Law", count: 60 },
    { name: "School of Health Sciences", count: 45 },
  ]);

  const [medicineData, setMedicineData] = useState<MedicineData[]>([
    { medicine: "Paracetamol", bidholi: 50, kandoli: 30 },
    { medicine: "Ibuprofen", bidholi: 40, kandoli: 25 },
    { medicine: "Amoxicillin", bidholi: 35, kandoli: 20 },
    { medicine: "Cetirizine", bidholi: 30, kandoli: 15 },
  ]);

  const [residenceData, setResidenceData] = useState<ResidenceData[]>([
    { type: "Hostel", count: 200 },
    { type: "Day Scholar", count: 150 },
    { type: "Off-Campus", count: 100 },
  ]);

  const [doctorData, setDoctorData] = useState<DoctorData[]>([
    { name: "Dr. Smith", patientCount: 80 },
    { name: "Dr. Johnson", patientCount: 60 },
    { name: "Dr. Williams", patientCount: 50 },
    { name: "Dr. Brown", patientCount: 40 },
  ]);

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([
    { month: "Jan", bidholi: 100, kandoli: 80 },
    { month: "Feb", bidholi: 120, kandoli: 90 },
    { month: "Mar", bidholi: 110, kandoli: 85 },
    { month: "Apr", bidholi: 130, kandoli: 95 },
  ]);

  const [yearlyData, setYearlyData] = useState<YearlyData[]>([
    { year: "2021", bidholi: 1000, kandoli: 800 },
    { year: "2022", bidholi: 1200, kandoli: 900 },
    { year: "2023", bidholi: 1100, kandoli: 850 },
  ]);

  const [dailyData, setDailyData] = useState<DailyData[]>([
    { day: "Mon", bidholi: 20, kandoli: 15 },
    { day: "Tue", bidholi: 25, kandoli: 18 },
    { day: "Wed", bidholi: 22, kandoli: 16 },
    { day: "Thu", bidholi: 30, kandoli: 20 },
    { day: "Fri", bidholi: 28, kandoli: 19 },
    { day: "Sat", bidholi: 15, kandoli: 10 },
    { day: "Sun", bidholi: 10, kandoli: 5 },
  ]);

  useEffect(() => {
    // Simulate API call with dummy data
    setTimeout(() => {
      setTotalPatient(5000); // Dummy total patient count
      setLoading(false);
    }, 1000);
  }, []);

  const renderChartSkeleton = () => (
    <Skeleton variant="rectangular" height={400} className="rounded-2xl" />
  );

  const renderPatientVisitsChart = () => {
    const data = {
      daily: dailyData,
      monthly: monthlyData,
      yearly: yearlyData
    }[view];

    if (loading) return renderChartSkeleton();
    if (!data?.length) return <div className="text-center p-8">No data available</div>;

    return (
      <ChartContainer title="Patient Visits" config={chartConfig}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={view} tickLine={false} axisLine={false} />
            <YAxis />
            <Tooltip content={CustomTooltip} />
            <Legend />
            <Bar dataKey="bidholi" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="kandoli" fill="#818cf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  const renderPieChart = (data: any[], dataKey: string, nameKey: string, title: string) => {
    if (loading) return renderChartSkeleton();
    if (!data?.length) return <div className="text-center p-8">No data available</div>;

    return (
      <ChartContainer title={title} config={chartConfig}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, value, percent }) => 
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  const renderBarChart = (data: any[], xKey: string, title: string) => {
    if (loading) return renderChartSkeleton();
    if (!data?.length) return <div className="text-center p-8">No data available</div>;

    return (
      <ChartContainer title={title} config={chartConfig}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
            <Bar dataKey="count" fill="#FF8042" radius={[4, 4, 0, 0]} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="bg-indigo-500 rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-white">
            {loading ? (
              <Skeleton width={300} height={32} />
            ) : (
              `Total Patients: ${totalPatient.toLocaleString()}`
            )}
          </h1>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">View By:</h2>
              <div className="flex gap-2">
                {(["daily", "monthly", "yearly"] as ViewType[]).map((v) => (
                  <Button
                    key={v}
                    variant={view === v ? "default" : "outline"}
                    onClick={() => setView(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {renderPatientVisitsChart()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {renderPieChart(doctorData, 'patientCount', 'name', 'Doctor Distribution')}
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {renderPieChart(residenceData, 'count', 'type', 'Residence Distribution')}
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {renderBarChart(schoolData, 'name', 'School Distribution')}
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {loading ? renderChartSkeleton() : (
                <ChartContainer 
                  title="Top Medicines" 
                  config={chartConfig}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={medicineData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="medicine" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bidholi" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="kandoli" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;