import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import DiagnosisWordCloud from "@/components/DiagnosisWordCloud";
import {
  Stethoscope,
  Pill,
  HeartPulse,
  Ambulance,
  AlertCircle,
  Clock,
  BookOpen,
  Syringe,
  CalendarIcon
} from "lucide-react";

const AssistantDoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date] = useState<Date | undefined>(new Date());
    const [totalPatients, setTotalPatients] = useState(0);
    const [patientsLeft, setPatientsLeft] = useState(0);
    const [inQueue, setInQueue] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const fetchPatientData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        "https://uhs-backend.onrender.com//api/AD/total-patient-count",
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

  useEffect(() => {
    fetchPatientData();
    const interval = setInterval(() => {
      fetchPatientData();
    }, 25000);

    return () => clearInterval(interval);
  }, [toast]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
    return `${formattedHours}:${minutes}:${seconds} ${period}`;
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-8"
          >
            {/* Left Sidebar - Narrow Version */}
            <div className="w-full lg:w-72 space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium mb-1">Current Time</p>
                    <p className="text-xl font-bold">{formatTime(time)}
                    </p>
                  </div>
                  <Clock className="h-6 w-6" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-md font-semibold">Today's Date</h3>
                </div>
                <p className="text-xs text-gray-600">
                  {date?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </motion.div>
              <motion.div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Patient Overview</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Patients</p>
                    <p className="text-md font-medium">{isLoading ? "..." : totalPatients}</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">In Queue</p>
                    <p className="text-md font-medium">{isLoading ? "..." : inQueue}</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Treated</p>
                    <p className="text-md font-medium">{isLoading ? "..." : patientsLeft}</p>
                  </div>
                </div>
              </motion.div>
{/* Emergency Section */}
<div className="grid md:grid-cols-1 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => navigate("/Emergency")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency Contacts</h3>
                      <p className="text-sm text-gray-600">Critical response numbers</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => navigate("/Ambulance")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Ambulance className="h-6 w-6 text-blue-600 mb-2" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Ambulance Details</h3>
                      <p className="text-sm text-gray-600">Emergency vehicle status</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Top Cards - Increased Height */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">  

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white cursor-pointer min-h-[180px] flex flex-col justify-between"
                  onClick={() => navigate("/patient-list")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold mb-2">{inQueue}</p>
                      <div className="text-sm opacity-90">Patients in Queue</div>
                    </div>
                    <HeartPulse className="h-10 w-10" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white cursor-pointer min-h-[180px] flex flex-col justify-between"
                  onClick={() => navigate("/adhoc")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Ad-Hoc Treatment</h3>
                      <p className="text-sm opacity-90">Immediate care procedures</p>
                    </div>
                    <Syringe className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
              </div>

              {/* Services Grid */}
              <motion.div className=" rounded-2xl p-6 shadow-md  mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-blue-50 rounded-xl cursor-pointer"
                    onClick={() => navigate("/doctor-check-in-out")}
                  >
                    <Stethoscope className="h-6 w-6 text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-1">Doctor Availability</h3>
                    <p className="text-sm text-gray-600">Manage doctor schedules</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-green-50 rounded-xl cursor-pointer"
                    onClick={() => navigate("/medicine-stock")}
                  >
                    <Pill className="h-6 w-6 text-green-600 mb-2" />
                    <h3 className="font-semibold mb-1">Medical Stock</h3>
                    <p className="text-sm text-gray-600">Manage inventory levels</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-purple-50 rounded-xl cursor-pointer"
                    onClick={() => navigate("/patient-logs")}
                  >
                    <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
                    <h3 className="font-semibold mb-1">Patient Log Book</h3>
                    <p className="text-sm text-gray-600">Historical records</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-yellow-50 rounded-xl cursor-pointer"
                    onClick={() => navigate("/Analytics-Dashboard")}
                  >
                    <BookOpen className="h-6 w-6 text-yellow-600 mb-2" />
                    <h3 className="font-semibold mb-1">UHS Analytics</h3>
                    <p className="text-sm text-gray-600">Health Analysis</p>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div>
    <DiagnosisWordCloud />
  </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AssistantDoctorDashboard;