import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const [token, setToken] = useState("No Patient Assigned");
  const [inQueue, setInQueue] = useState(0);
  const [status, setStatus] = useState<
    "check-in" | "check-out" | "Available" | "Not Available"
  >("check-out");

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await fetch(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/total-patient-count",
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
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/setStatus?isDoctorCheckIn=true",
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
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/setStatus?isDoctorCheckIn=false",
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
      "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/getCurrentToken",
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
      "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/getStatus",
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

  useEffect(() => {
    fetchPatientData();
    fetchTokenNum();
    fetchDoctorStatus();

    const interval = setInterval(() => {
      fetchPatientData();
    }, 30000);

    const tokenInterval = setInterval(() => {
      fetchTokenNum();
    }, 30000);

    const statusInterval = setInterval(() => {
      fetchDoctorStatus();
    }, 30000); 

    return () => {
      clearInterval(interval);
      clearInterval(tokenInterval);
      clearInterval(statusInterval);
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

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
    return `${formattedHours}:${minutes}:${seconds} ${period}`;
  };

  return (
    <>
      <Toaster />
      <div className="flex justify-center items-center bg-[#ECECEC] min-h-[84svh] overflow-x-hidden max-lg:min-h-[93svh] max-lg:max-h-auto">
        <div className="w-full px-10 py-10 max-lg:py-5 flex justify-between items-center max-lg:flex-col max-lg:px-0">
          <div className="w-full flex flex-col items-center">
            <div className="flex space-x-4 max-lg:gap-5">
              <div className="text-center bg-black bg-opacity-10 px-12 py-6 rounded-lg shadow-lg max-lg:p-0 max-lg:bg-opacity-0 max-lg:shadow-none">
                <p className="font-semibold text-xl">Patients</p>
                <p className="text-lg">{totalPatients}</p>
              </div>
              <div className="w-[3px] my-4 bg-black max-lg:hidden"></div>
              <div className="text-center bg-black bg-opacity-10 px-12 py-6 rounded-lg shadow-lg max-lg:p-0 max-lg:bg-opacity-0 max-lg:shadow-none">
                <p className="font-semibold text-xl whitespace-nowrap">
                  In Queue
                </p>
                <p className="text-lg">{inQueue}</p>
              </div>
              <div className="w-[3px] my-4 bg-black max-lg:hidden"></div>
              <div className="text-center bg-black bg-opacity-10 px-12 py-6 rounded-lg shadow-lg max-lg:p-0 max-lg:bg-opacity-0 max-lg:shadow-none">
                <p className="font-semibold text-xl">Treatments</p>
                <p className="text-lg">{patientsLeft}</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-5 max-lg:p-5 bg-gray-800 rounded-lg shadow-lg my-5">
              <p className="text-4xl font-bold text-white drop-shadow-lg">
                {formatTime(time)}
              </p>
            </div>
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border bg-white shadow-lg max-lg:hidden"
              />
            </div>
          </div>
          <div className="w-full px-10 max-lg:px-5">
            <div className="w-full flex flex-col max-lg:px-0 space-y-10 max-lg:py-2">
              <div className="flex w-full justify-between gap-4">
                <button
                  className={`shadow-lg text-white px-8 py-2 rounded-md font-semibold whitespace-nowrap text-lg ${
                    status === "Available"
                      ? "bg-gray-800 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#2FC800] to-[#009534] hover:bg-green-600"
                  }`}
                  onClick={handleCheckIn}
                  disabled={status === "Available"}
                >
                  {status === "Available" ? "Available" : "Check-In"}
                </button>
                <button
                  className={`shadow-lg text-white px-8 py-2 rounded-md font-semibold whitespace-nowrap text-lg ${
                    status === "Not Available"
                      ? "bg-gray-800 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#E00000] to-[#7E0000] hover:bg-red-600"
                  }`}
                  onClick={handleCheckOut}
                  disabled={status === "Not Available"}
                >
                  {status === "Not Available" ? "Not Available" : "Check-Out"}
                </button>
              </div>
              <div className="flex flex-col px-10 justify-between items-center py-3 rounded-md">
                <p className="text-black font-semibold text-xl text-center flex-1">
                  Patient Token Number
                </p>
                <p>{token}</p>
              </div>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/patient-details")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Patient Details
                </p>
              </button>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/medicine-stock")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Medical Stock
                </p>
              </button>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/analytics-dashboard")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Analytics Dashboard
                </p>
              </button>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/ambulance")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Ambulance Details
                </p>
              </button>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#FF0004] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/emergency")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Emergency Contacts
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
