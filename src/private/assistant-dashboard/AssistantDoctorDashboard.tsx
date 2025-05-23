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
  CalendarIcon,
  Users,
} from "lucide-react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import BreathingExercise from "@/components/BreathingExercise";

const AssistantDoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [time, setTime] = useState<Date>(new Date());
  const [date] = useState<Date | undefined>(new Date());
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const [inQueue, setInQueue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const services = [
    {
      title: "Doctor Availability",
      icon: <Stethoscope className="h-6 w-6 text-blue-600 mb-2" />,
      bgColor: "bg-blue-50",
      navigate: "/doctor-check-in-out",
    },
    {
      title: "Patient Log Book",
      icon: <BookOpen className="h-6 w-6 text-purple-600 mb-2" />,
      bgColor: "bg-purple-50",
      navigate: "/patient-logs",
    },
    {
      title: "Medical Stock",
      icon: <Pill className="h-6 w-6 text-green-600 mb-2" />,
      bgColor: "bg-green-50",
      navigate: "/medicine-stock",
    },
    {
      title: "Medicine Usage",
      icon: <Pill className="h-6 w-6 text-red-600 mb-2" />,
      bgColor: "bg-red-50",
      navigate: "/ad/medicine-usage",
    },
    {
      title: "UHS Analytics",
      icon: <BookOpen className="h-6 w-6 text-yellow-600 mb-2" />,
      bgColor: "bg-yellow-50",
      navigate: "/Analytics-Dashboard",
    },
  ];

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-Specific Elements */}
        {isMobile && (
          <div className="pb-16"> {/* Added padding to prevent bottom nav overlap */}
            {/* Header with time and date */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Time</p>
                  <p className="text-lg font-bold">{formatTime(time)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Today's Date</p>
                  <p className="text-sm">
                    {date?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-4 space-y-4">
              {/* Patient Stats Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Patient Overview</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-md font-bold">{isLoading ? "..." : totalPatients}</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">In Queue</p>
                    <p className="text-md font-bold">{isLoading ? "..." : inQueue}</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Treated</p>
                    <p className="text-md font-bold">{isLoading ? "..." : patientsLeft}</p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions - Larger touch targets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      title: "Patient List",
                      icon: <Users className="h-6 w-6 text-indigo-600" />,
                      bgColor: "bg-indigo-50",
                      action: () => navigate("/patient-list"),
                    },
                    {
                      title: "Doctors",
                      icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
                      bgColor: "bg-blue-50",
                      action: () => navigate("/doctor-check-in-out"),
                    },
                    {
                      title: "Patient Logs",
                      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
                      bgColor: "bg-purple-50",
                      action: () => navigate("/patient-logs"),
                    },
                    {
                      title: "Med Usage",
                      icon: <Pill className="h-6 w-6 text-red-600" />,
                      bgColor: "bg-red-50",
                      action: () => navigate("/medicine-usage"),
                    },
                    {
                      title: "Ad-Hoc",
                      icon: <Syringe className="h-6 w-6 text-green-600" />,
                      bgColor: "bg-green-50",
                      action: () => navigate("/adhoc"),
                    },
                    {
                      title: "Med Stock",
                      icon: <Pill className="h-6 w-6 text-green-600" />,
                      bgColor: "bg-green-50",
                      action: () => navigate("/medicine-stock"),
                    },
                  ].map((feature, index) => (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 ${feature.bgColor} rounded-lg flex flex-col items-center text-center`}
                      onClick={feature.action}
                    >
                      <div className="bg-white p-2 rounded-full mb-2">
                        {feature.icon}
                      </div>
                      <p className="text-sm font-medium">{feature.title}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Emergency Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Emergency</h3>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-red-50 rounded-lg flex flex-col items-center text-center"
                    onClick={() => navigate("/Emergency")}
                  >
                    <div className="bg-white p-2 rounded-full mb-2">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm font-medium">Emergency</p>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-blue-50 rounded-lg flex flex-col items-center text-center"
                    onClick={() => navigate("/Ambulance")}
                  >
                    <div className="bg-white p-2 rounded-full mb-2">
                      <Ambulance className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Ambulance</p>
                  </motion.button>
                </div>
              </motion.div>

              {/* Diagnosis Word Cloud */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Common Diagnoses</h3>
                <DiagnosisWordCloud />
              </motion.div>
            </div>
          </div>
        )}

        {/* Desktop View */}
        {!isMobile && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Sticky Sidebar */}
              <div className="w-full lg:w-72 space-y-6 sticky top-8">
                {/* Sidebar Content */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium mb-1">Current Time</p>
                      <p className="text-xl font-bold">{formatTime(time)}</p>
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
                <BreathingExercise/>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {/* Main Content */}
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
                <motion.div className="rounded-2xl p-6 shadow-md mb-8 bg-white">
                  <div className="grid grid-cols-5 gap-4">
                    {services.map((service) => (
                      <motion.div
                        key={service.title}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 ${service.bgColor} rounded-xl cursor-pointer flex flex-col items-center text-center h-full`}
                        onClick={() => navigate(service.navigate)}
                      >
                        <div className="mb-3">{service.icon}</div>
                        <h3 className="font-semibold mb-1">{service.title}</h3>
                        <p className="text-xs text-gray-600">
                          {service.title === "Doctor Availability"
                            ? "Manage doctor schedules"
                            : service.title === "Patient Log Book"
                            ? "Historical records"
                            : service.title === "Medical Stock"
                            ? "Medicine inventory"
                            : service.title === "Medicine Usage"
                            ? "Track medicine consumption"
                            : "Health Analytics"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Diagnosis Word Cloud */}
                <motion.div>
                  <DiagnosisWordCloud />
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Mobile Bottom Navigation - Fixed at bottom */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
            <BottomNavigation
              showLabels
              sx={{
                bgcolor: "white",
                borderTop: "1px solid #e5e7eb",
                height: "64px",
              }}
            >
              <BottomNavigationAction
                label="Patients"
                icon={<Users className="h-5 w-5 text-indigo-600" />}
                onClick={() => navigate("/patient-list")}
              />
              <BottomNavigationAction
                label="Med Stock"
                icon={<Pill className="h-5 w-5 text-green-600" />}
                onClick={() => navigate("/medicine-stock")}
              />
              <BottomNavigationAction
                label="Emergency"
                icon={<AlertCircle className="h-5 w-5 text-red-600" />}
                onClick={() => navigate("/Emergency")}
              />
              <BottomNavigationAction
                label="Analytics"
                icon={<BookOpen className="h-5 w-5 text-yellow-600" />}
                onClick={() => navigate("/Analytics-Dashboard")}
              />
            </BottomNavigation>
          </div>
        )}
      </div>
    </>
  );
};

export default AssistantDoctorDashboard;