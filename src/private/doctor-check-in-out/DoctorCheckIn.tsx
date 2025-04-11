import { useEffect, useState } from "react";
// import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { User, Stethoscope, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [query]);

  return matches;
}

const DoctorCheckIn = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const { toast } = useToast();
  // const [date, setDate] = useState<Date | undefined>(new Date());
  const [doctors, setDoctors] = useState<
    Array<{
      id: number;
      name: string;
      status: string;
      email: string;
      designation: string;
      location: string;
      specialization: string;
    }>
  >([]);
  const [filters, setFilters] = useState({
    status: "all",
    specialization: "all",
    location: "all",
  });
  // const [showLeaveModal, setShowLeaveModal] = useState(false);
  // const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  // const specializations = [
  //   "Cardiology",
  //   "Neurology",
  //   "Pediatrics",
  //   "Orthopedics",
  //   "General"
  // ];

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://uhs-backend.onrender.com/api/AD/getAllDoctors",
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
        location: doctor.location ? doctor.location.locationName : "Not Available",
        designation: doctor.designation,
        specialization: doctor.specialization || "General"
      }));
      setDoctors(formattedDoctors);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching doctors",
        description: error.response?.data?.message || "Failed to load doctors.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleCheckIn = async (doctorId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      if (!localStorage.getItem("latitude") || !localStorage.getItem("longitude")) {
        toast({
          variant: "destructive",
          title: "Location Required",
          description: "Allow Location Services to proceed.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        return;
      }

      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/AD/setStatus/${doctorId}?isDoctorCheckIn=true`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "X-Latitude": localStorage.getItem("latitude"),
            "X-Longitude": localStorage.getItem("longitude"),
          },
        }
      );

      if (response.status === 200) {
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
    }
  };

  const handleCheckOut = async (doctorId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/AD/setStatus/${doctorId}?isDoctorCheckIn=false`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.status === 200) {
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
    }
  };

  // const handleLeaveRequest = (doctorId: number) => {
  //   setSelectedDoctor(doctorId);
  //   setShowLeaveModal(true);
  // };

  const filteredDoctors = doctors.filter((doctor) => {
    return (
      (filters.status === "all" || 
       (filters.status === "available" && doctor.status === "Available") ||
       (filters.status === "not_available" && doctor.status === "Not Available")) &&
      (filters.specialization === "all" || 
       doctor.specialization.toLowerCase() === filters.specialization.toLowerCase()) &&
      (filters.location === "all" || 
       doctor.location.toLowerCase().includes(filters.location.toLowerCase()))
    );
  });

  return (
    <>
      <Toaster />
      {/* {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Request Leave for Dr. {doctors.find(d => d.id === selectedDoctor)?.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Leave Dates</label>
                <Calendar
                  mode="range"
                  selected={{ from: new Date(), to: new Date() }}
                  className="rounded-md border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea 
                  className="w-full border rounded-md p-2 min-h-[100px]" 
                  placeholder="Enter leave reason..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowLeaveModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Leave Request Submitted",
                    description: "Your request has been sent for approval",
                  });
                  setShowLeaveModal(false);
                }}>
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-1 gap-8"
          >
            {/* Left Sidebar */}
            {/* <div className="lg:col-span-1 space-y-6">
              {!isMobile && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="text-lg text-gray-600 font-semibold">Calendar</h3>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border-none"
                  />
                </motion.div>
              )}
            </div> */}

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center">
                      <Stethoscope className="h-8 w-8 mr-2 text-indigo-600" />
                      <h2 className="text-2xl font-bold text-gray-800">Doctors Availability</h2>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                      <Select
                        value={filters.status}
                        onValueChange={(v) => setFilters({...filters, status: v})}
                      >
                        <SelectTrigger className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="not_available">Not Available</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* <Select
                        value={filters.specialization}
                        onValueChange={(v) => setFilters({...filters, specialization: v})}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specializations</SelectItem>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec.toLowerCase()}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select> */}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <motion.div
                          key={doctor.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <User className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    {doctor.name}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {doctor.specialization}
                                    </span>
                                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                      {doctor.designation}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {doctor.location}
                                  </p>
                                </div>
                              </div>
                              {!isMobile && (
                                <div className="flex gap-2">
                                  <button
                                    disabled={doctor.status === "Available"}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                      doctor.status === "Available"
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                                    onClick={() => handleCheckIn(doctor.id)}
                                  >
                                    {doctor.status === "Available" ? "Checked In" : "Check In"}
                                  </button>
                                  <button
                                    disabled={doctor.status === "Not Available"}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                      doctor.status === "Not Available"
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-red-600 text-white hover:bg-red-700"
                                    }`}
                                    onClick={() => handleCheckOut(doctor.id)}
                                  >
                                    {doctor.status === "Not Available" ? "Checked Out" : "Check Out"}
                                  </button>
                                </div>
                              )}
                            </div>

                            {isMobile && (
                              <div className="flex flex-col gap-2">
                                <button
                                  disabled={doctor.status === "Available"}
                                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                                    doctor.status === "Available"
                                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                                  }`}
                                  onClick={() => handleCheckIn(doctor.id)}
                                >
                                  {doctor.status === "Available" ? "Checked In" : "Check In"}
                                </button>
                                <button
                                  disabled={doctor.status === "Not Available"}
                                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                                    doctor.status === "Not Available"
                                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                      : "bg-red-600 text-white hover:bg-red-700"
                                  }`}
                                  onClick={() => handleCheckOut(doctor.id)}
                                >
                                  {doctor.status === "Not Available" ? "Checked Out" : "Check Out"}
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm">
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
                              {/* <button
                                onClick={() => handleLeaveRequest(doctor.id)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Request Leave
                              </button> */}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No doctors match your filters
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* {isMobile && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                      <h3 className="text-lg text-gray-600 font-semibold">Calendar</h3>
                    </div>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border-none"
                    />
                  </motion.div>
                )} */}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DoctorCheckIn;