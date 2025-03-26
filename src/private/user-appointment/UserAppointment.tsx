import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import dayjs from 'dayjs';

import {
  Calendar,
  User,
  Activity,
  MapPin
} from "lucide-react";
import Skeleton from "@mui/material/Skeleton";
import { ToastAction } from "@radix-ui/react-toast";

const UserAppointment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // State variables
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [lastAppointmentDate, setLastAppointmentDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    phoneNumber: "",
    bloodGroup: "",
    imageUrl: "",
  });

  const [, setStatus] = useState({
    appointmentStatus: "",
    doctorName: "",
    tokenNo: "",
  });

  const [locationName, setLocationName] = useState("");

  // Fetch user, doctors, and status data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const savedLocation = localStorage.getItem("locationName");
    setLocationName(savedLocation || "Location not available");

    // const fetchData = async () => {
    //   try {
    //     const [userRes, doctorsRes, statusRes] = await Promise.all([
    //       axios.get("https://uhs-backend.onrender.com/api/patient/", {
    //         headers: { Authorization: `Bearer ${token}` },
    //       }),
    //       axios.get("https://uhs-backend.onrender.com/api/patient/getAvailableDoctors", {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           "X-Latitude": localStorage.getItem("latitude") || "0",
    //           "X-Longitude": localStorage.getItem("longitude") || "0",
    //         },
    //       }),
    //       axios.get("https://uhs-backend.onrender.com/api/patient/getStatus", {
    //         headers: { Authorization: `Bearer ${token}` },
    //       }),
    //     ]);

    //     setUserDetails(userRes.data);

    //     setDoctors(
    //       doctorsRes.data.map((doctor: any) => ({
    //         id: doctor.doctorId.toString(),
    //         name: doctor.name,
    //       }))
    //     );

    //     setStatus({
    //       appointmentStatus: statusRes.data.Appointment ? "Queued" : "NA",
    //       doctorName: statusRes.data.Doctor ? statusRes.data.DoctorName : "Not Appointed",
    //       tokenNo: statusRes.data.TokenNo || "N/A",
    //     });

    //   } catch (error: any) {
    //     console.error("Fetch error:", error);
    //     toast({
    //       title: "Error",
    //       description: error?.response?.data?.message || error.message || "Something went wrong!",
    //       variant: "destructive",
    //       action: <ToastAction altText="Try again">Try again</ToastAction>,
    //     });
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
    
      try {
        // Fetch User Profile
        const userRes = await axios.get("https://uhs-backend.onrender.com/api/patient/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(userRes.data);
      } catch (error: any) {
        console.error("User fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    
      try {
        // Fetch Doctors List (non-critical)
        const doctorsRes = await axios.get(
          "https://uhs-backend.onrender.com/api/patient/getAvailableDoctors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Latitude": localStorage.getItem("latitude") || "0",
              "X-Longitude": localStorage.getItem("longitude") || "0",
            },
          }
        );
    
        setDoctors(
          doctorsRes.data.map((doctor: any) => ({
            id: doctor.doctorId.toString(),
            name: doctor.name,
          }))
        );
      } catch (error: any) {
        console.warn("Doctors not available:", error);
        toast({
          title: "Notice",
          description: "No doctors available right now.",
          variant: "default",
        });
      }
    
      try {
        // Fetch Status (non-critical)
        const statusRes = await axios.get("https://uhs-backend.onrender.com/api/patient/getStatus", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        setStatus({
          appointmentStatus: statusRes.data.Appointment ? "Queued" : "NA",
          doctorName: statusRes.data.Doctor ? statusRes.data.DoctorName : "Not Appointed",
          tokenNo: statusRes.data.TokenNo || "N/A",
        });
      } catch (error: any) {
        console.error("Status fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load appointment status.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    
      setLoading(false);
    };
    
    
    fetchData();
  }, [navigate]);

  // Fetch last appointment date (optional debounce can be added)
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
      setLastAppointmentDate(response.data || null);
    } catch (error: any) {
      console.error("Last appointment fetch error:", error);
      toast({
        title: "Error",
        description: "Couldn't get last appointment date",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }, []);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitting(false);
      return;
    }

    const appointmentData = {
      reason: formData.get("reason"),
      isFollowUp: formData.get("followUp") === "Yes",
      preferredDoctor: formData.get("preferredDoctor") || null,
      reasonPrefDoctor: formData.get("reasonForPreference") || null,
    };

    try {
      await axios.post(
        "https://uhs-backend.onrender.com/api/patient/submitAppointment",
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Latitude": localStorage.getItem("latitude") || "0",
            "X-Longitude": localStorage.getItem("longitude") || "0",
          },
        }
      );

      toast({
        title: "Success",
        description: "Appointment submitted successfully.",
      });

      setTimeout(() => navigate("/patient-dashboard"), 1000);
    } catch (error: any) {
      console.error("Appointment submission error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message || "An error occurred.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[79vh] overflow-x-hidden bg-gray-50">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Left Sidebar - Profile Card */}
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
  src={
    userDetails.imageUrl
      ? `https://uhs-backend.onrender.com/Profile/${userDetails.imageUrl}`
      : "/default-user.jpg"
  }
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
  {userDetails.dateOfBirth ? dayjs(userDetails.dateOfBirth).format("DD/MM/YYYY") : "N/A"}
</span>

                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Activity className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>{userDetails.bloodGroup || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>{locationName}</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Main Content - Appointment Form */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Schedule Appointment
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reason for Appointment
                  </label>
                  <input
                    name="reason"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Describe your reason"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Follow-up Appointment?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="followUp"
                        value="Yes"
                        onChange={fetchLastAppointmentDate}
                        className="text-indigo-600 focus:ring-indigo-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="followUp"
                        value="No"
                        onChange={() => setLastAppointmentDate(null)} 
                        className="text-indigo-600 focus:ring-indigo-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {lastAppointmentDate && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Last Appointment Date
                    </label>
                    <input
                      value={lastAppointmentDate}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Preferred Doctor
                  </label>
                  <select
                    name="preferredDoctor"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reason for Preference
                  </label>
                  <textarea
                    name="reasonForPreference"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600"
                    placeholder="Explain your preference (optional)"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => navigate("/patient-dashboard")}
                    className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2 rounded-xl ${
                      submitting
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white transition-colors`}
                  >
                    {submitting ? "Scheduling..." : "Schedule Appointment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserAppointment;
