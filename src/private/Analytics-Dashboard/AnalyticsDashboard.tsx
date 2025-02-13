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
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegendContent,
  ChartLegend,
} from "@/components/ui/chart";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
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
  "#0088FE", // Light Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#E74C3C", // Red
  "#1ABC9C", // Cyan
];

const chartConfig = {
  bidholi: {
    label: "Bidholi",
    theme: {
      light: "#34D399",
      dark: "#34D399",
    },
  },
  kandoli: {
    label: "Kandoli",
    theme: {
      light: "#60A5FA",
      dark: "#60A5FA",
    },
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-600 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-gray-700">
              {entry.name}: {entry.value}
            </span>
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
  const { toast } = useToast();

  const [schoolData, setSchoolData] = useState<Array<SchoolData>>([]);
  const [medicineData, setMedicineData] = useState<Array<MedicineData>>([]);
  const [residenceData, setResidenceData] = useState<Array<ResidenceData>>([]);
  const [doctorData, setDoctorData] = useState<Array<DoctorData>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<MonthlyData>>([]);
  const [yearlyData, setYearlyData] = useState<Array<YearlyData>>([]);
  const [dailyData, setDailyData] = useState<Array<DailyData>>([]);

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

  useEffect(()=>{

    const getAllData = async () => {
      const token = localStorage.getItem("token");
      // Get Total Patient
      try{

        const responseAllPatient = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/geTotalPatient",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        
        if(responseAllPatient.status ===200){
          setTotalPatient(responseAllPatient.data);
        }else{
          return toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description: responseAllPatient?.data?.message ||
              "Error occurred while fetching prescription data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }

      // Get School wise data
      try{
        const responseSchoolWise = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/getSchoolWise",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })

        if(responseSchoolWise.status === 200){

          
          const schoolWiseData = responseSchoolWise.data.map((el:any)=>({
            name:el[0],
            count:el[1]
          }))
          
          setSchoolData(schoolWiseData);
        }else{
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description:
              responseSchoolWise?.data?.message ||
              "Error occurred while fetching data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }

      //Get Top 10 medicine
      try{
        const responseTopMedsPres = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/getTopMeds",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        if(responseTopMedsPres.status === 200){

          const medicineData = transformData(responseTopMedsPres.data);
          
          setMedicineData(medicineData);
        }else{
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description:
              responseTopMedsPres?.data?.message ||
              "Error occurred while fetching data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }

      //Get Data By Residence Type
      try{
        const responseByResType = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/getByResidenceType",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        if(responseByResType.status === 200){
          const formatData = responseByResType.data.map((el:any)=>({
            type:el[0],
            count:el[1]
          }));

          setResidenceData(formatData);
        }else{
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description:
              responseByResType?.data?.message ||
              "Error occurred while fetching data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }

      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }

      //Get Doctor-Wise Distribution
      try{
        const responseDoctorWise = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/getByDoctorName",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        if(responseDoctorWise.status === 200){
          setDoctorData(responseDoctorWise.data);
        }else{
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description:
              responseDoctorWise?.data?.message ||
              "Error occurred while fetching data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }

      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
      
      //Get Patient Visits Monthly
      try{
        const responseMonthlyData = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/getMonthlyData",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        if(responseMonthlyData.status === 200){
          const monthlyData = transformDataMonthly(responseMonthlyData.data);  
          setMonthlyData(monthlyData);
        }else{
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description:
              responseMonthlyData?.data?.message ||
              "Error occurred while fetching data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }

      //Get Patient Visits Yearlys
      try{
        const responseYearlyData = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/getYearlyData",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        if(responseYearlyData.status === 200){
          const yearlyData = transformDataYearly(responseYearlyData.data);  
          setYearlyData(yearlyData);
        }else{
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description:
              responseYearlyData?.data?.message ||
              "Error occurred while fetching data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }

      //Get Daily Data
      try{
        const responseDailyData = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/analytics/getDailyData",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });

        if(responseDailyData.status === 200){
          const DailyData = transformDataDaily(responseDailyData.data);  
          setDailyData(DailyData);
        }else{
          toast({
            variant: "destructive",
            title: "Error Fetching Data",
            description:
              responseDailyData?.data?.message ||
              "Error occurred while fetching data.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }catch(err:any){
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            err.response?.data?.message ||
            "Error occurred while fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }

    }

    getAllData();
  },[]);

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

  const renderPatientVisitsChart = (): ReactElement => (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full p-6 bg-background rounded-lg shadow-md"
      >
        <>
          <h2 className="text-lg font-semibold mb-4">Patient Visits</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData(view)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={getDataKey(view)}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <Tooltip
                  content={CustomTooltip}
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  name="Bidholi"
                  dataKey="bidholi"
                  fill="var(--color-bidholi)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Kandoli"
                  dataKey="kandoli"
                  fill="var(--color-kandoli)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      </ChartContainer>
    </div>
  );

  const renderMedicineChart = (): ReactElement => (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full p-6 bg-background rounded-lg shadow-md"
      >
        <>
          <h2 className="text-lg font-semibold mb-4">
            Top 10 Medicines Prescribed (Current Month)
          </h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={medicineData}
                margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="medicine"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-semibold text-gray-600 mb-2">
                            {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.fill }}
                              />
                              <span className="text-gray-700">
                                {entry.name}: {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  name="Bidholi"
                  dataKey="bidholi"
                  fill="var(--color-bidholi)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Kandoli"
                  dataKey="kandoli"
                  fill="var(--color-kandoli)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      </ChartContainer>
    </div>
  );

  const renderDoctorChart = (): ReactElement => (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full p-6 bg-background rounded-lg shadow-md"
      >
        <>
          <h2 className="text-lg font-semibold mb-4">
            Doctor-wise Patient Distribution
          </h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doctorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="patientCount"
                  nameKey="name"
                >
                  {doctorData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      </ChartContainer>
    </div>
  );

  const renderSchoolChart = (): ReactElement => (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full p-6 bg-background rounded-lg shadow-md"
      >
        <>
          <h2 className="text-lg font-semibold mb-4">
            School-wise Patient Distribution
          </h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schoolData}
                margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                <Bar dataKey="count" fill="#FF8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      </ChartContainer>
    </div>
  );

  const renderResidenceChart = (): ReactElement => (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full p-6 bg-background rounded-lg shadow-md"
      >
        <>
          <h2 className="text-lg font-semibold mb-4">
            Residence-wise Patient Distribution
          </h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={residenceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {residenceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      </ChartContainer>
    </div>
  );

  return (
    <>
    <Toaster />
    <div className="flex flex-col justify-center items-center bg-[#ECECEC] min-h-[84svh] overflow-hidden max-lg:min-h-[93svh] p-8 gap-4">
      <div className="flex items-center justify-start w-full">
        <h1 className="text-lg font-semibold bg-background p-4 rounded-lg shadow-md">
          Total Patient Count : {totalPatient}
        </h1>
      </div>

      {/* Original charts section */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex justify-end gap-2">
          <Button
            variant={view === "daily" ? "default" : "outline"}
            onClick={() => setView("daily")}
          >
            Daily
          </Button>
          <Button
            variant={view === "monthly" ? "default" : "outline"}
            onClick={() => setView("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={view === "yearly" ? "default" : "outline"}
            onClick={() => setView("yearly")}
          >
            Yearly
          </Button>
        </div>
        {renderPatientVisitsChart()}
      </div>

      {/* New charts grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderDoctorChart()}
        {renderResidenceChart()}
        {renderSchoolChart()}
        {renderMedicineChart()}
      </div>
    </div>
    </>
  );
};

export default AnalyticsDashboard;
