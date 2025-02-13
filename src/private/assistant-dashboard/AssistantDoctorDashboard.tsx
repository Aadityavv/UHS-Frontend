import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";

const AssistantDoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLeft, setPatientsLeft] = useState(0);
  const [inQueue, setInQueue] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await fetch(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/total-patient-count",
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
        console.error("Failed to fetch patient data.");
        toast({
          title: "Fetch Error",
          description: "Failed to fetch patient data. Please try again later.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (error: any) {
      console.error("Error fetching patient data:", error);
      if (error.response) {
        toast({
          title: "Error",
          description: error.response.data.message,
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } else {
        toast({
          title: "Network Error",
          description: "Failed to fetch patient data due to a network error.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
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

  useEffect(() => {
    fetchPatientData();

    const interval = setInterval(() => {
      fetchPatientData();
    }, 25000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Toaster />
      <div className="flex justify-center items-center bg-[#ECECEC] min-h-[84svh] overflow-hidden max-lg:min-h-[93svh] max-lg:items-center">
        <div className="w-full px-14 py-4 max-lg:py-5 flex justify-center items-center max-lg:flex-col max-lg:px-0">
          <div className="w-full flex flex-col items-center">
            <div className="flex space-x-4 max-lg:gap-5">
              <div className="text-center bg-black bg-opacity-10 px-12 py-6 rounded-lg shadow-lg max-lg:p-0 max-lg:bg-opacity-0 max-lg:shadow-none">
                <p className="font-semibold text-xl">Patients</p>
                <p className="text-lg">{totalPatients}</p>
              </div>
              <div className="w-[3px] my-4 bg-black max-lg:hidden"></div>
              <div className="text-center bg-black bg-opacity-10 px-12 py-6 rounded-lg shadow-lg max-lg:p-0 max-lg:bg-opacity-0 max-lg:shadow-none">
                <p className="font-semibold text-xl">In Queue</p>
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
          <div className="w-full pl-14 max-lg:px-8">
            <div className="w-full flex flex-col max-lg:px-0 space-y-10 max-lg:py-2">
              <div className="flex justify-between w-full gap-4 max-lg:flex-col max-lg:space-y-5">
                <button
                  className="lg:w-1/2 shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                  onClick={() => navigate("/doctor-check-in-out")}
                >
                  <p className="text-white font-semibold text-lg text-center flex-1 whitespace-nowrap">
                    Doctors Availability
                  </p>
                </button>
                <button
                  className="lg:w-1/2 shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                  onClick={() => navigate("/medicine-stock")}
                >
                  <p className="text-white font-semibold text-lg text-center flex-1 whitespace-nowrap">
                    Medical Stock
                  </p>
                </button>
              </div>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/patient-list")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Patient Queue
                </p>
              </button>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/patient-logs")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Patient Log Book
                </p>
              </button>
              <button
                className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                onClick={() => navigate("/adhoc")}
              >
                <p className="text-white font-semibold text-lg text-center flex-1">
                  Ad-Hoc Treatment
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
              <div className="flex justify-between w-full gap-4 max-lg:flex-col max-lg:space-y-5">
                <button
                  className="lg:w-1/2 shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-3 rounded-md"
                  onClick={() => navigate("/Ambulance")}
                >
                  <p className="text-white font-semibold text-lg text-center flex-1 whitespace-nowrap">
                    Ambulance Details
                  </p>
                </button>
                <button
                  className="lg:w-1/2 shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#FF0004] gap-2 to-[#0D4493] py-3 rounded-md"
                  onClick={() => navigate("/Emergency")}
                >
                  <p className="text-white font-semibold text-lg text-center flex-1 whitespace-nowrap">
                    Emergency Contacts
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssistantDoctorDashboard;
