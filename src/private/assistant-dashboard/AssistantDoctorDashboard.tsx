import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
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
  Syringe
} from "lucide-react";

const AssistantDoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const [inQueue, setInQueue] = useState(0);

  // Keep existing useEffect hooks and data fetching logic

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const stats = [
    { title: "Total Patients", value: totalPatients, icon: <Users className="h-6 w-6" /> },
    { title: "In Queue", value: inQueue, icon: <List className="h-6 w-6" /> },
    { title: "Treatments", value: patientsLeft, icon: <Activity className="h-6 w-6" /> }
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
                  {date?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </motion.div>

              {/* <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                />
              </motion.div> */}
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
                        <p className="text-2xl font-bold mt-1 text-gray-800">{stat.value}</p>
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