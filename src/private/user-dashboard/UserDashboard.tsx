import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import dayjs from 'dayjs';
import {
  Activity,
  Calendar,
  AlertCircle,
  Stethoscope,
  Pill,
  User,
  MapPin,
  ChevronRight,
  HeartPulse,
  Thermometer,
  Weight,
  Shield
} from "lucide-react";
import Skeleton from '@mui/material/Skeleton';
import { ToastAction } from "@radix-ui/react-toast";
import BreathingExercise from '@/components/BreathingExercise';

type Medication = {
  pres_medicine_id: string;
  medicineName?: string;
  dosage?: string;
  duration?: number;
  appointmentDate?: string;
  endDate?: string;
};

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [status, setStatus] = useState({
    appointmentStatus: "",
    doctorName: "",
    tokenNo: "",
    currentTokenNo: "",
  });

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    phoneNumber: "",
    bloodGroup: "",
    imageUrl: "",
    allergies: "",
  });

  const [loading, setLoading] = useState(true);
  const [activeMedications, setActiveMedications] = useState<Medication[]>([]);
  const [lastAppointmentDate, setLastAppointmentDate] = useState<string | null>(null);
  const [loadingMedications, setLoadingMedications] = useState(true);
  const [locationName, setLocationName] = useState("");
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [allergies, setAllergies] = useState<string>("N/A");
  const [bmi, setBmi] = useState<string>("N/A");
  const [currentTime, setCurrentTime] = useState<string>(dayjs().format('h:mm A'));

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('h:mm A'));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateBMI = (heightCm: number, weightKg: number): string => {
    if (!heightCm || !weightKg) return "N/A";
    const heightM = heightCm / 100;
    const bmiValue = weightKg / (heightM * heightM);
    return bmiValue.toFixed(1);
  };

  const fetchMedicalDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !userDetails.email) return;

    try {
      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/medical-details/email/${userDetails.email}`,
      );

      if (response?.data) {
        const medicalData = response.data;
        setAllergies(medicalData.allergies || "N/A");
        if (medicalData.height && medicalData.weight) {
          setBmi(calculateBMI(medicalData.height, medicalData.weight));
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching medical details:", error);
      toast({
        title: "Error",
        description: "Couldn't fetch medical details",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }, [toast, userDetails.email]);

  const fetchActiveMedications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !userDetails.email) return;

    const encodedEmail = encodeURIComponent(userDetails.email);
    setLoadingMedications(true);

    try {
      const response = await axios.get<Medication[]>(
        `https://uhs-backend.onrender.com/api/patient/medications/active/${encodedEmail}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data) {
        const uniqueMedications = Array.from(
          new Map(response.data.map((med: Medication) => [med.pres_medicine_id, med])).values()
        );
        setActiveMedications(uniqueMedications);
      }
    } catch (error: unknown) {
      console.error("Active medications fetch error:", error);
      toast({
        title: "Error",
        description: "Couldn't fetch active medications",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setLoadingMedications(false);
    }
  }, [toast, userDetails.email]);

  const fetchCurrentTokenNumber = useCallback(async () => {
    const token = localStorage.getItem("token");
    const locationId = localStorage.getItem("locationId");
    
    if (!token || !locationId) {
      setStatus(prev => ({ ...prev, currentTokenNo: "Login Again" }));
      return;
    }
  
    try {
      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/current-appointment/current-token?locationId=${locationId}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );
      setStatus(prevStatus => ({
        ...prevStatus,
        currentTokenNo: response.data || "N/A",
      }));
    } catch (error) {
      console.error("Error fetching current token number:", error);
      setStatus(prevStatus => ({
        ...prevStatus,
        currentTokenNo: "N/A (Error)",
      }));
    }
  }, []);
  
  useEffect(() => {
    fetchCurrentTokenNumber();
    const interval = setInterval(fetchCurrentTokenNumber, 30000);
    return () => clearInterval(interval);
  }, [fetchCurrentTokenNumber]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const savedLocation = localStorage.getItem("locationName");
    setLocationName(savedLocation || "Location not available");

    const fetchData = async () => {
      setLoading(true);
      setLoadingMedications(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [userRes, statusRes, lastAppointmentRes] = await Promise.allSettled([
          axios.get("https://uhs-backend.onrender.com/api/patient/", { headers }),
          axios.get("https://uhs-backend.onrender.com/api/patient/getStatus", { headers }),
          axios.get("https://uhs-backend.onrender.com/api/patient/lastPrescriptionDate", { headers }),
        ]);

        if (userRes.status === "fulfilled" && userRes.value?.data) {
          setUserDetails(userRes.value.data);
        }

        if (statusRes.status === "fulfilled" && statusRes.value?.data) {
          const data = statusRes.value.data;
          setStatus({
            appointmentStatus: data.Appointment ? "Queued" : "NA",
            doctorName: data.Doctor ? data.DoctorName : "Not Appointed",
            tokenNo: data.TokenNo || "N/A",
            currentTokenNo: data.currentTokenNo || "...",
          });
        }

        if (lastAppointmentRes.status === "fulfilled" && lastAppointmentRes.value?.data) {
          setLastAppointmentDate(dayjs(lastAppointmentRes.value.data).format("DD/MM/YYYY"));
        }

        await Promise.all([fetchActiveMedications(), fetchMedicalDetails(), fetchCurrentTokenNumber()]);

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast({
          title: "Error",
          description: "Something went wrong!",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setLoading(false);
        setLoadingMedications(false);
      }
    };

    fetchData();
  }, [navigate, toast, fetchActiveMedications, fetchMedicalDetails, fetchCurrentTokenNumber]);

  return (
    <div className="min-h-[79vh] overflow-x-hidden bg-gray-50">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block w-full lg:w-1/4 space-y-6">
            {/* PROFILE CARD */}
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
                        src={userDetails.imageUrl 
                          ? `https://uhs-backend.onrender.com/${userDetails.imageUrl}`
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
                        {userDetails.dateOfBirth
                          ? dayjs(userDetails.dateOfBirth).format("DD/MM/YYYY")
                          : "N/A"}
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

            {/* BREATHING EXERCISE */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <BreathingExercise/>
            </motion.div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* STATUS CARDS */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* APPOINTMENT STATUS */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white"
              >
                {loading ? (
                  <>
                    <Skeleton variant="text" width={120} height={24} className="mb-4 bg-indigo-400" />
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton variant="text" width={150} height={32} className="mb-2 bg-indigo-400" />
                        <Skeleton variant="text" width={100} height={20} className="bg-indigo-400" />
                      </div>
                      <Skeleton variant="circular" width={56} height={56} className="bg-indigo-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium opacity-90 mb-1">Current Status</h3>
                        <p className="text-2xl font-bold mb-2">
                          {status.appointmentStatus === "Queued" ? "In Queue" : "No Appointment"}
                        </p>
                        <div className="text-sm opacity-90">{status.doctorName}</div>
                      </div>
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {currentTime}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <div>
                        <p className="text-xs opacity-80 mb-1">Your Token</p>
                        <p className="text-xl font-bold">{status.tokenNo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-80 mb-1">Current Token</p>
                        <p className="text-xl font-bold">{status.currentTokenNo}</p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              {/* QUICK ACTIONS */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-md font-medium text-gray-700 mb-2">Quick Actions</h3>
                <button
                  onClick={() => navigate("/patient-appointment")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3 group-hover:bg-indigo-200 transition-colors">
                      <Stethoscope className="h-5 w-5 text-indigo-700" />
                    </div>
                    <span className="text-indigo-700 font-medium">New Appointment</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-indigo-700 opacity-70" />
                </button>
                <button
                  onClick={() => navigate("/patient-prescription")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3 group-hover:bg-emerald-200 transition-colors">
                      <Pill className="h-5 w-5 text-emerald-700" />
                    </div>
                    <span className="text-emerald-700 font-medium">Prescriptions</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-emerald-700 opacity-70" />
                </button>
                <button
                  onClick={() => navigate("/emergency")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="bg-rose-100 p-2 rounded-lg mr-3 group-hover:bg-rose-200 transition-colors">
                      <AlertCircle className="h-5 w-5 text-rose-700" />
                    </div>
                    <span className="text-rose-700 font-medium">Emergency</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-rose-700 opacity-70" />
                </button>
              </motion.div>

              {/* HEALTH STATS */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-md font-medium text-gray-700 mb-4">Health Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="flex items-center mb-1">
                      <HeartPulse className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-xs text-blue-600">Blood Group</span>
                    </div>
                    <p className="font-semibold text-blue-800">
                      {userDetails.bloodGroup || "N/A"}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <div className="flex items-center mb-1">
                      <Thermometer className="h-4 w-4 text-amber-600 mr-2" />
                      <span className="text-xs text-amber-600">Allergies</span>
                    </div>
                    <p className="font-semibold text-amber-800">
                      {allergies}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl">
                    <div className="flex items-center mb-1">
                      <Weight className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-xs text-green-600">BMI</span>
                    </div>
                    <p className="font-semibold text-green-800">
                      {bmi}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <div className="flex items-center mb-1">
                      <Shield className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-xs text-purple-600">Last Visit</span>
                    </div>
                    <p className="font-semibold text-purple-800">
                      {lastAppointmentDate || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* HEALTH OVERVIEW */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Health Overview</h3>
                <button 
                  onClick={() => navigate("/patient-prescription")}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View All
                </button>
              </div>
              
              {/* MEDICATIONS */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <Pill className="h-4 w-4 mr-2 text-indigo-500" />
                  Active Medications
                </h4>
                {loadingMedications ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} variant="rectangular" height={80} className="rounded-xl" />
                    ))}
                  </div>
                ) : activeMedications.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activeMedications.slice(0, 3).map((med) => (
                      <motion.div 
                        key={med.pres_medicine_id}
                        whileHover={{ y: -2 }}
                        className="bg-indigo-50 p-4 rounded-xl cursor-pointer"
                        onClick={() => setSelectedMed(med)}
                      >
                        <div className="flex items-center mb-2">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <Pill className="h-5 w-5 text-indigo-700" />
                          </div>
                          <h5 className="font-medium text-indigo-900 capitalize">
                            {med.medicineName}
                          </h5>
                        </div>
                        <p className="text-xs text-indigo-700">
                          {med.dosage || "Dosage not specified"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <p className="text-gray-500">No active medications</p>
                  </div>
                )}
              </div>

              {/* UPCOMING APPOINTMENTS */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                  Recent Appointments
                </h4>
                <div className="bg-gray-50 p-6 rounded-xl text-center">
                  <p className="text-gray-500">
                    {lastAppointmentDate 
                      ? `Last appointment on ${lastAppointmentDate}`
                      : "No recent appointments"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* MOBILE BREATHING EXERCISE */}
            <div className="lg:hidden mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <BreathingExercise/>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MEDICATION DETAILS DIALOG */}
      <Dialog open={!!selectedMed} onOpenChange={() => setSelectedMed(null)}>
        <DialogContent className="max-w-sm w-full">
          {selectedMed && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Pill className="h-6 w-6 text-indigo-700" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center capitalize">
                {selectedMed.medicineName}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Dosage:</span>
                  <span className="font-medium">{selectedMed.dosage || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Frequency:</span>
                  <span className="font-medium">
                    {selectedMed.duration ? `${selectedMed.duration} times/day` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium">
                    {selectedMed.appointmentDate ? dayjs(selectedMed.appointmentDate).format("DD/MM/YYYY") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date:</span>
                  <span className="font-medium">
                    {selectedMed.endDate ? dayjs(selectedMed.endDate).format("DD/MM/YYYY") : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;