import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DiagnosisWordCloud from "@/components/DiagnosisWordCloud";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import Skeleton from '@mui/material/Skeleton';
import { AlertCircle, Stethoscope, ChevronRight, LogOut } from "lucide-react";

const DoctorDashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const [token, setToken] = useState("No Patient Assigned");
  const [inQueue, setInQueue] = useState(0);
  const [status, setStatus] = useState<"check-in" | "check-out" | "Available" | "Not Available">("check-out");
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await fetch(
        "https://uhs-backend.onrender.com/api/doctor/total-patient-count",
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
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch patient data.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        console.error("Failed to fetch patient data:", errorData);
      }
    } catch (error: any) {
      toast({
        title: "Network Error",
        description:
          error.response?.data?.message ||
          "Failed to fetch patient data due to a network error.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      if (
        !(localStorage.getItem("latitude") || localStorage.getItem("longitude"))
      ) {
        toast({
          title: "Location Error",
          description: "Allow Location Services.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        return;
      }

      const response = await axios.get(
        "https://uhs-backend.onrender.com/api/doctor/setStatus?isDoctorCheckIn=true",
        {
          headers: {
            Authorization: "Bearer " + token,
            "X-Latitude": localStorage.getItem("latitude"),
            "X-Longitude": localStorage.getItem("longitude"),
          },
        }
      );
      if (response.status === 200) {
        setStatus("Available");
        toast({
          title: "Success",
          description: "Doctor checked in successfully.",
        });
      } else {
        const errorData = await response.data();
        toast({
          title: "Error",
          description: errorData.message || "Failed to check in.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Error during check-in. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error("Error during check-in:", error);
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await fetch(
        "https://uhs-backend.onrender.com/api/doctor/setStatus?isDoctorCheckIn=false",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      if (response.ok) {
        setStatus("Not Available");
        toast({
          title: "Success",
          description: "Doctor checked out successfully.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to check out.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Error during check-out. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error("Error during check-out:", error);
    }
  };

  const fetchTokenNum = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const response = await axios.get(
      "https://uhs-backend.onrender.com/api/doctor/getCurrentToken",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status == 200) {
      setToken(response.data);
    } else {
      setToken("No Patient Assigned");
      toast({
        title: "Error",
        description: response.data.message,
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const fetchDoctorStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const response = await axios.get(
      "https://uhs-backend.onrender.com/api/doctor/getStatus",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status == 200) {
      if (response.data) {
        setStatus("Available");
      } else if (response) {
        setStatus("Not Available");
      }
    } else {
      setToken("No Patient Assigned");
      toast({
        title: "Error",
        description: response.data.message,
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    fetchPatientData();
    fetchTokenNum();
    fetchDoctorStatus();

    const interval = setInterval(() => {
      fetchPatientData();
    }, 20000); // Refresh every 20 seconds

    const tokenInterval = setInterval(() => {
      fetchTokenNum();
    }, 20000); // Refresh every 20 seconds

    const statusInterval = setInterval(() => {
      fetchDoctorStatus();
    }, 20000); // Refresh every 20 seconds

    return () => {
      clearInterval(interval);
      clearInterval(tokenInterval);
      clearInterval(statusInterval);
    };
  }, []);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        {isMobile ? (
          <>
            {/* Mobile Top Bar */}
            <div
  className={`fixed top-0 left-0 right-0 bg-white shadow-sm z-50 ${
    token === "No Patient Assigned" ? "pt-4" : "pt-4"
  } px-4 pb-2`}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-indigo-100 p-2 rounded-lg">
        <Stethoscope className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <p className="font-medium">Doctor Dashboard</p>
        <p className="text-sm text-gray-500">
          {status === "Available" ? "Available" : "Not Available"}
        </p>
      </div>
    </div>
    {token !== "No Patient Assigned" && (
      <div className="text-right">
        <p className="text-xl font-bold">{token}</p>
        <p className="text-xs text-gray-500">Token Assigned</p>
      </div>
    )}
  </div>
</div>

            {/* Mobile Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">Total Patients</p>
                    <p className="text-2xl font-bold">{totalPatients}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">Patients Treated</p>
                    <p className="text-2xl font-bold">{patientsLeft}</p>
                  </div>
                </div>

                {/* Check In/Out Buttons */}
                <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
                  <button
                    onClick={handleCheckIn}
                    className={`p-3 rounded-full shadow-lg ${
                      status === "Available"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500"
                    } text-white`}
                    style={{ width: '56px', height: '56px' }}
                  >
                    <Stethoscope className="h-6 w-6 mx-auto" />
                  </button>
                  <button
                    onClick={handleCheckOut}
                    className={`p-3 rounded-full shadow-lg ${
                      status === "Not Available"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-500"
                    } text-white`}
                    style={{ width: '56px', height: '56px' }}
                  >
                    <AlertCircle className="h-6 w-6 mx-auto" />
                  </button>
                </div>

                {/* Features List */}
                <div className="bg-white rounded-xl shadow-sm">
  {[
    { 
      title: "Patient Details",
      icon: <Stethoscope className="h-5 w-5 text-indigo-600" />,
      action: () => navigate("/patient-details")
    },
  ].map((feature, index) => (
    <div 
      key={index}
      onClick={feature.action}
      className={`flex items-center justify-between rounded-xl p-4 mt-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
        token !== "No Patient Assigned" ? "bg-green-500" : "bg-indigo-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          token !== "No Patient Assigned" ? "bg-green-50" : "bg-indigo-50"
        }`}>
          {feature.icon}
        </div>
        <p className="font-medium">{feature.title}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-black-400" />
    </div>
  ))}
</div>

                {/* Diagnosis Word Cloud */}
                <div className="mt-0">
                  <DiagnosisWordCloud />
                </div>
              </motion.div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
              <div className="grid grid-cols-4 gap-1 p-2">
                <button 
                  onClick={() => navigate("/analytics-dashboard")}
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-indigo-600"
                >
                  <Stethoscope className="h-5 w-5" />
                  <span className="text-xs mt-1">Analytics</span>
                </button>
                <button 
                  onClick={() => navigate("/medicine-stock")}
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-indigo-600"
                >
                  <Stethoscope className="h-5 w-5" />
                  <span className="text-xs mt-1">Stock</span>
                </button>
                <button 
                  onClick={() => navigate("/emergency")}
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-indigo-600"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-xs mt-1">Emergency</span>
                </button>
                <button 
                  onClick={handleLogout} // Updated to use handleLogout
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-indigo-600"
                >
                  <LogOut className="h-5 w-5" /> {/* Added LogOut icon */}
                  <span className="text-xs mt-1">Logout</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop View */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-8"
              >
                {/* Left Sidebar */}
                <div className="w-full lg:w-1/4 space-y-6">
                  {/* Status Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton variant="text" width={120} height={24} className="mb-4" />
                        <div className="flex items-center justify-between">
                          <div>
                            <Skeleton variant="text" width={150} height={32} className="mb-2" />
                            <Skeleton variant="text" width={100} height={20} />
                          </div>
                          <Skeleton variant="circular" width={56} height={56} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium text-gray-500 mb-4">Current Status</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold mb-2">
                              {status === "Available" ? "Available" : "Not Available"}
                            </p>
                            <div className="text-sm opacity-90">
                              {status === "Available" ? "Ready to see patients" : "Not available for appointments"}
                            </div>
                          </div>
                          <div className="bg-white/10 p-4 rounded-xl">
                            <Stethoscope className="h-8 w-8" />
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <button
                      onClick={handleCheckIn}
                      className={`w-full flex items-center justify-between p-4 rounded-xl ${
                        status === "Available"
                          ? "bg-gray-800 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#2FC800] to-[#009534] hover:bg-green-600"
                      } text-white font-medium`}
                      disabled={status === "Available"}
                    >
                      <span>{status === "Available" ? "Available" : "Check-In"}</span>
                      <Stethoscope className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCheckOut}
                      className={`w-full flex items-center justify-between p-4 rounded-xl ${
                        status === "Not Available"
                          ? "bg-gray-800 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#A00000] to-[#E00000] hover:bg-red-600"
                      } text-white font-medium`}
                      disabled={status === "Not Available"}
                    >
                      <span>{status === "Not Available" ? "Not Available" : "Check-Out"}</span>
                      <AlertCircle className="h-5 w-5" />
                    </button>
                  </motion.div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  {/* Status Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer ${
                        token !== "No Patient Assigned" ? "bg-gradient-to-r from-green-500 to-green-500" : "bg-gradient-to-r from-indigo-500 to-indigo-600"
                      }`}
                      onClick={() => navigate("/patient-details")}
                    >
                      <h3 className={`text-lg font-semibold ${
                        token !== "No Patient Assigned" ? "text-gray-900" : "text-gray-100"
                      } mb-4`}>Patient Details</h3>
                      <p className={`text-sm ${
                        token !== "No Patient Assigned" ? "text-gray-600" : "text-gray-100"
                      }`}>View and manage patient details.</p>

                      <p className={`text-sm ${
                        token !== "No Patient Assigned" ? "text-gray-600" : "text-gray-100"
                      }`}>Token: {token}.</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white"
                    >
                      {loading ? (
                        <>
                          <Skeleton variant="text" width={120} height={24} className="mb-4 bg-indigo-400" />
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Skeleton variant="text" width="100%" height={40} className="bg-indigo-400" />
                              <Skeleton variant="text" width="100%" height={40} className="bg-indigo-400" />
                              <Skeleton variant="text" width="100%" height={40} className="bg-indigo-400" />
                              <Skeleton variant="text" width="100%" height={40} className="bg-indigo-400" />
                            </div>
                            <Skeleton variant="circular" width={56} height={56} className="bg-indigo-400" />
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold opacity-90 mb-2">Patients Overview</h3>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 grid grid-cols-4 gap-2">
                              <div>
                                <p className="text-lg font-bold">{inQueue}</p>
                                <p className="text-sm opacity-90">In Queue</p>
                              </div>
                              <div className="bg-white/10 p-2 rounded-lg">
                                <p className="text-lg font-bold">{totalPatients}</p>
                                <p className="text-xs opacity-90">Total Patients</p>
                              </div>
                              <div className="bg-white/10 p-2 rounded-lg">
                                <p className="text-lg font-bold">{patientsLeft}</p>
                                <p className="text-xs opacity-90">Patients Treated</p>
                              </div>
                              <div className="bg-white/10 p-2 rounded-lg">
                                <p className="text-lg font-bold">{token}</p>
                                <p className="text-xs opacity-90">Current Token</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Additional Features */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/medicine-stock")}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Stock</h3>
                      <p className="text-sm text-gray-600">Check and manage medical stock.</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/analytics-dashboard")}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">UHS Analysis</h3>
                      <p className="text-sm text-gray-600">View analytics and reports.</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/ambulance")}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ambulance Details</h3>
                      <p className="text-sm text-gray-600">Manage ambulance services.</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer"
                      onClick={() => navigate("/emergency")}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
                      <p className="text-sm text-gray-600">Access emergency contact information.</p>
                    </motion.div>
                  </motion.div>

                  {/* Diagnosis Word Cloud */}
                  <DiagnosisWordCloud />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DoctorDashboard;