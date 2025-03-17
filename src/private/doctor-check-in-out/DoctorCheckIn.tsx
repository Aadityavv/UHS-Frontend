import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { Clock, Calendar as CalendarIcon, User, Stethoscope } from "lucide-react";

const DoctorCheckIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [doctors, setDoctors] = useState<
    Array<{
      id: number;
      name: string;
      status: string;
      email: string;
      designation: string;
      location: string;
    }>
  >([]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://uhs-backend.onrender.com//api/AD/getAllDoctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const doctorsData = response.data;

      const formattedDoctors = doctorsData.map((doctor: any) => ({
        id: doctor.doctorId,
        name: doctor.name,
        status: doctor.status ? "Available" : "Not Available",
        email: doctor.doctorEmail,
        location: doctor.location ? doctor.location.locationName : "",
        designation: doctor.designation,
      }));
      setDoctors(formattedDoctors);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching doctors",
        description: error.response?.data?.message || "Failed to load doctors.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleCheckIn = async (event: any) => {
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
          variant: "destructive",
          title: "Location Required",
          description: "Allow Location Services to proceed.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        return;
      }
      const response = await axios.get(
        `https://uhs-backend.onrender.com//api/AD/setStatus/${event.target.dataset.key}?isDoctorCheckIn=true`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "X-Latitude": localStorage.getItem("latitude"),
            "X-Longitude": localStorage.getItem("longitude"),
          },
        }
      );
      if (response.status !== 200) {
        const errorData = await response.data;
        toast({
          variant: "destructive",
          title: "Check-In Failed",
          description: errorData.message || "Failed to check in.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } else {
        toast({
          title: "Success",
          description: "Doctor checked in successfully!",
        });
        fetchDoctors();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error during check-in",
        description: error.response?.data?.message || "Please try again later.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error("Error during check-in:", error);
    }
  };

  const handleCheckOut = async (event: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await fetch(
        `https://uhs-backend.onrender.com//api/AD/setStatus/${event.target.dataset.key}?isDoctorCheckIn=false`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Check-Out Failed",
          description: errorData.message || "Failed to check out.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } else {
        toast({
          title: "Success",
          description: "Doctor checked out successfully!",
        });
        fetchDoctors();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error during check-out",
        description: error.response?.data?.message || "Please try again later.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      console.error("Error during check-out:", error);
    }
  };

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-4 gap-8"
          >
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Current Time</p>
                    <p className="text-3xl font-bold mt-2 text-white">{formatTime(time)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg text-gray-600 font-semibold">Select Date</h3>
                </div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border-none"
                />
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200"
                >
                  <div className="mb-6 flex items-center">
                    <Stethoscope className="h-8 w-8 mr-2 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Doctors Availability</h2>
                  </div>

                  <div className="space-y-4">
                    {doctors.map((doctor, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                              <User className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {doctor.name}
                              </h3>
                              <p className="text-sm text-gray-600">{doctor.designation}</p>
                              <p className="text-sm text-gray-500">{doctor.location}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              data-key={`${doctor.id}`}
                              disabled={doctor.status === "Available"}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                doctor.status === "Available"
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                              }`}
                              onClick={handleCheckIn}
                            >
                              {doctor.status === "Available" ? "Checked In" : "Check In"}
                            </button>

                            <button
                              data-key={`${doctor.id}`}
                              disabled={doctor.status === "Not Available"}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                doctor.status === "Not Available"
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                              onClick={handleCheckOut}
                            >
                              {doctor.status === "Not Available" ? "Checked Out" : "Check Out"}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center space-x-2 text-sm">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              doctor.status === "Available" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></span>
                          <span className="text-gray-500">
                            {doctor.status === "Available"
                              ? "Currently available"
                              : "Not available"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DoctorCheckIn;