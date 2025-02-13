import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import "./AdminDashboard.scss";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());

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
      <div className="admin-dashboard">
        <div className="admin-dashboard__left">
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
              className="rounded-md border bg-white shadow-lg max-lg:hidden"
            />
          </div>
        </div>
        <div className="admin-dashboard__right">
          <button
            className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-4 rounded-md w-[70%] max-lg:px-5"
            onClick={() => navigate("/register-doctor")}
          >
            <p className="text-white font-semibold text-lg text-center flex-1">
              Add New Doctor
            </p>
          </button>
          <button
            className="shadow-xl flex hover:-translate-y-1 transition ease-in duration-200 px-10 justify-between items-center bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] py-4 rounded-md w-[70%] max-lg:px-5"
            onClick={() => navigate("/register-assistant-doctor")}
          >
            <p className="text-white font-semibold text-lg text-center flex-1">
              Add New Nursing Assistant
            </p>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
