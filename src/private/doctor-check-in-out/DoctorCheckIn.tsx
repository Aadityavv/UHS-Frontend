import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";

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
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getAllDoctors",
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
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/setStatus/${event.target.dataset.key}?isDoctorCheckIn=true`,
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
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/setStatus/${event.target.dataset.key}?isDoctorCheckIn=false`,
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
      <div className="flex justify-center items-center bg-[#ECECEC] min-h-[84svh] max-lg:min-h-[93svh] max-lg:items-start">
        <div className="w-full px-14 py-10 flex justify-center items-center">
          <div className="w-full flex flex-col items-center space-y-6 max-lg:hidden">
            <div className="flex items-center justify-center p-5 max-lg:p-5 bg-gray-800 rounded-lg shadow-lg mb-5">
              <p className="text-4xl font-bold text-white drop-shadow-lg">
                {formatTime(time)}
              </p>
            </div>
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border bg-white shadow-lg"
              />
            </div>
          </div>
          <div className="w-full px-8 max-lg:px-0 max-lg:min-w-[98svw]">
            <div className="w-full flex flex-col space-y-2 p-4 max-lg:p-1 bg-black rounded-lg bg-opacity-10 shadow-lg">
              {doctors.map((doctor, index) => (
                <div
                  key={index}
                  className="w-full bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] p-8 rounded-md flex items-center shadow-lg max-lg:p-4"
                >
                  <div className="flex flex-col w-[60%]">
                    <p className="text-white font-semibold text-lg">
                      {doctor.name}
                    </p>
                    <p className="text-white font-normal text-base">
                      {doctor.designation}
                    </p>
                    <p className="text-white font-normal text-base">
                      ({doctor.location})
                    </p>
                  </div>
                  <div className="flex w-full max-lg:w-3/5 justify-between max-lg:flex-col max-lg:gap-4">
                    <button
                      data-key={`${doctor.id}`}
                      disabled={doctor.status === "Available"}
                      className={`shadow-lg px-8 py-2 rounded-md text-white ${
                        doctor.status === "Available"
                          ? "bg-[#8F8F8F] cursor-not-allowed"
                          : "bg-gradient-to-r from-[#2FC800] to-[#009534] hover:brightness-110"
                      }`}
                      onClick={(event: any) => {
                        if (doctor.status !== "Available") handleCheckIn(event);
                      }}
                    >
                      {doctor.status === "Available" ? "Available" : "Check-In"}
                    </button>

                    <button
                      data-key={`${doctor.id}`}
                      disabled={doctor.status === "Not Available"}
                      className={`shadow-lg px-8 py-2 rounded-md text-white ${
                        doctor.status === "Not Available"
                          ? "bg-[#8F8F8F] cursor-not-allowed"
                          : "bg-gradient-to-r from-[#E00000] to-[#7E0000] hover:brightness-110"
                      }`}
                      onClick={(event: any) => {
                        if (doctor.status !== "Not Available")
                          handleCheckOut(event);
                      }}
                    >
                      {doctor.status === "Not Available"
                        ? "Not Available"
                        : "Check-Out"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorCheckIn;
