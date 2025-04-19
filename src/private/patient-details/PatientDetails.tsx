import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PatientDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [dietary, setDietary] = useState<string>(""); 
  const [tests, setTests] = useState<string>(""); 
  const [medLst, setMedLst] = useState<Record<number, string>>({});
  const [rows, setRows] = useState([{ id: 1 }]);
  const [ndata, setNdata] = useState<any>({});
  const [stock, setStock] = useState<Array<{ id: string; medicineName: string; quantity: number }>>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Record<number, string>>({}); 
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isFollowUp, setIsFollowUp] = useState<boolean>(false);
  const [fetchedOnce, setFetchedOnce] = useState(false);


  // Date formatting function
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const [currentDate, setCurrentDate] = useState(formatDate(new Date().toISOString()));

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  const age = (dob: string) => {
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(formatDate(now.toISOString()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      if (fetchedOnce) return;
  
      try {
        setFetchedOnce(true); // mark fetch started to block repeat
        const [patientResp, medResp] = await Promise.all([
          axios.get("https://uhs-backend.onrender.com/api/doctor/getPatient", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("https://uhs-backend.onrender.com/api/doctor/stock/available", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "X-Latitude": localStorage.getItem("latitude"),
              "X-Longitude": localStorage.getItem("longitude"),
            },
          }),
        ]);
  
        const response = patientResp.data;
        const formatData = {
          name: response.patient.name,
          age: age(response.patient.dateOfBirth),
          sex: response.patient.gender,
          id: response.patient.sapID,
          course: response.patient.school,
          medHis: response.medicalDetails.medicalHistory,
          famHis: response.medicalDetails.familyMedicalHistory,
          allergies: response.medicalDetails.allergies,
          reason: response.reason,
          email: response.patient.email,
          imageUrl: `https://uhs-backend.onrender.com/${response.patient.imageUrl}`,
          docName: response.docName,
          height: response.medicalDetails.height,
          weight: response.medicalDetails.weight,
          temp: response.temp,
          designation: response.designation,
          date: formatDate(currentDate),
          time: response.time,
          residenceType: response.medicalDetails.residenceType,
        };
  
        const checkFollowUp = async (email: string) => {
          try {
            const { data } = await axios.get(
              `https://uhs-backend.onrender.com/api/doctor/appointment/isFollowUp/${email}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            setIsFollowUp(data);
            console.log("Follow-up status:", data);
          } catch (err) {
            console.error("Failed to fetch follow-up status");
            setIsFollowUp(false);
          }
        };
  
        setNdata(formatData);
        setStock(medResp.data);
        checkFollowUp(response.patient.email);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "Failed to fetch data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    };
  
    fetchData();
  }, [fetchedOnce]); // <-- Include this to ensure the useEffect watches the guard
  

  const handleSubmit = async () => {
    try {
      if (!diagnosis.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Diagnosis is required",
          action: <ToastAction altText="Understand">OK</ToastAction>,
        });
        return;
      }
  
      if (!dietary.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Recommendations are required",
          action: <ToastAction altText="Understand">OK</ToastAction>,
        });
        return;
      }
  
      if (!tests.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Required tests are needed",
          action: <ToastAction altText="Understand">OK</ToastAction>,
        });
        return;
      }
  
      const medAry = rows.map(row => {
        const medicineId = selectedMedicine[row.id];
        const medicineName = medLst[row.id];
        const duration = parseInt(
          (document.querySelector(`.duration-${row.id}`) as HTMLInputElement)?.value || "0"
        );
        const dosageMorning = parseFloat(
          (document.querySelector(`.dosage-morning-${row.id}`) as HTMLInputElement)?.value || "0"
        );
        const dosageAfternoon = parseFloat(
          (document.querySelector(`.dosage-afternoon-${row.id}`) as HTMLInputElement)?.value || "0"
        );
        const dosageEvening = parseFloat(
          (document.querySelector(`.dosage-evening-${row.id}`) as HTMLInputElement)?.value || "0"
        );
        const suggestion = (
          (document.querySelector(`.suggestion-${row.id}`) as HTMLTextAreaElement)?.value || ""
        );
  
        const isAnyFieldFilled =
          duration > 0 ||
          dosageMorning > 0 ||
          dosageAfternoon > 0 ||
          dosageEvening > 0 ||
          suggestion.trim() !== "";
  
        if (isAnyFieldFilled && !medicineId) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Choose medicine for incomplete row`,
            action: <ToastAction altText="Understand">OK</ToastAction>,
          });
          throw new Error("Validation failed");
        }
  
        if (!isAnyFieldFilled && !medicineId) {
          return null;
        }
  
        if (medicineId && duration < 1) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Duration must be at least 1 day for ${medicineName}`,
            action: <ToastAction altText="Understand">OK</ToastAction>,
          });
          throw new Error("Validation failed");
        }
  
        return {
          medicine: medicineId,
          medicineName,
          dosageMorning,
          dosageAfternoon,
          dosageEvening,
          duration,
          suggestion,
        };
      }).filter(Boolean);
  
      const resp = await axios.post(
        "https://uhs-backend.onrender.com/api/doctor/prescription/submit",
        {
          diagnosis,
          dietaryRemarks: dietary,
          testNeeded: tests,
          meds: medAry,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
  
      toast({ title: "Success", description: resp.data });
      navigate("/doctor-dashboard");
    } catch (err: any) {
      if (err.message !== "Validation failed") {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "Failed to submit prescription.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    }
  };

  const handleRelease = async () => {
    try {
      const resp = await axios.get(
        "https://uhs-backend.onrender.com/api/doctor/releasePatient",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast({
        title: "Patient Released",
        description: resp.data.message || "Patient released successfully.",
      });
      navigate(-1);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "An error occurred while releasing the patient.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleViewPreviousPrescription = async () => {
    try {
      const token = localStorage.getItem("token");
      const rawEmail = ndata?.email;
  
      if (!rawEmail) {
        toast({
          variant: "destructive",
          title: "Missing Email",
          description: "No patient email found for fetching prescription.",
        });
        return;
      }
  
      const { data } = await axios.get(
        `https://uhs-backend.onrender.com/api/doctor/prescription/latest/${rawEmail}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const appointmentId = data.appointmentId;
      if (!appointmentId) {
        toast({
          variant: "destructive",
          title: "No Last Prescription Found",
          description: "Could not find a valid previous prescription record.",
        });
        return;
      }
  
      navigate(`/prescription?id=${appointmentId}`, {
        state: { prevPath: window.location.pathname }
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Fetching Last Prescription",
        description:
          error.response?.data?.message || "Failed to fetch previous prescription.",
      });
    }
  
  };
  
  const addRow = () => setRows([...rows, { id: Date.now() }]);
  const removeRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
    setSelectedMedicine(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setMedLst(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleMedicineSelect = (rowId: number, value: string) => {
    const [medicineId, medicineName] = value.split(':');
    setSelectedMedicine(prev => ({ ...prev, [rowId]: medicineId }));
    setMedLst(prev => ({ ...prev, [rowId]: medicineName }));
  
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] p-2 sm:p-4 bg-slate-50">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-6xl mx-auto space-y-4 sm:space-y-8"
        >
          {/* Patient Header Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl border-2 border-indigo-100 object-cover"
                  src={ndata.imageUrl || "/default-user.jpg"}
                  alt="Patient"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-user.jpg";
                  }}
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-indigo-800">{ndata.name}</h1>
                  <p className="text-sm sm:text-base text-slate-500">Patient</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="space-y-1 text-sm sm:text-base font-medium">
                  <div className="text-indigo-600">{currentDate}</div>
                  <div className="text-slate-500">{currentTime}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Patient Info Grid */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
          >
            <div className="bg-white p-2 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">Student ID</label>
              <div className="text-sm sm:text-lg font-medium text-indigo-800 mt-1">{ndata.id}</div>
            </div>
            <div className="bg-white p-2 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">Age & Gender</label>
              <div className="text-sm sm:text-lg font-medium text-indigo-800 mt-1">
                {ndata.age} / {ndata.sex}
              </div>
            </div>
            <div className="bg-white p-2 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">School</label>
              <div className="text-sm sm:text-lg font-medium text-indigo-800 mt-1">{ndata.course}</div>
            </div>
            <div className="bg-white p-2 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">Residence Type</label>
              <div className="text-sm sm:text-lg font-medium text-indigo-800 mt-1">{ndata.residenceType}</div>
            </div>
          </motion.div>

          {/* Medical Information */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200"
          >
            <h3 className="text-lg font-bold text-indigo-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2 h-5 sm:h-6 bg-indigo-500 rounded-full"></span>
              Medical Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-slate-50 p-2 sm:p-4 rounded-lg">
                <label className="text-xs sm:text-sm text-slate-500">Height</label>
                <div className="text-sm sm:text-lg font-medium text-indigo-800">{ndata.height} cm</div>
              </div>
              <div className="bg-slate-50 p-2 sm:p-4 rounded-lg">
                <label className="text-xs sm:text-sm text-slate-500">Weight</label>
                <div className="text-sm sm:text-lg font-medium text-indigo-800">{ndata.weight} kg</div>
              </div>
              <div className="bg-slate-50 p-2 sm:p-4 rounded-lg">
                <label className="text-xs sm:text-sm text-slate-500">Temperature</label>
                <div className="text-sm sm:text-lg font-medium text-indigo-800">{ndata.temp} °F</div>
              </div>
              <div
                className={`p-2 sm:p-4 rounded-lg ${
                  ndata.allergies
                    ? "bg-gradient-to-r from-red-400 to-red-500 text-white"
                    : "bg-gradient-to-r from-green-400 to-green-500 text-white"
                }`}
              >
                <label className="text-xs sm:text-sm">Allergies</label>
                <div className="text-sm sm:text-lg font-medium">
                  {ndata.allergies ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Medical History Sections */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            <Popover>
              <PopoverTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-indigo-800 mb-2">Medical History</h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">{ndata.medHis || "No history available"}</p>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="max-w-xs sm:max-w-sm p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-lg border border-slate-200">
                <p className="text-sm sm:text-base text-indigo-800">{ndata.medHis}</p>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-indigo-800 mb-2">Family History</h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">{ndata.famHis || "No family history"}</p>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="max-w-xs sm:max-w-sm p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-lg border border-slate-200">
                <p className="text-sm sm:text-base text-indigo-800">{ndata.famHis}</p>
              </PopoverContent>
            </Popover>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-2">Consultation Reason</h3>
              <p className="text-xs sm:text-sm text-slate-600">{ndata.reason}</p>
            </div>
          </motion.div>

          {/* Diagnosis Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200"
          >
            <h3 className="text-lg font-bold text-indigo-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2 h-5 sm:h-6 bg-indigo-500 rounded-full"></span>
              Diagnosis
            </h3>
            <Textarea
              className="mt-2 bg-slate-50 border-slate-200 focus:border-indigo-300 rounded-lg sm:rounded-xl h-32 text-sm sm:text-base"
              placeholder="Enter diagnosis..."
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </motion.div>

          {/* Medications Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
                <span className="w-2 h-5 sm:h-6 bg-indigo-500 rounded-full"></span>
                Prescribed Medications
              </h3>
              <Button
                onClick={addRow}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                size={isMobile ? "sm" : "default"}
              >
                + Add Medication
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {rows.map((row) => (
                <motion.div
                  key={row.id}
                  variants={tableRowVariants}
                  className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Medicine</label>
                      <Select onValueChange={(value) => handleMedicineSelect(row.id, value)}>
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder="Select Medicine" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          <input
                            ref={searchInputRef}
                            placeholder="Search medicine..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 mb-2 border rounded-md text-xs sm:text-sm"
                          />
                          {stock
                            .filter(medicine => 
                              medicine.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .filter(medicine => {
                              const isSelectedElsewhere = Object.entries(selectedMedicine).some(
                                ([otherRowId, medId]) => 
                                  parseInt(otherRowId) !== row.id && medId === medicine.id
                              );
                              const isCurrentSelection = selectedMedicine[row.id] === medicine.id;
                              return !isSelectedElsewhere || isCurrentSelection;
                            })
                            .map(medicine => (
                              <SelectItem
                                key={medicine.id}
                                value={`${medicine.id}:${medicine.medicineName}`}
                                className="text-xs sm:text-sm"
                              >
                                {medicine.medicineName} ({medicine.quantity} available)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-600">Morning</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          className={`dosage-morning-${row.id} text-xs sm:text-sm h-8 sm:h-10`}
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-600">Afternoon</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          className={`dosage-afternoon-${row.id} text-xs sm:text-sm h-8 sm:h-10`}
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-600">Evening</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          className={`dosage-evening-${row.id} text-xs sm:text-sm h-8 sm:h-10`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Duration (days)</label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        className={`duration-${row.id} text-xs sm:text-sm h-8 sm:h-10`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs sm:text-sm font-medium text-slate-600">Notes</label>
                      <Textarea className={`suggestion-${row.id} text-xs sm:text-sm h-16 sm:h-20`} />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3 sm:mt-4">
                    <Button
                      onClick={() => removeRow(row.id)}
                      variant="destructive"
                      size={isMobile ? "sm" : "default"}
                    >
                      Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations & Tests */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-5 sm:h-6 bg-indigo-500 rounded-full"></span>
                Recommendations
              </h3>
              <Textarea
                className="bg-slate-50 border-slate-200 h-32 text-sm sm:text-base"
                placeholder="Enter recommendations..."
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-5 sm:h-6 bg-indigo-500 rounded-full"></span>
                Required Tests
              </h3>
              <Textarea
                className="bg-slate-50 border-slate-200 h-32 text-sm sm:text-base"
                placeholder="Enter required tests..."
                value={tests}
                onChange={(e) => setTests(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-lg font-bold text-indigo-800">{ndata.docName}</div>
                <div className="text-sm sm:text-base text-slate-600">{ndata.designation}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                  size={isMobile ? "sm" : "default"}
                >
                  Submit Prescription
                </Button>
                <Button
                  onClick={handleViewPreviousPrescription}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  disabled={!isFollowUp}
                  size={isMobile ? "sm" : "default"}
                >
                  View Previous Prescription
                </Button>
                <Button
                  onClick={handleRelease}
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700"
                  size={isMobile ? "sm" : "default"}
                >
                  Release Patient
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default PatientDetails;