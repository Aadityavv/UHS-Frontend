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
  BriefcaseMedical,
  Users,
  UserCheck,
  PieChart,
  Database,
  Loader2,
  Pill,
  CircleX,
  ChevronRight,
  RefreshCw,
  User,
  Box,
  Shield} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";

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

type ThreatLog = {
  id: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  org: string;
  latitude: string;
  longitude: string;
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
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsRes, activityRes, alertsRes, threatLogsRes] = await Promise.all([
        axios.get("https://uhs-backend.onrender.com/api/admin/stats", { headers }),
        axios.get("https://uhs-backend.onrender.com/api/admin/recentActivities", { headers }),
        axios.get("https://uhs-backend.onrender.com/api/admin/alerts", { headers }),
        axios.get("https://uhs-backend.onrender.com/api/admin/threat-logs", { headers })
      ]);
      
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setAlerts(alertsRes.data);
      setThreatLogs(threatLogsRes.data);
      
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

  // Mobile Services - Feature List (for main content area)
  const mobileFeatureList = [
    {
      title: "Prescriptions",
      icon: <HeartPulse className="h-5 w-5 text-purple-600" />,
      action: () => navigate("/admin/patient-logs")
    },
    {
      title: "Medicine Usage",
      icon: <Pill className="h-5 w-5 text-green-600" />,
      action: () => navigate("/admin/medicine-usage")
    },
    {
      title: "Backup & Restore",
      icon: <Database className="h-5 w-5 text-amber-600" />,
      action: () => navigate("/admin/backup")
    },
    {
      title: "Stock Permissions", // Added this option
      icon: <Shield className="h-5 w-5 text-amber-600" />,
      action: () => navigate("/admin/stock-permissions")
    },
    {
      title: "Rejected Appointments",
      icon: <CircleX className="h-5 w-5 text-red-600" />,
      action: () => navigate("/admin/deleted-appointments")
    }
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white p-4 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString("en-US", { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {refreshing ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            ) : (
              <RefreshCw className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">System Overview</h2>
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-blue-600">Patients</p>
                <p className="text-lg font-bold">{stats.totalPatients}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-xs text-purple-600">Appointments</p>
                <p className="text-lg font-bold">{stats.appointmentsToday}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-xs text-red-600">Threats</p>
                <p className="text-lg font-bold">{threatLogs.length}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-4 cursor-pointer"
              onClick={() => navigate("/register-doctor")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <UserPlus className="h-5 w-5 mb-1" />
                  <p className="text-sm font-medium">Add Doctor</p>
                </div>
                <Stethoscope className="h-6 w-6 opacity-70" />
              </div>
            </motion.div>
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 cursor-pointer"
              onClick={() => navigate("/register-assistant-doctor")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <UserPlus className="h-5 w-5 mb-1" />
                  <p className="text-sm font-medium">Add Assistant</p>
                </div>
                <BriefcaseMedical className="h-6 w-6 opacity-70" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature List (Prescriptions, Medicine Usage, etc.) */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Features</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {mobileFeatureList.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action}
                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-xs text-gray-500">
                      {feature.title === "Prescriptions" && "View medical prescriptions"}
                      {feature.title === "Medicine Usage" && "View medicine usage logs"}
                      {feature.title === "Backup & Restore" && "Manage system data"}
                      {feature.title === "Stock Permissions" && "Manage who can edit stock"}
                      {feature.title === "Rejected Appointments" && "View rejected appointments"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Threat Logs */}
        <div className="px-4 mb-16">
          <h2 className="text-lg font-semibold mb-2">Security Alerts</h2>
          <Card>
            <CardContent className="p-4 max-h-[200px] overflow-y-auto">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : threatLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No threats detected</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {threatLogs.slice(0, 3).map((log) => (
                    <li key={log.id} className="py-2 text-xs">
                      <div className="font-medium text-red-500">{log.ip}</div>
                      <div className="text-gray-600">{log.city}, {log.region}</div>
                      <div className="text-gray-400 text-xs">
                        {log.timestamp.replace("T", " ").slice(0, 19)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation (User Management, Stock Management, etc.) */}
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
              label="Users"
              icon={<User className="h-5 w-5 text-blue-600" />}
              onClick={() => navigate("/admin/users")}
            />
            <BottomNavigationAction
              label="Stock"
              icon={<Box className="h-5 w-5 text-green-600" />}
              onClick={() => navigate("/medicine-stock")}
            />
            <BottomNavigationAction
              label="Doctors"
              icon={<Stethoscope className="h-5 w-5 text-cyan-600" />}
              onClick={() => navigate("/admin/manage-doctors")}
            />
            <BottomNavigationAction
              label="Assistants"
              icon={<Shield className="h-5 w-5 text-rose-600" />}
              onClick={() => navigate("/admin/manage-assistants")}
            />
          </BottomNavigation>
        </div>
      </div>
    );
  }

  // Desktop View (unchanged except for adding missing features)
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
                <CardTitle className="text-red-600">⚠️ Unauthorized Access Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {loading ? (
                  <Skeleton className="h-[100px] w-full rounded-lg" />
                ) : threatLogs.length === 0 ? (
                  <p className="text-gray-500">No unauthorized access attempts found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {threatLogs.map((log) => (
                      <li key={log.id} className="py-2 text-sm">
                        <div className="font-medium text-red-500">{log.ip} - {log.city}, {log.region}</div>
                        <div className="text-gray-600">{log.org}</div>
                        <div className="text-gray-500">
                          {log.timestamp.replace("T", " ").slice(0, 19)}
                        </div>
                      </li>
                    ))}
                  </ul>
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
                        <p className="text-sm opacity-90 mt-1">Register medical doctor</p>
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
                        <p className="text-sm opacity-90 mt-1">Register support doctor</p>
                      </div>
                      <BriefcaseMedical className="h-12 w-12 opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">System Management</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {Array(9).fill(null).map((_, i) => (
                      <Skeleton key={i} className="h-[100px] w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "User Management",
                        subtitle: "Manage all users",
                        icon: <Users className="h-5 w-5" />,
                        bg: "bg-blue-100 text-blue-600",
                        route: "/admin/users"
                      },
                      {
                        title: "Stock Management",
                        subtitle: "Manage medical stock",
                        icon: <Pill className="h-5 w-5" />,
                        bg: "bg-green-100 text-green-600",
                        route: "/medicine-stock"
                      },
                      {
                        title: "Stock Permissions",
                        subtitle: "Manage who can edit stock",
                        icon: <Shield className="h-5 w-5" />,
                        bg: "bg-amber-100 text-amber-600",
                        route: "/admin/stock-permissions"
                      },
                      {
                        title: "Manage Doctors",
                        subtitle: "View, edit or remove doctors",
                        icon: <Stethoscope className="h-5 w-5" />,
                        bg: "bg-cyan-100 text-cyan-600",
                        route: "/admin/manage-doctors"
                      },
                      {
                        title: "Manage Assistants",
                        subtitle: "View, edit or remove nursing assistants",
                        icon: <BriefcaseMedical className="h-5 w-5" />,
                        bg: "bg-rose-100 text-rose-600",
                        route: "/admin/manage-assistants"
                      },
                      {
                        title: "Prescriptions",
                        subtitle: "View medical prescriptions",
                        icon: <HeartPulse className="h-5 w-5" />,
                        bg: "bg-purple-100 text-purple-600",
                        route: "/admin/patient-logs"
                      },
                      {
                        title: "Medicine Usage",
                        subtitle: "View medicine usage logs",
                        icon: <ClipboardList className="h-5 w-5" />,
                        bg: "bg-orange-100 text-orange-600",
                        route: "/admin/medicine-usage"
                      },
                      {
                        title: "Backup & Restore",
                        subtitle: "Manage system data",
                        icon: <Database className="h-5 w-5" />,
                        bg: "bg-amber-100 text-amber-600",
                        route: "/admin/backup"
                      },
                      {
                        title: "Rejected Appointments",
                        subtitle: "View Rejected Appointments",
                        icon: <CircleX className="h-5 w-5" />,
                        bg: "bg-red-100 text-red-700",
                        route: "/admin/deleted-appointments"
                      }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg p-5 shadow-md border border-gray-100 cursor-pointer transition-all duration-150"
                        onClick={() => navigate(item.route)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${item.bg}`}>
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.subtitle}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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