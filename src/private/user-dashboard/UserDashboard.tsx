import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    appointmentStatus: "",
    doctorName: "",
    tokenNo: "",
  });
  const [userDetails, setUserDetails] = useState({
    email: "",
    name: "",
    school: "",
    dateOfBirth: "",
    program: "",
    phoneNumber: "",
    emergencyContact: "",
    bloodGroup: "",
    imageUrl: "",
    password: "",
  });
  const [showDoctorAlert, setShowDoctorAlert] = useState(false);

  const navigateTo = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    localStorage.setItem("doctorAlertShow", "false");

    const getMedicalDetailsStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/getAllDetails",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        (await res).data;
      } catch (err: any) {
        console.log(err);
        if (err.response.status === 404) {
          navigate("/patient-profile");
          return 0;
        }
      }
    };

    const getUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const res = await axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await res.data;
        setUserDetails(data);
      } catch (error: any) {
        console.log(error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast({
            title: "Error",
            description: error.response.data.message,
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        } else {
          toast({
            title: "Error",
            description:
              "Error fetching patient details, please try again later.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }
    };

    const getStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/getStatus",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const statusData = response.data;
        setStatus({
          appointmentStatus: statusData.Appointment ? "Queued" : "NA",
          doctorName: statusData.Doctor
            ? statusData.DoctorName
            : "Not Appointed",
          tokenNo: statusData.TokenNo ? statusData.TokenNo : "N/A",
        });
        if (!statusData.Doctor)
          localStorage.setItem("doctorAlertShow", "false");

        const doctorAlertShow = localStorage.getItem("doctorAlertShow");

        if (
          statusData.Doctor &&
          statusData.DoctorName !== status.doctorName &&
          doctorAlertShow === "false"
        ) {
          playAlertSound();
          setShowDoctorAlert(true);
        }
      } catch (error: any) {
        console.log("Error fetching status: ", error);
        if (error.response.data.message) {
          toast({
            title: "Error",
            description: error.response.data.message,
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        } else {
          toast({
            title: "Error",
            description:
              "Couldn't fetch appointment details, please try again later.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }
    };

    const playAlertSound = () => {
      const sound = new Audio("/doctor-appointed-alert-sound.wav");
      sound.play();
    };

    const initFunc = async () => {
      await getUser();
      await getStatus();
      getMedicalDetailsStatus();
    };

    initFunc();

    const intervalId = setInterval(getStatus, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#D9E2EC] p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2E3A48]">Welcome Back, {userDetails.name}</h1>
          <p className="text-lg text-[#6C757D]">Your Health, Our Priority</p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex flex-col items-center">
              <img
                src={
                  userDetails.imageUrl
                    ? `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/${userDetails.imageUrl}`
                    : "/default-user.jpg"
                }
                alt="User Profile"
                className="w-32 h-32 rounded-full border-4 border-[#1F60C0] object-cover"
              />
              <h2 className="mt-4 text-2xl font-bold text-[#2E3A48]">{userDetails.name}</h2>
              <p className="text-[#6C757D]">{userDetails.email}</p>
              <div className="mt-4 space-y-2 text-center">
                <p className="text-[#6C757D]">
                  <span className="font-semibold">DOB:</span>{" "}
                  {new Date(userDetails.dateOfBirth).toLocaleDateString("en-GB")}
                </p>
                <p className="text-[#6C757D]">
                  <span className="font-semibold">Contact:</span> {userDetails.phoneNumber}
                </p>
                <p className="text-[#6C757D]">
                  <span className="font-semibold">Blood Group:</span> {userDetails.bloodGroup}
                </p>
                <p className="text-[#6C757D]">
                  <span className="font-semibold">Token No:</span> {status.tokenNo}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Appointment and Doctor Status */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appointment Status */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-[#2E3A48] mb-4">Appointment Status</h3>
              <div className="flex gap-4">
                <div
                  className={`flex-1 p-4 rounded-lg text-center ${
                    status.appointmentStatus === "NA"
                      ? "bg-[#1F60C0] text-white"
                      : "bg-[#E9ECEF] text-[#6C757D]"
                  }`}
                >
                  <p className="font-semibold">NA</p>
                </div>
                <div
                  className={`flex-1 p-4 rounded-lg text-center ${
                    status.appointmentStatus === "Queued"
                      ? "bg-[#28A745] text-white"
                      : "bg-[#E9ECEF] text-[#6C757D]"
                  }`}
                >
                  <p className="font-semibold">Queued</p>
                </div>
              </div>
            </motion.div>

            {/* Doctor Status */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-[#2E3A48] mb-4">Doctor Status</h3>
              <div
                className={`p-4 rounded-lg text-center ${
                  status.doctorName !== "Not Appointed"
                    ? "bg-[#1F60C0] text-white"
                    : "bg-[#E9ECEF] text-[#6C757D]"
                }`}
              >
                <p className="font-semibold">{status.doctorName}</p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <button
                onClick={() => navigateTo("/patient-appointment")}
                className="bg-[#1F60C0] text-white p-4 rounded-lg hover:bg-[#0D4493] transition-all"
              >
                Schedule Appointment
              </button>
              <button
                onClick={() => navigateTo("/patient-prescription")}
                className="bg-[#28A745] text-white p-4 rounded-lg hover:bg-[#218838] transition-all"
              >
                Prescription History
              </button>
              <button
                onClick={() => navigateTo("/emergency")}
                className="bg-[#DC3545] text-white p-4 rounded-lg hover:bg-[#C82333] transition-all"
              >
                Emergency Contacts
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;