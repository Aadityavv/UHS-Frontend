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
  Server,
  Users,
  FileText,
  Settings,
  Bell,
  UserCheck,
  PieChart,
  AlertCircle,
  Database
} from "lucide-react";
import Skeleton from "@mui/material/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    activeAppointments: 0,
    systemHealth: "optimal"
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Simulated data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalDoctors: 42,
          totalPatients: 1287,
          activeAppointments: 36,
          systemHealth: "optimal"
        });

        setRecentActivity([
          { id: 1, action: "New doctor registered", user: "Dr. Smith", time: new Date(Date.now() - 1000 * 60 * 5) },
          { id: 2, action: "System backup completed", user: "System", time: new Date(Date.now() - 1000 * 60 * 30) },
          { id: 3, action: "Patient record updated", user: "Nurse Johnson", time: new Date(Date.now() - 1000 * 60 * 120) },
          { id: 4, action: "New appointment scheduled", user: "Patient Doe", time: new Date(Date.now() - 1000 * 60 * 180) },
        ]);

        setLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
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
  const formatActivityTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getSystemHealthColor = () => {
    switch(stats.systemHealth) {
      case "optimal": return "bg-green-500";
      case "degraded": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin-settings")}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-4 gap-6"
        >
          {/* Left Sidebar - Stats and Time */}
          <div className="lg:col-span-1 space-y-6">
            {/* Time Card */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">Current Time</CardTitle>
                  <Clock className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton variant="text" width="100%" height={40} />
                ) : (
                  <p className="text-3xl font-bold">{formatTime(time)}</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Doctors</p>
                      {loading ? (
                        <Skeleton variant="text" width={60} height={24} />
                      ) : (
                        <p className="font-semibold">{stats.totalDoctors}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/manage-doctors")}>
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Patients</p>
                      {loading ? (
                        <Skeleton variant="text" width={60} height={24} />
                      ) : (
                        <p className="font-semibold">{stats.totalPatients}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/manage-patients")}>
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Appointments</p>
                      {loading ? (
                        <Skeleton variant="text" width={60} height={24} />
                      ) : (
                        <p className="font-semibold">{stats.activeAppointments}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/appointments")}>
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">System Health</p>
                      {loading ? (
                        <Skeleton variant="text" width={60} height={24} />
                      ) : (
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full ${getSystemHealthColor()} mr-2`}></span>
                          <span className="font-semibold capitalize">{stats.systemHealth}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/system-health")}>
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton variant="circular" width={40} height={40} />
                      <div className="flex-1">
                        <Skeleton variant="text" width="80%" height={20} />
                        <Skeleton variant="text" width="60%" height={16} />
                      </div>
                    </div>
                  ))
                ) : (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-gray-100 text-gray-600 mt-1">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">
                          {activity.user} • {formatActivityTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {!loading && (
                  <Button variant="ghost" className="w-full" onClick={() => navigate("/activity-log")}>
                    View All Activity
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Analytics Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Analytics Overview</CardTitle>
                  <Button variant="outline" onClick={() => navigate("/analytics-dashboard")}>
                    <PieChart className="h-4 w-4 mr-2" /> View Full Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton variant="rectangular" height={120} />
                    <Skeleton variant="rectangular" height={120} />
                    <Skeleton variant="rectangular" height={120} />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Patient Growth</p>
                          <p className="text-2xl font-bold mt-1">+12.5%</p>
                          <p className="text-xs text-blue-500 mt-1">vs last month</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <UserCheck className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-green-600">Appointments</p>
                          <p className="text-2xl font-bold mt-1">84</p>
                          <p className="text-xs text-green-500 mt-1">today</p>
                        </div>
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-purple-600">System Uptime</p>
                          <p className="text-2xl font-bold mt-1">99.98%</p>
                          <p className="text-xs text-purple-500 mt-1">last 30 days</p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Database className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6" onClick={() => navigate("/register-doctor")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <UserPlus className="h-8 w-8 mb-3" />
                      <h3 className="text-xl font-bold">Add New Doctor</h3>
                      <p className="text-sm opacity-90 mt-1">Register medical staff</p>
                    </div>
                    <Stethoscope className="h-12 w-12 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6" onClick={() => navigate("/register-assistant-doctor")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <UserPlus className="h-8 w-8 mb-3" />
                      <h3 className="text-xl font-bold">Add Nursing Assistant</h3>
                      <p className="text-sm opacity-90 mt-1">Register support staff</p>
                    </div>
                    <HeartPulse className="h-12 w-12 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Management */}
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton variant="rectangular" height={100} />
                    <Skeleton variant="rectangular" height={100} />
                    <Skeleton variant="rectangular" height={100} />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/backup-restore")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Backup & Restore</h3>
                          <p className="text-sm text-gray-500">Manage system data</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/user-management")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">User Management</h3>
                          <p className="text-sm text-gray-500">Manage all users</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/system-logs")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">System Logs</h3>
                          <p className="text-sm text-gray-500">View system activity</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Alerts</CardTitle>
                  <Button variant="ghost" onClick={() => navigate("/alerts")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton variant="rectangular" height={60} />
                    <Skeleton variant="rectangular" height={60} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mt-1">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">Storage Usage High</h3>
                        <p className="text-sm text-gray-500">Database storage is at 85% capacity</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600 mt-1">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">New Feature Available</h3>
                        <p className="text-sm text-gray-500">Update to version 2.3.0</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;