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
  const [rows, setRows] = useState([1]);
  const [ndata, setNdata] = useState<any>({});
  const [stock, setStock] = useState<Array<{ id: string; medicineName: string; quantity: number }>>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const age = (dob: string) => {
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const slideIn = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResp, medResp] = await Promise.all([
          axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/getPatient", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/stock/available", {
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
          imageUrl: `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/${response.patient.imageUrl}`,
          docName: response.docName,
          height: response.medicalDetails.height,
          weight: response.medicalDetails.weight,
          temp: response.temp,
          designation: response.designation,
          date: response.date,
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

  // Rest of your existing code (handleSubmit, handleRelease, etc.)...
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const medAry = rows.map((_, index) => ({
        medicine: medLst?.[index],
        dosageMorning: (document.querySelector(`.dosage-morning-${index}`) as HTMLInputElement)?.value || 0,
        dosageAfternoon: (document.querySelector(`.dosage-afternoon-${index}`) as HTMLInputElement)?.value || 0,
        dosageEvening: (document.querySelector(`.dosage-evening-${index}`) as HTMLInputElement)?.value || 0,
        duration: (document.querySelector(`.duration-${index}`) as HTMLInputElement)?.value || 0,
        suggestion: (document.querySelector(`.suggestion-${index}`) as HTMLInputElement)?.value || "",
      }));

      const resp = await axios.post(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/prescription/submit",
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

  // Handle patient release
  const handleRelease = async () => {
    try {
      const resp = await axios.get(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/releasePatient",
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

  // Add/remove rows
  const addRow = () => setRows([...rows, rows.length + 1]);
  const removeRow = () => setRows(rows.slice(0, -1));

  // Handle medicine selection
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

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] p-4 bg-gradient-to-br from-indigo-50 to-blue-50 max-lg:min-h-[93svh] max-lg:p-2">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex justify-between mb-4 max-lg:flex-col max-lg:items-center gap-6"
        >
          {/* Patient Image */}
          <motion.div variants={fadeIn} className="flex justify-center items-center w-[25%] max-lg:w-[50%] max-lg:mb-4">
            <img
              className="border-2 border-indigo-100 rounded-xl shadow-lg w-48 h-48 object-cover hover:shadow-xl transition-shadow"
              src={ndata?.imageUrl || "..\default-user.jpg"}
              alt="Patient"
            />
          </motion.div>

          {/* Personal Information */}
          <motion.div
            variants={slideIn}
            className="w-full flex px-4 justify-between lg:gap-4 max-lg:flex-col bg-white rounded-2xl p-6 shadow-sm border border-indigo-50"
          >
            <div className="flex flex-col w-1/2 gap-4 max-lg:w-full">
              <div className="flex items-center gap-4">
                <label className="w-1/4 font-medium text-indigo-600">Name:</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.name || ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/4 font-medium text-indigo-600">Age:</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.age || ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/4 font-medium text-indigo-600">Gender:</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.sex || ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/4 font-medium text-indigo-600">SAP ID:</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.id || ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/4 font-medium text-indigo-600">School:</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.course || ""}
                  disabled
                />
              </div>
            </div>

            <div className="flex flex-col w-1/2 gap-4 max-lg:w-full">
              <div className="flex items-center gap-4">
                <label className="w-1/3 font-medium text-indigo-600">Height (cm):</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.height || ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/3 font-medium text-indigo-600">Weight (kg):</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold" 
                  value={ndata?.weight || ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/3 font-medium text-indigo-600">Temp (°F):</label>
                <Input
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.temp || ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-1/3 font-medium text-indigo-600">Reason:</label>
                <Textarea
                  className="w-full bg-indigo-50 border-indigo-100 font-bold"
                  value={ndata?.reason || ""}
                  disabled
                />
              </div>
            </div>
          </motion.div>

          {/* Medical History Popovers */}
{/* <motion.div variants={fadeIn} className="flex flex-col justify-between items-center gap-4 w-[30%] max-lg:w-full">
  {[
    { 
      label: 'Address Type', 
      content: ndata?.residenceType,
      static: true 
    },
    { 
      label: 'Medical History', 
      content: ndata?.medHis 
    },
    { 
      label: 'Family History', 
      content: ndata?.famHis 
    },
    { 
      label: 'Allergies', 
      content: ndata?.allergies,
      static: true 
    },
  ].map((item) => (
    item.static ? (
      <div key={item.label} className="w-full p-3 text-white rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all shadow-md">
        <span className="font-semibold text-white-700">{item.label}:</span>
        <span className="text-white-600 ml-2">{item.content}</span>
      </div>
    ) : (
      <Popover key={item.label}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-3 text-white rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all shadow-md"
          >
            {item.label}
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="max-w-sm p-4 bg-white rounded-xl shadow-lg border border-indigo-50">
          <p className="text-indigo-800">{item.content}</p>
        </PopoverContent>
      </Popover>
    )
  ))}
</motion.div> */}
<motion.div variants={fadeIn} className="flex flex-col justify-between items-center gap-4 w-[30%] max-lg:w-full">
      {[
        { 
          label: 'Address Type', 
          content: ndata?.residenceType,
          static: true 
        },
        { 
          label: 'Medical History', 
          content: ndata?.medHis 
        },
        { 
          label: 'Family History', 
          content: ndata?.famHis 
        },
        { 
          label: 'Allergies', 
          content: ndata?.allergies,
          static: true 
        },
      ].map((item) => (
        item.static ? (
          <div 
            key={item.label} 
            className={`w-full p-3 text-white text-center rounded-lg transition-all shadow-md ${
              item.label === 'Allergies' && item.content === 'Yes' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600'
            }`}
          >
            <span className="font-semibold text-white-700">{item.label}:</span>
            <span className="text-white-600 ml-2">{item.content}</span>
          </div>
        ) : (
          <Popover key={item.label}>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-3 text-white rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all shadow-md"
              >
                {item.label}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="max-w-sm p-4 bg-white rounded-xl shadow-lg border border-indigo-50">
              <p className="text-indigo-800">{item.content}</p>
            </PopoverContent>
          </Popover>
        )
      ))}
    </motion.div>
        </motion.div>

        {/* Prescription Section */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-50"
        >
          {/* Keep the rest of your prescription form here */}
          {/* ... [Existing prescription form elements] ... */}

          {/* ... [Header with logo and date] ... */}

          {/* Diagnosis Input */}
          <motion.div variants={fadeIn} className="mt-4">
            <label className="font-medium text-indigo-600">Diagnosis</label>
            <Textarea
              className="mt-2 bg-indigo-50 border-indigo-100 focus:border-indigo-300 rounded-xl"
              placeholder="Enter diagnosis..."
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </motion.div>

          {/* Medicine Table */}
          <motion.div variants={fadeIn} className="mt-6">
            <div className="overflow-x-auto rounded-lg border border-indigo-50">
              <table className="w-full">
                <thead className="bg-indigo-50">
                  <tr>
                    {['S.No.', 'Medicine', 'Dosage (/day)', 'Duration', 'Suggestions'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-indigo-600 font-semibold whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {rows.map((_, index) => (
                      <motion.tr
                        key={index}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -50 }}
                        custom={index}
                        // className="hover:bg-indigo-50 transition-colors even:bg-indigo-50/50"
                      >
                        <td className="text-center w-[5%] border p-2">{index + 1}</td>
                        <td className="w-[30%] border p-2">
                          <Select
                            onValueChange={(value) => handleMedicineSelect(index, value)}
                          >
                            <SelectTrigger className="w-[100%]">
                              <SelectValue placeholder="Select Medicine">
                                {selectedMedicine[index] || "Select Medicine"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <input
                                  ref={searchInputRef}
                                  type="text"
                                  placeholder="Search Medicine"
                                  className="w-full p-2 border rounded-md"
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                />
                              </div>
                              {stock
                                .filter((medicine) =>
                                  medicine.medicineName
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                                )
                                .map((medicine) => (
                                  <SelectItem
                                    key={medicine.id}
                                    value={`${medicine.medicineName}:${medicine.id}`}
                                  >
                                    {medicine.medicineName} (Quantity: {medicine.quantity})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="w-[20%] border p-2">
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="border p-2 font-medium w-[33%]">Morning</th>
                                <th className="border p-2 font-medium w-[33%]">Afternoon</th>
                                <th className="border p-2 font-medium w-[33%]">Evening</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border p-2">
                                  <input
                                    type="number"
                                    min={0}
                                    className={`rounded-md border p-2 bg-indigo-50 dosage-morning-${index} w-full`}
                                    placeholder="0"
                                  />
                                </td>
                                <td className="border p-2">
                                  <input
                                    type="number"
                                    min={0}
                                    className={`rounded-md border p-2 bg-indigo-50 dosage-afternoon-${index} w-full`}
                                    placeholder="0"
                                  />
                                </td>
                                <td className="border p-2">
                                  <input
                                    type="number"
                                    min={0}
                                    className={`rounded-md border p-2 bg-indigo-50 dosage-evening-${index} w-full`}
                                    placeholder="0"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td className="w-[10%] border p-2">
                          <input type="number" className={`rounded-md border p-2 bg-indigo-50 duration-${index} w-full`} placeholder="0" min={1} />

                        </td>
                        <td className="border p-2">
                          <textarea className="rounded-md border p-2 bg-indigo-50 suggestion-${index} w-full" />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Add/Remove Buttons */}
            <motion.div variants={fadeIn} className="flex gap-4 justify-end mt-4">
              <Button onClick={addRow} className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-md">
                Add Row
              </Button>
              <Button onClick={removeRow} className="bg-rose-500 hover:bg-rose-600 text-white shadow-md">
                Remove Row
              </Button>
            </motion.div>
          </motion.div>

          {/* Recommendations and Tests */}
          <motion.div variants={fadeIn} className="mt-6 space-y-6">
            <div>
              <label className="font-medium text-indigo-600">Recommendations</label>
              <Textarea
                className="mt-2 bg-indigo-50 border-indigo-100 rounded-xl"
                placeholder="Enter recommendations..."
                onChange={(e) => setDietary(e.target.value)}
              />
            </div>
            <div>
              <label className="font-medium text-indigo-600">Tests Needed</label>
              <Textarea
                className="mt-2 bg-indigo-50 border-indigo-100 rounded-xl"
                placeholder="Enter required tests..."
                onChange={(e) => setTests(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={fadeIn} className="flex gap-4 mt-8 max-lg:flex-col">
            <div className="flex justify-end gap-4 w-full">
              <Button
                onClick={handleSubmit}
                className="py-4 bg-indigo-500 hover:bg-emerald-600 text-white shadow-lg rounded-xl min-w-[200px]"
              >
                Submit Prescription
              </Button>
              <Button
                onClick={handleRelease}
                className="py-4 bg-rose-500 hover:bg-rose-600 text-white shadow-lg rounded-xl min-w-[200px]"
              >
                Release Patient
              </Button>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </>
  );
};

export default PatientDetails;
