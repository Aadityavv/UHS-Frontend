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
  Ambulance,
  AlertCircle,
  Clock,
  Calendar as CalendarIcon,
  Users,
  List,
  BookOpen,
  Activity,
  Syringe,
} from "lucide-react";

const AssistantDoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
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
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/total-patient-count",
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
  }, [toast]); // Add toast to dependencies

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
    { title: "Treatments", value: patientsLeft, icon: <Activity className="h-6 w-6" /> },
  ];

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-4 gap-8"
          >
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Current Time</p>
                    <p className="text-3xl font-bold mt-2 text-white">{formatTime(time)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg text-gray-600 font-semibold">Today's Date</h3>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {date?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-800">
                          {isLoading ? "..." : stat.value}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        {stat.icon}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-4"
              >
                {/* Buttons and navigation sections */}
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-md"
                    onClick={() => navigate("/doctor-check-in-out")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Stethoscope className="h-8 w-8 mb-2 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Doctors Availability</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage doctor schedules</p>
                      </div>
                      <Users className="h-12 w-12 text-gray-200" />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-md"
                    onClick={() => navigate("/medicine-stock")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Pill className="h-8 w-8 mb-2 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Medical Stock</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage inventory levels</p>
                      </div>
                      <ClipboardList className="h-12 w-12 text-gray-200" />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-md"
                  onClick={() => navigate("/patient-list")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <HeartPulse className="h-8 w-8 mb-2 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800">Patient Queue</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage current patient flow</p>
                    </div>
                    <List className="h-12 w-12 text-gray-200" />
                  </div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-md"
                    onClick={() => navigate("/patient-logs")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <BookOpen className="h-8 w-8 mb-2 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Patient Log Book</h3>
                        <p className="text-sm text-gray-600 mt-1">Access historical records</p>
                      </div>
                      <ClipboardList className="h-12 w-12 text-gray-200" />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-md"
                    onClick={() => navigate("/adhoc")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Syringe className="h-8 w-8 mb-2 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Ad-Hoc Treatment</h3>
                        <p className="text-sm text-gray-600 mt-1">Immediate care procedures</p>
                      </div>
                      <Activity className="h-12 w-12 text-gray-200" />
                    </div>
                  </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-md"
                    onClick={() => navigate("/Ambulance")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Ambulance className="h-8 w-8 mb-2 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Ambulance Details</h3>
                        <p className="text-sm text-gray-600 mt-1">Emergency vehicle status</p>
                      </div>
                      <AlertCircle className="h-12 w-12 text-gray-200" />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 cursor-pointer hover:shadow-md"
                    onClick={() => navigate("/Emergency")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <AlertCircle className="h-8 w-8 mb-2 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Emergency Contacts</h3>
                        <p className="text-sm text-gray-600 mt-1">Critical response numbers</p>
                      </div>
                      <HeartPulse className="h-12 w-12 text-gray-200" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AssistantDoctorDashboard;