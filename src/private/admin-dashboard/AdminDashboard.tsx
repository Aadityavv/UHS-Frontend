import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  UserPlus,
  Stethoscope,
  Activity,
  Clock,
  ClipboardList,
  HeartPulse,
  Users,
  FileText,
  Settings,
  Bell,
  UserCheck,
  PieChart,
  AlertCircle,
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
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
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
        axios.get("http://localhost:8081/api/admin/stats", { headers }),
        axios.get("http://localhost:8081/api/admin/recentActivities", { headers }),
        axios.get("http://localhost:8081/api/admin/alerts", { headers })
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

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Get alert color based on severity
  const getAlertColor = (severity: Alert['severity']) => {
    switch(severity) {
      case "low": return "bg-blue-100 text-blue-600 border-blue-200";
      case "medium": return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "high": return "bg-red-100 text-red-600 border-red-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {alerts.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-gray-100 text-gray-600 mt-1">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">
                          {activity.performedBy} • {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate("/activity-log")}
                  disabled={loading}
                >
                  View All Activity
                </Button>
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
                  <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton className="h-[100px] w-full rounded-lg" />
                    <Skeleton className="h-[100px] w-full rounded-lg" />
                    <Skeleton className="h-[100px] w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">

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

<motion.div 
  whileHover={{ scale: 1.02 }}
  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer"
  onClick={() => navigate("/admin/logs")}
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
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/alerts")}
                    disabled={loading}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[60px] w-full rounded-lg" />
                    <Skeleton className="h-[60px] w-full rounded-lg" />
                  </div>
                ) : alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div 
                        key={alert.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                      >
                        <div className="p-2 rounded-full mt-1">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium">{alert.title}</h3>
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs mt-1">
                            {formatRelativeTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent alerts</p>
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