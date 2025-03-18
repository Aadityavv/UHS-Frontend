import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import dayjs from 'dayjs';
import {
  Activity,
  Calendar,
  ClipboardList,
  AlertCircle,
  Stethoscope,
  Pill,
  User
} from "lucide-react";
import Skeleton from '@mui/material/Skeleton';
import { ToastAction } from "@radix-ui/react-toast";

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [status, setStatus] = useState({
    appointmentStatus: "",
    doctorName: "",
    tokenNo: "",
  });
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    phoneNumber: "",
    bloodGroup: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [lastAppointmentDate, setLastAppointmentDate] = useState<string | null>(null);

  const fetchLastAppointmentDate = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        "https://uhs-backend.onrender.com/api/patient/lastAppointmentDate",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data) {
        const formattedDate = dayjs(response.data).format("DD/MM/YYYY");
        setLastAppointmentDate(formattedDate);
      } else {
        setLastAppointmentDate(null);
      }
    } catch (error: any) {
      console.error("Last appointment fetch error:", error);
      toast({
        title: "Error",
        description: "Couldn't get last appointment date",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }, [toast]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, statusRes] = await Promise.all([
          axios.get("https://uhs-backend.onrender.com/api/patient/", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://uhs-backend.onrender.com/api/patient/getStatus", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUserDetails(userRes.data);
        setStatus({
          appointmentStatus: statusRes.data.Appointment ? "Queued" : "NA",
          doctorName: statusRes.data.Doctor ? statusRes.data.DoctorName : "Not Appointed",
          tokenNo: statusRes.data.TokenNo || "N/A",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Something went wrong!",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchLastAppointmentDate(); // 👉 You forgot to call this earlier!
  }, [navigate, toast, fetchLastAppointmentDate]);

  return (
    <div className="min-h-[79vh] overflow-x-hidden bg-gray-50">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block w-full lg:w-1/4 space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {loading ? (
                <div className="space-y-4">
                  <Skeleton variant="circular" width={96} height={96} className="mx-auto" />
                  <Skeleton variant="text" width={150} height={24} className="mx-auto" />
                  <Skeleton variant="text" width={200} height={16} className="mx-auto" />
                  <div className="mt-6 space-y-3">
                    <Skeleton variant="text" width={180} height={16} />
                    <Skeleton variant="text" width={180} height={16} />
                    <Skeleton variant="text" width={180} height={16} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={userDetails.imageUrl || "/default-user.jpg"}
                        alt="Profile"
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-1.5 rounded-full">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">
                      {userDetails.name}
                    </h2>
                    <p className="text-sm text-gray-500">{userDetails.email}</p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>
                        {userDetails.dateOfBirth
                          ? dayjs(userDetails.dateOfBirth).format("DD/MM/YYYY")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Activity className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>{userDetails.bloodGroup || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClipboardList className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>Token: {status.tokenNo}</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* STATUS CARDS */}
            <div className="grid md:grid-cols-3 gap-3 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white"
              >
                {loading ? (
                  <>
                    <Skeleton variant="text" width={120} height={24} className="mb-4 bg-indigo-400" />
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton variant="text" width={150} height={32} className="mb-2 bg-indigo-400" />
                        <Skeleton variant="text" width={100} height={20} className="bg-indigo-400" />
                      </div>
                      <Skeleton variant="circular" width={56} height={56} className="bg-indigo-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium opacity-90 mb-4">Current Status</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold mb-2">
                          {status.appointmentStatus === "Queued" ? "In Queue" : "No Appointment"}
                        </p>
                        <div className="text-sm opacity-90">{status.doctorName}</div>
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
                  onClick={() => navigate("/patient-appointment")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <span className="text-indigo-700 font-medium">New Appointment</span>
                  <Stethoscope className="h-5 w-5 text-indigo-700" />
                </button>
                <button
                  onClick={() => navigate("/patient-prescription")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-emerald-700 font-medium">Prescriptions</span>
                  <Pill className="h-5 w-5 text-emerald-700" />
                </button>
                <button
                  onClick={() => navigate("/emergency")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <span className="text-rose-700 font-medium">Emergency</span>
                  <AlertCircle className="h-5 w-5 text-rose-700" />
                </button>
              </motion.div>

              {/* NEXT STEPS */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-500 mb-4">Next Steps</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Estimated Wait Time</span>
                    <span className="font-medium text-indigo-600">~15 mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Room Number</span>
                    <span className="font-medium text-indigo-600">B-204</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* HEALTH OVERVIEW */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Health Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Last Checkup</p>
                  <p className="font-medium">
                    {lastAppointmentDate ? lastAppointmentDate : "No records"}
                  </p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Medications</p>
                  <p className="font-medium">3 Active</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Allergies</p>
                  <p className="font-medium">2 Reported</p>
                </div>
                <div className="text-center p-4 bg-rose-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">BMI</p>
                  <p className="font-medium">22.6</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
