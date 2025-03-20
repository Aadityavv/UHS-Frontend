import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Date formatting function
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResp, medResp] = await Promise.all([
          axios.get("http://localhost:8081/api/doctor/getPatient", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:8081/api/doctor/stock/available", {
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
          imageUrl: `http://localhost:8081/${response.patient.imageUrl}`,
          docName: response.docName,
          height: response.medicalDetails.height,
          weight: response.medicalDetails.weight,
          temp: response.temp,
          designation: response.designation,
          date: formatDate(response.date), // Use formatted date
          time: response.time,
          residenceType: response.medicalDetails.residenceType,
        };

        setNdata(formatData);
        setStock(medResp.data);
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
  }, []);

  const handleSubmit = async () => {
    try {
      const medAry = rows.map((_, index) => ({
        medicine: medLst?.[index],
        dosageMorning: parseFloat((document.querySelector(`.dosage-morning-${index}`) as HTMLInputElement)?.value || "0"),
        dosageAfternoon: parseFloat((document.querySelector(`.dosage-afternoon-${index}`) as HTMLInputElement)?.value || "0"),
        dosageEvening: parseFloat((document.querySelector(`.dosage-evening-${index}`) as HTMLInputElement)?.value || "0"),
        duration: parseInt((document.querySelector(`.duration-${index}`) as HTMLInputElement)?.value || "0"),
        suggestion: (document.querySelector(`.suggestion-${index}`) as HTMLInputElement)?.value || "",
      }));

      const resp = await axios.post(
        "http://localhost:8081/api/doctor/prescription/submit",
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
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to submit prescription.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleRelease = async () => {
    try {
      const resp = await axios.get(
        "http://localhost:8081/api/doctor/releasePatient",
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

  const addRow = () => setRows([...rows, { id: Date.now() }]);
  const removeRow = (id: number) => setRows(rows.filter((row) => row.id !== id));

  const handleMedicineSelect = (index: number, medicine: string) => {
    const indx = medicine.indexOf(":");
    setSelectedMedicine({
      ...selectedMedicine,
      [index]: medicine.substring(0, indx),
    });
    setMedLst({ ...medLst, [index]: medicine.substring(indx + 1) });

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Helper component for detail items
  const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-indigo-600">{label}</label>
      <p className="text-sm bg-indigo-50 p-2 rounded-md">{value || "-"}</p>
    </div>
  );

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] p-4 bg-slate-50">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Patient Header Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  className="w-24 h-24 rounded-xl border-2 border-indigo-100 object-cover"
                  src={ "/default-user.jpg"}
                  alt="Patient"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-user.jpg";
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-indigo-800">{ndata.name}</h1>
                  <p className="text-slate-500">University Health Services</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="space-y-1 text-md font-medium">
                  <div className="text-indigo-600">{ndata.date}</div>
                  <div className="text-slate-500">{ndata.time}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Patient Info Grid */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">Student ID</label>
              <div className="text-lg font-medium text-indigo-800 mt-1">{ndata.id}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">Age & Gender</label>
              <div className="text-lg font-medium text-indigo-800 mt-1">
                {ndata.age} / {ndata.sex}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">School</label>
              <div className="text-lg font-medium text-indigo-800 mt-1">{ndata.course}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">Residence Type</label>
              <div className="text-lg font-medium text-indigo-800 mt-1">{ndata.residenceType}</div>
            </div>
          </motion.div>

          {/* Medical Information */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Medical Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm text-slate-500">Height</label>
                <div className="text-lg font-medium text-indigo-800">{ndata.height} cm</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm text-slate-500">Weight</label>
                <div className="text-lg font-medium text-indigo-800">{ndata.weight} kg</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm text-slate-500">Temperature</label>
                <div className="text-lg font-medium text-indigo-800">{ndata.temp} °F</div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  ndata.allergies
                    ? "bg-gradient-to-r from-red-400 to-red-500 text-white"
                    : "bg-gradient-to-r from-green-400 to-green-500 text-white"
                }`}
              >
                <label className="text-sm">Allergies</label>
                <div className="text-lg font-medium">
                  {ndata.allergies ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Medical History Sections */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Popover>
              <PopoverTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-indigo-800 mb-2">Medical History</h3>
                  <p className="text-slate-600 line-clamp-3">{ndata.medHis || "No history available"}</p>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="max-w-sm p-4 bg-white rounded-xl shadow-lg border border-slate-200">
                <p className="text-indigo-800">{ndata.medHis}</p>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-indigo-800 mb-2">Family History</h3>
                  <p className="text-slate-600 line-clamp-3">{ndata.famHis || "No family history"}</p>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="max-w-sm p-4 bg-white rounded-xl shadow-lg border border-slate-200">
                <p className="text-indigo-800">{ndata.famHis}</p>
              </PopoverContent>
            </Popover>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-2">Consultation Reason</h3>
              <p className="text-slate-600">{ndata.reason}</p>
            </div>
          </motion.div>

          {/* Diagnosis Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Diagnosis
            </h3>
            <Textarea
              className="mt-2 bg-slate-50 border-slate-200 focus:border-indigo-300 rounded-xl h-32"
              placeholder="Enter diagnosis..."
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </motion.div>

          {/* Medications Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Prescribed Medications
              </h3>
              <Button
                onClick={addRow}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                + Add Medication
              </Button>
            </div>

            <div className="space-y-4">
              {rows.map((row, index) => (
                <motion.div
                  key={row.id}
                  variants={tableRowVariants}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Medicine</label>
                      <Select onValueChange={(value) => handleMedicineSelect(index, value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Medicine" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-auto">
                          <input
                            ref={searchInputRef}
                            placeholder="Search medicine..."
                            className="w-full p-2 mb-2 border rounded-md"
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          {stock
                            .filter((medicine) =>
                              medicine.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((medicine) => (
                              <SelectItem
                                key={medicine.id}
                                value={`${medicine.medicineName}:${medicine.id}`}
                              >
                                {medicine.medicineName} ({medicine.quantity} available)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Morning</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          className="text-center dosage-morning-${index}"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Afternoon</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          className="text-center dosage-afternoon-${index}"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Evening</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          className="text-center dosage-evening-${index}"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Duration (days)</label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        className="duration-${index}"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-600">Notes</label>
                      <Textarea className="resize-none suggestion-${index}" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={() => removeRow(row.id)}
                      variant="destructive"
                      size="sm"
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Recommendations
              </h3>
              <Textarea
                className="bg-slate-50 border-slate-200 h-32"
                placeholder="Enter recommendations..."
                onChange={(e) => setDietary(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Required Tests
              </h3>
              <Textarea
                className="bg-slate-50 border-slate-200 h-32"
                placeholder="Enter required tests..."
                onChange={(e) => setTests(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <div className="text-lg font-bold text-indigo-800">{ndata.docName}</div>
                <div className="text-slate-600">{ndata.designation}</div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button
                  onClick={handleSubmit}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  Submit Prescription
                </Button>
                <Button
                  onClick={handleRelease}
                  className="w-full md:w-auto bg-rose-600 hover:bg-rose-700"
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