import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Stethoscope,
  Calendar as CalendarIcon,
  Clock,
  HeartPulse,
} from "lucide-react";
import Skeleton from "@mui/material/Skeleton";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState<Date>(new Date());
  const [date] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  

  // Simulated loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Format activity time
  // const formatActivityTime = (timestamp: string) => {
  //   const date = new Date(timestamp);
  //   return date.toLocaleTimeString("en-US", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  // };


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

            {/* Date Display */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={120} />
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    <h3 className="text-lg text-gray-500 font-semibold item">Today's Date</h3>
                  </div>
                  <p className="text-lg font-bold">
                    {date?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </>
              )}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
          <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/analytics-dashboard")}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">UHS Analysis</h3>
                      <p className="text-sm text-gray-600">View analytics and reports.</p>
                    </motion.div>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;