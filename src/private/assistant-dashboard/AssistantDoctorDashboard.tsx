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
  ChevronRight,
  Users,
} from "lucide-react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";

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
          
          <>
            {/* Feature List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                <div className="w-full space-y-6">
                {/* Patient Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pb-4">
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
              </div>


                {/* Features List */}
                <div className="bg-white rounded-xl shadow-sm pb-1">
                  {[
                    {
                      title: "Patient List",
                      icon: <Users className="h-5 w-5 text-indigo-600" />,
                      action: () => navigate("/patient-list"),
                    },
                    {
                      title: "Doctor Availability",
                      icon: <Stethoscope className="h-5 w-5 text-blue-600" />,
                      action: () => navigate("/doctor-check-in-out"),
                    },
                    {
                      title: "Patient Log Book",
                      icon: <BookOpen className="h-5 w-5 text-purple-600" />,
                      action: () => navigate("/patient-logs"),
                    },
                    {
                      title: "Ad-Hoc Treatment",
                      icon: <Syringe className="h-5 w-5 text-green-600" />,
                      action: () => navigate("/adhoc"),
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      onClick={feature.action}
                      className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-lg">
                          {feature.icon}
                        </div>
                        <p className="font-medium">{feature.title}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-1">
             
            </div>

                {/* Diagnosis Word Cloud */}
                <div className="mt-0">
                  <DiagnosisWordCloud />
                </div>
              </motion.div>
            </div>

            {/* Sticky Bottom Navigation */}
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
                  label="Emergency"
                  icon={<AlertCircle className="h-5 w-5 text-red-600" />}
                  onClick={() => navigate("/Emergency")}
                />
                <BottomNavigationAction
                  label="Ambulance"
                  icon={<Ambulance className="h-5 w-5 text-blue-600" />}
                  onClick={() => navigate("/Ambulance")}
                />
                <BottomNavigationAction
                  label="Stock"
                  icon={<Pill className="h-5 w-5 text-green-600" />}
                  onClick={() => navigate("/medicine-stock")}
                />
                <BottomNavigationAction
                  label="Analytics"
                  icon={<BookOpen className="h-5 w-5 text-yellow-600" />}
                  onClick={() => navigate("/Analytics-Dashboard")}
                />
              </BottomNavigation>
            </div>

           
          </>
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
                <motion.div className="rounded-2xl p-6 shadow-md mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
                    {services.map((service) => (
                      <motion.div
                        key={service.title}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 ${service.bgColor} rounded-xl cursor-pointer`}
                        onClick={() => navigate(service.navigate)}
                      >
                        {service.icon}
                        <h3 className="font-semibold mb-1">{service.title}</h3>
                        <p className="text-sm text-gray-600">
                          {service.title === "Doctor Availability"
                            ? "Manage doctor schedules"
                            : service.title === "Patient Log Book"
                            ? "Historical records"
                            : "Health Analysis"}
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
      </div>
    </>
  );
};

export default AssistantDoctorDashboard;