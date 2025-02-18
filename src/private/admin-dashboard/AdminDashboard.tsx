import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  UserPlus,
  Stethoscope,
  UserCog,
  Activity,
  Calendar as CalendarIcon,
  Clock,
  ClipboardList,
  HeartPulse,
  Server
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import Skeleton from '@mui/material/Skeleton';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  // Simulated loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Demo data
  const stats = [
    { title: "Total Users", value: "2,845", icon: <UserCog className="h-6 w-6" /> },
    { title: "Active Sessions", value: "143", icon: <Activity className="h-6 w-6" /> },
    // { title: "Pending Requests", value: "27", icon: <ClipboardList className="h-6 w-6" /> },
    { title: "System Health", value: "98%", icon: <Server className="h-6 w-6" /> }
  ];

  const recentActivities = [
    { time: "09:42 AM", action: "New doctor registered", user: "Dr. Smith" },
    { time: "08:15 AM", action: "Nursing assistant added", user: "Sarah Johnson" },
    { time: "Yesterday", action: "System maintenance completed", user: "Admin" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-4 gap-8"
        >
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Time Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
            >
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={120} />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Current Time</p>
                      <p className="text-3xl font-bold mt-2">{formatTime(time)}</p>
                    </div>
                    <Clock className="h-8 w-8 opacity-90" />
                  </div>
                </>
              )}
            </motion.div>

            {/* Calendar */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={300} />
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    <h3 className="text-lg font-semibold item">Admin Calendar</h3>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="border-0"
                  />
                </>
              )}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white cursor-pointer"
                onClick={() => navigate("/register-doctor")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <UserPlus className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-bold">Add New Doctor</h3>
                    <p className="text-sm opacity-90 mt-1">Register medical staff</p>
                  </div>
                  <Stethoscope className="h-12 w-12 opacity-20" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white cursor-pointer"
                onClick={() => navigate("/register-assistant-doctor")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <UserPlus className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-bold">Add Nursing Assistant</h3>
                    <p className="text-sm opacity-90 mt-1">Register support staff</p>
                  </div>
                  <HeartPulse className="h-12 w-12 opacity-20" />
                </div>
              </motion.div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <ClipboardList className="h-5 w-5 mr-2 text-indigo-600" />
                <h3 className="text-lg font-semibold">Recent Activities</h3>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.user}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;