import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  UserPlus,
  Stethoscope,
  Clock,
  ClipboardList,
  HeartPulse,
  Users,
  UserCheck,
  PieChart,
  Database,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Types
type SystemStats = {
  totalPatients: number;
  activeSessions: number;
  appointmentsToday: number;
};

type ActivityLog = {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
};

type Alert = {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [, setRecentActivity] = useState<ActivityLog[]>([]);
  const [, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Using Promise.all to fetch multiple endpoints in parallel
      const [statsRes, activityRes, alertsRes] = await Promise.all([
        axios.get("https://uhs-backend.onrender.com/api/admin/stats", { headers }),
        axios.get("https://uhs-backend.onrender.com/api/admin/recentActivities", { headers }),
        axios.get("https://uhs-backend.onrender.com/api/admin/alerts", { headers })
      ]);
      
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setAlerts(alertsRes.data);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
    
    // Set up refresh interval (every 5 minutes)
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
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


  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : "Refresh Data"}
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
                <p className="text-3xl font-bold">{formatTime(time)}</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Sessions</p>
                      {loading ? (
                        <Skeleton className="h-6 w-12" />
                      ) : (
                        <p className="font-semibold">{stats?.activeSessions || 0}</p>
                      )}
                    </div>
                  </div>
                </div> */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Patients</p>
                      {loading ? (
                        <Skeleton className="h-6 w-12" />
                      ) : (
                        <p className="font-semibold">{stats?.totalPatients || 0}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Appointments Today</p>
                      {loading ? (
                        <Skeleton className="h-6 w-12" />
                      ) : (
                        <p className="font-semibold">{stats?.appointmentsToday || 0}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Analytics Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Key Metrics</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/analytics-dashboard")}
                    disabled={loading}
                  >
                    <PieChart className="h-4 w-4 mr-2" /> View Full Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton className="h-[120px] w-full rounded-lg" />
                    <Skeleton className="h-[120px] w-full rounded-lg" />
                    <Skeleton className="h-[120px] w-full rounded-lg" />
                  </div>
                ) : stats ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Total Patients</p>
                          <p className="text-2xl font-bold mt-1">
                            {stats.totalPatients}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">registered patients</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <UserCheck className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    {/* <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-green-600">Active Sessions</p>
                          <p className="text-2xl font-bold mt-1">{stats.activeSessions}</p>
                          <p className="text-xs text-green-500 mt-1">current active sessions</p>
                        </div>
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <Activity className="h-5 w-5" />
                        </div>
                      </div>
                    </div> */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Today's Appointments</p>
                          <p className="text-2xl font-bold mt-1">{stats.appointmentsToday}</p>
                          <p className="text-xs text-purple-500 mt-1">scheduled for today</p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No analytics data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent 
                    className="p-6" 
                    onClick={() => navigate("/register-doctor")}
                  >
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
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent 
                    className="p-6" 
                    onClick={() => navigate("/register-assistant-doctor")}
                  >
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
              </motion.div>
            </div>

            {/* System Management */}
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-[100px] w-full rounded-lg" />
                    <Skeleton className="h-[100px] w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">

<motion.div 
  whileHover={{ scale: 1.02 }}
  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer"
  onClick={() => navigate("/admin/backup")}
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
  onClick={() => navigate("/admin/users")}
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