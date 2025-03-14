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
import { motion } from "framer-motion";
import Skeleton from '@mui/material/Skeleton';
import { 
  Users,
  Calendar,
  Stethoscope,
  Home,
  Pill,
  School
} from 'lucide-react';

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
  "#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"
];

const chartConfig = {
  bidholi: { label: "Bidholi", color: "#6366f1" },
  kandoli: { label: "Kandoli", color: "#8b5cf6" }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-700 backdrop-blur-sm">
        <p className="font-semibold text-gray-100 mb-1">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-gray-300">{entry.name}: {entry.value}</span>
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
  useToast();

  const [schoolData] = useState<SchoolData[]>([
    { name: "School of Engineering", count: 120 },
    { name: "School of Business", count: 90 },
    { name: "School of Law", count: 60 },
    { name: "School of Health Sciences", count: 45 },
  ]);

  const [medicineData] = useState<MedicineData[]>([
    { medicine: "Paracetamol", bidholi: 50, kandoli: 30 },
    { medicine: "Ibuprofen", bidholi: 40, kandoli: 25 },
    { medicine: "Amoxicillin", bidholi: 35, kandoli: 20 },
    { medicine: "Cetirizine", bidholi: 30, kandoli: 15 },
  ]);

  const [residenceData] = useState<ResidenceData[]>([
    { type: "Hostel", count: 200 },
    { type: "Day Scholar", count: 150 },
    { type: "Off-Campus", count: 100 },
  ]);

  const [doctorData] = useState<DoctorData[]>([
    { name: "Dr. Smith", patientCount: 80 },
    { name: "Dr. Johnson", patientCount: 60 },
    { name: "Dr. Williams", patientCount: 50 },
    { name: "Dr. Brown", patientCount: 40 },
  ]);

  const [monthlyData] = useState<MonthlyData[]>([
    { month: "Jan", bidholi: 100, kandoli: 80 },
    { month: "Feb", bidholi: 120, kandoli: 90 },
    { month: "Mar", bidholi: 110, kandoli: 85 },
    { month: "Apr", bidholi: 130, kandoli: 95 },
  ]);

  const [yearlyData] = useState<YearlyData[]>([
    { year: "2021", bidholi: 1000, kandoli: 800 },
    { year: "2022", bidholi: 1200, kandoli: 900 },
    { year: "2023", bidholi: 1100, kandoli: 850 },
  ]);

  const [dailyData] = useState<DailyData[]>([
    { day: "Mon", bidholi: 20, kandoli: 15 },
    { day: "Tue", bidholi: 25, kandoli: 18 },
    { day: "Wed", bidholi: 22, kandoli: 16 },
    { day: "Thu", bidholi: 30, kandoli: 20 },
    { day: "Fri", bidholi: 28, kandoli: 19 },
    { day: "Sat", bidholi: 15, kandoli: 10 },
    { day: "Sun", bidholi: 10, kandoli: 5 },
  ]);

  useEffect(() => {
    setTimeout(() => {
      setTotalPatient(5000);
      setLoading(false);
    }, 1000);
  }, []);

  const renderChartSkeleton = () => (
    <Skeleton variant="rectangular" height={400} className="rounded-xl" />
  );

  const renderChartHeader = (icon: ReactElement, title: string) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-gray-700">{title}</h2>
    </div>
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
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="15%"
          >
            <defs>
              <linearGradient id="bidholiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="kandoliGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e5e7eb"
            />
            
            <XAxis 
              dataKey={view} 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 14 }}
              padding={{ left: 20, right: 20 }}
              tickMargin={12}
            />
            
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 14 }}
              width={80}
            />
            
            <Tooltip 
              content={CustomTooltip}
              cursor={{ fill: '#f3f4f6', radius: 8 }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => (
                <span className="text-gray-600 text-sm font-medium">
                  {chartConfig[value as keyof typeof chartConfig].label}
                </span>
              )}
              iconType="circle"
              iconSize={12}
            />
            
            <Bar 
              dataKey="bidholi" 
              fill="url(#bidholiGrad)"
              radius={[6, 6, 0, 0]}
              barSize={32}
              animationBegin={100}
              animationDuration={400}
            />
            
            <Bar 
              dataKey="kandoli" 
              fill="url(#kandoliGrad)"
              radius={[6, 6, 0, 0]}
              barSize={32}
              animationBegin={150}
              animationDuration={400}
            />
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
            <defs>
              {data.map((_, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                  <radialGradient 
                    id={`pieGrad${index}`}
                    key={index}
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="50%"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.7
                    }/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.4}/>
                  </radialGradient>
                );
              })}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, value, percent }) => 
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={`url(#pieGrad${index})`} />
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
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey={xKey} 
              angle={-45} 
              textAnchor="end" 
              height={60}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip content={CustomTooltip} />
            <Bar 
              dataKey="count" 
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]} 
              barSize={24}
            />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-gray-600 text-sm">{value}</span>
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  const renderMedicationChart = () => (
    <ChartContainer title="Top Medicines" config={chartConfig}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={medicineData} 
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="bidholiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="kandoliGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="medicine" 
            angle={-45} 
            textAnchor="end" 
            height={60}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip content={CustomTooltip} />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span className="text-gray-600 text-sm">{value}</span>
            )}
          />
          <Bar 
            dataKey="bidholi" 
            fill="url(#bidholiGrad)"
            radius={[6, 6, 0, 0]} 
            barSize={24}
          />
          <Bar 
            dataKey="kandoli" 
            fill="url(#kandoliGrad)"
            radius={[6, 6, 0, 0]} 
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-100/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {loading ? (
                <Skeleton width={300} height={32} style={{ backgroundColor: '#ffffff20' }} />
              ) : (
                `Total Patients: ${totalPatient.toLocaleString()}`
              )}
            </h1>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-700">Time-based Analysis</h2>
              </div>
              <div className="flex gap-2">
                {(["daily", "monthly", "yearly"] as ViewType[]).map((v) => (
                  <Button
                    key={v}
                    variant={view === v ? "default" : "outline"}
                    className="rounded-full px-4 shadow-sm"
                    onClick={() => setView(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {renderPatientVisitsChart()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {renderChartHeader(<Stethoscope className="w-5 h-5" />, "Doctor Performance")}
              {renderPieChart(doctorData, 'patientCount', 'name', 'Doctor Distribution')}
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {renderChartHeader(<Home className="w-5 h-5" />, "Residence Statistics")}
              {renderPieChart(residenceData, 'count', 'type', 'Residence Distribution')}
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {renderChartHeader(<School className="w-5 h-5" />, "School-wise Distribution")}
              {renderBarChart(schoolData, 'name', 'School Distribution')}
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {renderChartHeader(<Pill className="w-5 h-5" />, "Medication Usage")}
              {loading ? renderChartSkeleton() : renderMedicationChart()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;