import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import dayjs from 'dayjs';
import {
  Activity,
  Calendar,
  AlertCircle,
  Stethoscope,
  Pill,
  User,
  MapPin
} from "lucide-react";
import Skeleton from '@mui/material/Skeleton';
import { ToastAction } from "@radix-ui/react-toast";

// ✅ Define Medication type here (outside the component)
type Medication = {
  pres_medicine_id: string;
  medicineName?: string;
  dosage?: string;
  duration?: number;
  appointmentDate?: string;
  endDate?: string;
  // Add any other fields if they exist in your backend response
};

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [status, setStatus] = useState({
    appointmentStatus: "",
    doctorName: "",
    tokenNo: "",
    currentTokenNo: "", // New state for current token number
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
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);


  // ✅ New state for allergies and BMI
  const [allergies, setAllergies] = useState<string>("N/A");
  const [bmi, setBmi] = useState<string>("N/A");

  // ✅ Function to calculate BMI
  const calculateBMI = (heightCm: number, weightKg: number): string => {
    if (!heightCm || !weightKg) return "N/A";
    const heightM = heightCm / 100;
    const bmiValue = weightKg / (heightM * heightM);
    return bmiValue.toFixed(1); // One decimal place
  };

  // ✅ Fetch medical details including allergies and bmi
  const fetchMedicalDetails = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token || !userDetails.email) {
      console.warn("Missing token or user email for fetching medical details.");
      return;
    }
    console.log("Fetching medical details for:", userDetails.email);

    try {
      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/medical-details/email/${userDetails.email}`,
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // }
      );

      if (response?.data) {
        const medicalData = response.data;

        console.log("Medical details fetched:", medicalData);

        // Set allergies
        setAllergies(medicalData.allergies || "N/A");

        // Calculate and set BMI
        if (medicalData.height && medicalData.weight) {
          const calculatedBMI = calculateBMI(medicalData.height, medicalData.weight);
          setBmi(calculatedBMI);
        } else {
          setBmi("N/A");
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

    if (!token || !userDetails.email) {
      console.warn("Missing token or user email for fetching active medications.");
      return;
    }

    const encodedEmail = encodeURIComponent(userDetails.email);
    console.log("Fetching active medications for:", encodedEmail);

    setLoadingMedications(true);

    try {
      const response = await axios.get<Medication[]>(
        `https://uhs-backend.onrender.com/api/patient/medications/active/${encodedEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response?.data) {
        const uniqueMedications = Array.from(
          new Map(response.data.map((med: Medication) => [med.pres_medicine_id, med])).values()
        );

        setActiveMedications(uniqueMedications);
      } else {
        setActiveMedications([]);
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
    console.log("LOCATION IS "+locationId)
    
    if (!token) {
      console.warn("Missing token for fetching current token number.");
      return;
    }
  
    if (!locationId) {
      console.warn("Location ID not found in localStorage");
      setStatus(prev => ({ ...prev, currentTokenNo: "Login Again" }));
      return;
    }
  
    try {
      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/current-appointment/current-token?locationId=${locationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000 // Add timeout to prevent hanging
        }
      );
  
      setStatus(prevStatus => ({
        ...prevStatus,
        currentTokenNo: response.data || "N/A", // Handle empty response
      }));
    } catch (error) {
      console.error("Error fetching current token number:", error);
      setStatus(prevStatus => ({
        ...prevStatus,
        currentTokenNo: "N/A (Error)",
      }));
    }
  }, []);
  
  // Initialize and refresh current token periodically
  useEffect(() => {
    // Fetch immediately on mount
    fetchCurrentTokenNumber();
    
    // Then set up periodic refresh
    const interval = setInterval(fetchCurrentTokenNumber, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchCurrentTokenNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentTokenNumber();
    }, 30000); // Refresh every 30 seconds
  
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
          axios.get("https://uhs-backend.onrender.com/api/patient/lastAppointmentDate", { headers }),
        ]);

        // Handle User Details ✅
        if (userRes.status === "fulfilled" && userRes.value?.data) {
          const userData = userRes.value.data;
          setUserDetails(userData);
        } else if (userRes.status === "rejected") {
          const errorReason = (userRes as PromiseRejectedResult).reason;
          console.error("Failed to fetch user details:", errorReason);

          toast({
            title: "Error",
            description: "Failed to fetch user details.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });

          return; // if no user data, we can't continue
        }

        // Handle Status ✅
        if (statusRes.status === "fulfilled" && statusRes.value?.data) {
          const data = statusRes.value.data;
          setStatus({
            appointmentStatus: data.Appointment ? "Queued" : "NA",
            doctorName: data.Doctor ? data.DoctorName : "Not Appointed",
            tokenNo: data.TokenNo || "N/A",
            currentTokenNo: data.currentTokenNo || "...", // Set current token number
          });
        } else {
          console.warn("No appointment status available (might be no active appointment).");
          setStatus({
            appointmentStatus: "NA",
            doctorName: "Not Appointed",
            tokenNo: "N/A",
            currentTokenNo: "...", // Set current token number
          });
        }

        // Handle Last Appointment ✅
        if (lastAppointmentRes.status === "fulfilled" && lastAppointmentRes.value?.data) {
          const formattedDate = dayjs(lastAppointmentRes.value.data).format("DD/MM/YYYY");
          setLastAppointmentDate(formattedDate);
        } else {
          console.warn("No last appointment date found.");
          setLastAppointmentDate(null);
        }

        // Additional data fetching
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

  console.log(userDetails);

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
                        src={userDetails.imageUrl || "/default-user.jpg"}
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
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* STATUS CARDS */}
            <div className="grid md:grid-cols-3 gap-3 mb-8">
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
                    <h3 className="text-sm font-medium opacity-90 mb-4">Current Status</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold mb-2">
                          {status.appointmentStatus === "Queued" ? "In Queue" : "No Appointment"}
                        </p>
                        <div className="text-sm opacity-90">{status.doctorName}</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl">
                        <Stethoscope className="h-8 w-8" />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  onClick={() => navigate("/patient-appointment")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <span className="text-indigo-700 font-medium">New Appointment</span>
                  <Stethoscope className="h-5 w-5 text-indigo-700" />
                </button>
                <button
                  onClick={() => navigate("/patient-prescription")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-emerald-700 font-medium">Prescriptions</span>
                  <Pill className="h-5 w-5 text-emerald-700" />
                </button>
                <button
                  onClick={() => navigate("/emergency")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <span className="text-rose-700 font-medium">Emergency</span>
                  <AlertCircle className="h-5 w-5 text-rose-700" />
                </button>
              </motion.div>

              {/* NEXT STEPS */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl px-4 py-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-md font-medium text-gray-500 mb-4">Next Steps</h3>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Your Token Number:</span>
                    <span className="font-semibold text-indigo-600">{status.tokenNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Current Token Number:</span>
                    <span className="font-semibold text-indigo-600">{status.currentTokenNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Doctor Assigned:</span>
                    <span className="font-semibold text-indigo-600">{status.doctorName}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* HEALTH OVERVIEW */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Health Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Last Checkup</p>
                  <p className="font-medium">
                    {lastAppointmentDate ? lastAppointmentDate : "No records"}
                  </p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
  <p className="text-sm text-gray-600 mb-1">Active medications</p>
  {loadingMedications ? (
    <p className="font-medium">Loading...</p>
  ) : activeMedications.length > 0 ? (
    <Dialog open={medDialogOpen} onOpenChange={setMedDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-emerald-700 font-medium hover:underline p-0 h-auto"
        >
          View All ({activeMedications.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <h2 className="text-lg font-semibold text-center mb-4">
          Active Medications
        </h2>
        <ul className="space-y-2">
          {activeMedications.map((med) => (
            <li
              key={med.pres_medicine_id}
              className="cursor-pointer px-4 py-2 rounded-lg hover:bg-emerald-100 text-left border border-emerald-200"
              onClick={() => setSelectedMed(med)}
            >
              <span className="capitalize font-medium">{med.medicineName}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  ) : (
    <p className="font-medium">No Active Medications</p>
  )}
</div>

{/* Medication Details Dialog */}
<Dialog open={!!selectedMed} onOpenChange={() => setSelectedMed(null)}>
  <DialogContent className="max-w-sm w-full">
    {selectedMed && (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-center capitalize">
          {selectedMed.medicineName}
        </h2>
        <div className="text-sm text-gray-600">
          <p>
            <span className="font-medium">Start Date:</span>{" "}
            {selectedMed.appointmentDate ? dayjs(selectedMed.appointmentDate).format("DD/MM/YYYY") : "N/A"}
          </p>
          <p>
            <span className="font-medium">End Date:</span>{" "}
            {selectedMed.endDate ? dayjs(selectedMed.endDate).format("DD/MM/YYYY") : "N/A"}

          </p>
          <p>
            <span className="font-medium">Dosage:</span>{" "}
            {selectedMed.dosage || "N/A"}
          </p>
          <p>
            <span className="font-medium">Frequency:</span>{" "}
            {selectedMed.duration ? `${selectedMed.duration} times/day` : "N/A"}
          </p>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Allergies</p>
                  <p className="font-medium">{allergies}</p>
                </div>
                <div className="text-center p-4 bg-rose-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">BMI</p>
                  <p className="font-medium">{bmi}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;