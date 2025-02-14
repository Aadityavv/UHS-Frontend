import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const getUserData = async () => {
      try {
        const res = await axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserDetails(res.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Something went wrong!",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    };

    const getStatus = async () => {
      try {
        const res = await axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/getStatus",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus({
          appointmentStatus: res.data.Appointment ? "Queued" : "NA",
          doctorName: res.data.Doctor ? res.data.DoctorName : "Not Appointed",
          tokenNo: res.data.TokenNo || "N/A",
        });
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };

    getUserData();
    getStatus();
  }, []);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#D9E2EC] p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2E3A48]">
            Welcome, {userDetails.name}
          </h1>
          <p className="text-lg text-[#6C757D]">Your Health, Our Priority</p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Left - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center lg:col-span-1"
          >
            <img
              src={userDetails.imageUrl || "/default-user.jpg"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-[#1F60C0] object-cover"
            />
            <h2 className="mt-4 text-xl font-bold text-[#2E3A48]">
              {userDetails.name}
            </h2>
            <p className="text-[#6C757D]">{userDetails.email}</p>
            <div className="mt-4 space-y-2 text-center text-[#6C757D] text-sm">
              <p>
                <span className="font-semibold">DOB:</span>{" "}
                {new Date(userDetails.dateOfBirth).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {userDetails.phoneNumber}
              </p>
              <p>
                <span className="font-semibold">Blood Group:</span>{" "}
                {userDetails.bloodGroup}
              </p>
              <p>
                <span className="font-semibold">Token No:</span> {status.tokenNo}
              </p>
            </div>
          </motion.div>

          {/* Middle - Status Cards */}
          <div className="flex flex-col gap-6">
            {/* Appointment Status */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-[#2E3A48] mb-4">
                Appointment Status
              </h3>
              <div
                className={`py-2 rounded-md text-sm font-medium ${
                  status.appointmentStatus === "Queued"
                    ? "bg-[#28A745] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {status.appointmentStatus}
              </div>
            </motion.div>

            {/* Doctor Status */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-[#2E3A48] mb-4">
                Doctor Status
              </h3>
              <div
                className={`py-2 rounded-md text-sm font-medium ${
                  status.doctorName !== "Not Appointed"
                    ? "bg-[#1F60C0] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {status.doctorName}
              </div>
            </motion.div>
          </div>

          {/* Right - Vertical Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col gap-4 justify-start"
          >
            <button
              onClick={() => navigate("/patient-appointment")}
              className="btn-primary w-full"
            >
              Schedule Appointment
            </button>
            <button
              onClick={() => navigate("/patient-prescription")}
              className="btn-secondary w-full"
            >
              Prescription History
            </button>
            <button
              onClick={() => navigate("/emergency")}
              className="btn-danger w-full"
            >
              Emergency Contacts
            </button>
          </motion.div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .btn-primary, .btn-secondary, .btn-danger {
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
          color: white;
          text-align: center;
          transition: all 0.3s;
        }
        .btn-primary { background: #1F60C0; }
        .btn-primary:hover { background: #0D4493; }
        .btn-secondary { background: #28A745; }
        .btn-secondary:hover { background: #218838; }
        .btn-danger { background: #DC3545; }
        .btn-danger:hover { background: #C82333; }
      `}</style>
    </>
  );
};

export default UserDashboard;
