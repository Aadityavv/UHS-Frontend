import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Pill,
  ClipboardList,
  HeartPulse,
  Clock,
  Calendar as CalendarIcon,
  Users,
  List,
  BookOpen,
  Activity,
} from "lucide-react";
import Skeleton from "@mui/material/Skeleton";

const AssistantDoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date] = useState<Date | undefined>(new Date());
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const [inQueue, setInQueue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Fetch patient data
  const fetchPatientData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        "https://uhs-backend.onrender.com/api/AD/total-patient-count",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTotalPatients(data.Total_Appointment);
        setPatientsLeft(data.Patients_left);
        setInQueue(data.In_Queue);
      } else {
        console.error("Failed to fetch patient data.");
        toast({
          title: "Fetch Error",
          description: "Failed to fetch patient data. Please try again later.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (error: any) {
      console.error("Error fetching patient data:", error);
      toast({
        title: "Error",
        description: error.message || "Network Error",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and set interval
  useEffect(() => {
    fetchPatientData();
    const interval = setInterval(() => {
      fetchPatientData();
    }, 25000);

    return () => clearInterval(interval);
  }, [toast]);

  // Format time
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
    return `${formattedHours}:${minutes}:${seconds} ${period}`;
  };

  // Stats data
  const stats = [
    { title: "Total Patients", value: totalPatients, icon: <Users className="h-6 w-6" /> },
    { title: "In Queue", value: inQueue, icon: <List className="h-6 w-6" /> },
    { title: "Treated", value: patientsLeft, icon: <Activity className="h-6 w-6" /> },
  ];

  return (
    <div className="min-h-[79vh] overflow-x-hidden bg-gray-50">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4 space-y-6">
            {/* Current Time Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white"
            >
              <h3 className="text-sm font-medium opacity-90 mb-4">Current Time</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold mb-2">{formatTime(time)}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </motion.div>

            {/* Today's Date Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-sm font-medium text-gray-500 mb-4">Today's Date</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {date?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-gray-400" />
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-3 mb-8">
              {stats.map((stat) => (
                <motion.div
                  key={stat.title}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  {isLoading ? (
                    <>
                      <Skeleton variant="text" width={120} height={24} className="mb-4" />
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton variant="text" width={150} height={32} className="mb-2" />
                          <Skeleton variant="text" width={100} height={20} />
                        </div>
                        <Skeleton variant="circular" width={56} height={56} />
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-4">{stat.title}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
                          {stat.icon}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 gap-4 mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md"
                onClick={() => navigate("/doctor-check-in-out")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Stethoscope className="h-8 w-8 mb-2 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">Doctors Availability</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage doctor schedules</p>
                  </div>
                  <Users className="h-12 w-12 text-gray-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md"
                onClick={() => navigate("/medicine-stock")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Pill className="h-8 w-8 mb-2 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">Medical Stock</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage inventory levels</p>
                  </div>
                  <ClipboardList className="h-12 w-12 text-gray-200" />
                </div>
              </motion.div>
            </motion.div>

            {/* Additional Sections */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md"
                onClick={() => navigate("/patient-list")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <HeartPulse className="h-8 w-8 mb-2 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">Patient Queue</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage current patient flow</p>
                  </div>
                  <List className="h-12 w-12 text-gray-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md"
                onClick={() => navigate("/patient-logs")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <BookOpen className="h-8 w-8 mb-2 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">Patient Log Book</h3>
                    <p className="text-sm text-gray-600 mt-1">Access historical records</p>
                  </div>
                  <ClipboardList className="h-12 w-12 text-gray-200" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssistantDoctorDashboard;