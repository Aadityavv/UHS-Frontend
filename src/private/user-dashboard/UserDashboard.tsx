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
      <div className="flex justify-center items-center bg-gradient-to-br from-[#ECECEC] to-[#F9F9F9] min-h-[84svh] overflow-hidden py-2 pl-8 pr-8 max-lg:flex-col max-lg:overflow-y-scroll max-lg:gap-5 max-lg:py-5">
        {showDoctorAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white p-4 rounded-lg shadow-xl w-3/4 max-w-md"
            >
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  A doctor has been assigned to you.
                </AlertDescription>
              </Alert>
              <button
                className="mt-4 w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:bg-red-600 transition-all"
                onClick={() => {
                  setShowDoctorAlert(false);
                  localStorage.setItem("doctorAlertShow", "true");
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full flex justify-center items-center"
        >
          <div className="w-full bg-white/80 backdrop-blur-md space-y-4 p-8 rounded-lg flex items-center justify-center flex-col shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-white/90 border border-white/20 rounded-md shadow-lg">
              <img
                src={
                  userDetails.imageUrl
                    ? `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/${userDetails.imageUrl}`
                    : "/default-user.jpg"
                }
                className="w-64 h-64 object-cover border-2 border-white/30 rounded-md"
                alt="User Profile"
              />
            </div>
            <div className="text-center space-y-2 text-[#545555] font-semibold">
              <p className="text-xl font-bold">{userDetails.name}</p>
              <p className="text-gray-600">{userDetails.email}</p>
              <p className="text-gray-600">
                DOB -{" "}
                {new Date(userDetails.dateOfBirth).toLocaleDateString("en-GB")}
              </p>
              <p className="text-gray-600">Contact - {userDetails.phoneNumber}</p>
              <p className="text-gray-600">Blood Group - {userDetails.bloodGroup}</p>
              <p className="text-gray-600">Token Number - {status.tokenNo}</p>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full flex items-center justify-center"
        >
          <div className="w-full flex flex-col px-10 space-y-8 max-lg:px-0">
            {/* Appointment Status */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="shadow-xl bg-gradient-to-r from-[#1F60C0] to-[#0D4493] p-4 rounded-lg flex flex-col items-center justify-center backdrop-blur-md bg-white/80 border border-white/20"
            >
              <p className="text-white font-semibold text-lg text-center mb-2">
                Appointment Status
              </p>
              <div className="shadow-md bg-white/90 flex items-center text-gray-700 font-semibold rounded-lg w-full">
                <div
                  className={`px-8 py-3 w-full text-center ${
                    status.appointmentStatus === "NA"
                      ? "bg-[#1F60C0] text-white rounded-lg"
                      : "bg-gray-100"
                  }`}
                >
                  NA
                </div>
                <div
                  className={`px-8 py-3 w-full text-center ${
                    status.appointmentStatus === "Queued"
                      ? "bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg"
                      : "bg-gray-100"
                  }`}
                >
                  Queued
                </div>
              </div>
            </motion.div>

            {/* Doctor Status */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="shadow-xl bg-gradient-to-r from-[#1F60C0] to-[#0D4493] p-4 rounded-lg flex flex-col items-center justify-center backdrop-blur-md bg-white/80 border border-white/20"
            >
              <p className="text-white font-semibold text-lg text-center mb-2">
                Doctor Status
              </p>
              <div className="shadow-md bg-white/90 flex justify-center items-center text-gray-700 font-semibold rounded-lg w-full">
                {status.doctorName !== "Not Appointed" ? (
                  <div className="p-4 bg-white/90 text-gray-700 font-bold text-lg w-full rounded-lg text-center shadow-sm">
                    {status.doctorName}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 text-gray-700 w-full rounded-lg text-center shadow-sm">
                    {status.doctorName}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full shadow-xl hover:-translate-y-1 transition-all ease-in duration-200 px-6 py-3 bg-gradient-to-r from-[#1F60C0] to-[#0D4493] text-white font-semibold text-lg rounded-lg text-center backdrop-blur-md bg-white/80 border border-white/20"
                onClick={() => navigateTo("/patient-appointment")}
              >
                Schedule an Appointment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full shadow-xl hover:-translate-y-1 transition-all ease-in duration-200 px-6 py-3 bg-gradient-to-r from-[#1F60C0] to-[#0D4493] text-white font-semibold text-lg rounded-lg text-center backdrop-blur-md bg-white/80 border border-white/20"
                onClick={() => navigateTo("/patient-prescription")}
              >
                Prescription History
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full shadow-xl hover:-translate-y-1 transition-all ease-in duration-200 px-6 py-3 bg-gradient-to-r from-[#FF0004] to-[#0D4493] text-white font-semibold text-lg rounded-lg text-center backdrop-blur-md bg-white/80 border border-white/20"
                onClick={() => navigateTo("/emergency")}
              >
                Emergency Details
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default UserDashboard;