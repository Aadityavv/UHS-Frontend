import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import Skeleton from '@mui/material/Skeleton'; // Import Skeleton from Material-UI
import { 
  AlertCircle,
  ClipboardList,
  Stethoscope
} from "lucide-react";
// import { Calendar } from "@/components/ui/calendar"; // Added Calendar import

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const [token, setToken] = useState("No Patient Assigned");
  const [inQueue, setInQueue] = useState(0);
  const [status, setStatus] = useState<
    "check-in" | "check-out" | "Available" | "Not Available"
  >("check-out");
  const [loading, setLoading] = useState(true);
  // const [appointmentReasons, setAppointmentReasons] = useState<{ [key: string]: number }>({});

  const appointmentReasons = {
    "Vaccination": 10,
    "Eye Exam": 6,
    "Blood Test": 5,
    "Routine Checkup": 15,
    "Physical Therapy": 4,
    "Dental Cleaning": 8,
    "Skin Check": 3,
    "Allergy Consultation": 2,
    "Follow-up Visit": 7,
    "Emergency Visit": 1,
  };
  
  

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
      } else if(response) {
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

  const fetchAppointmentReasons = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const response = await axios.get(
          "https://uhs-backend.onrender.com/api/doctor/appointment-reasons",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.status === 200) {
          setAppointmentReasons(response.data);
        }
      } catch (error) {
        console.error("Error fetching appointment reasons:", error);
      }
    };

  useEffect(() => {
    fetchPatientData();
    fetchTokenNum();
    fetchDoctorStatus();
    fetchAppointmentReasons();

    const interval = setInterval(() => {
      fetchPatientData();
    }, 30000);

    const tokenInterval = setInterval(() => {
      fetchTokenNum();
    }, 30000);

    const statusInterval = setInterval(() => {
      fetchDoctorStatus();
    }, 30000); 

    const reasonsInterval = setInterval(fetchAppointmentReasons, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(tokenInterval);
      clearInterval(statusInterval);
      clearInterval(reasonsInterval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
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

              {/* Calendar */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border bg-white shadow-lg"
                />
              </motion.div> */}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Status Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer bg-gradient-to-r from-indigo-500 to-indigo-600"
                  onClick={() => navigate("/patient-details")}
                >
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 ">Patient Details</h3>
                  <p className="text-sm text-gray-100">View and manage patient details.</p>
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
            <p className="text-2xl font-bold">{inQueue}</p>
            <p className="text-sm opacity-90">In Queue</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
            <p className="text-xl font-bold">{totalPatients}</p>
            <p className="text-xs opacity-90">Total Patients</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
            <p className="text-xl font-bold">{patientsLeft}</p>
            <p className="text-xs opacity-90">Patients Left</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
            <p className="text-xl font-bold">{token}</p>
            <p className="text-xs opacity-90">Current Token</p>
          </div>
        </div>
      </div>
    </>
  )}
</motion.div>
              </div>

              {/* Health Overview */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, index) => (
                      <Skeleton key={index} variant="rectangular" width="100%" height={96} />
                    ))}
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                        <p className="font-medium">{totalPatients}</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Patients Left</p>
                        <p className="font-medium">{patientsLeft}</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">In Queue</p>
                        <p className="font-medium">{inQueue}</p>
                      </div>
                      <div className="text-center p-4 bg-rose-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Current Token</p>
                        <p className="font-medium">{token}</p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div> */}

              {/* Additional Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
              >

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => navigate("/medicine-stock")}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Stock</h3>
                  <p className="text-sm text-gray-600">Check and manage medical stock.</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => navigate("/analytics-dashboard")}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">UHS Analysis</h3>
                  <p className="text-sm text-gray-600">View analytics and reports.</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => navigate("/ambulance")}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ambulance Details</h3>
                  <p className="text-sm text-gray-600">Manage ambulance services.</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => navigate("/emergency")}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
                  <p className="text-sm text-gray-600">Access emergency contact information.</p>
                </motion.div>
              </motion.div>

            {/* Appointment Reasons Cloud */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Appointment Reasons</h3>
                            <div className="flex flex-wrap gap-3 min-h-[200px] items-center justify-center p-4 bg-gray-50 rounded-xl">
                              {Object.entries(appointmentReasons).length > 0 ? (
                                Object.entries(appointmentReasons).map(([reason, count]) => (
                                  <motion.span
                                    key={reason}
                                    whileHover={{ scale: 1.1 }}
                                    className="inline-block px-1 py-1 rounded-full text-indigo-800 transition-all"
                                    style={{
                                      fontSize: `${ 8 + count * 2}px`,
                                      opacity: 1,
                                      fontWeight: `${ 300 + count * 20}`,
                                    }}
                                  >
                                    {reason}
                                    <span className="ml-2 text-xs opacity-75">{count}</span>
                                  </motion.span>
                                ))
                              ) : (
                                <div className="text-gray-500 text-center py-8">
                                  {loading ? 
                                    <Skeleton variant="text" width={200} height={24} /> : 
                                    "No appointment reasons recorded yet"
                                  }
                                </div>
                              )}
                            </div>
                          </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
function setTime(arg0: Date) {
  throw new Error("Function not implemented.");
}

