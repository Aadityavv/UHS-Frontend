import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import MedicalReportPDF from "@/components/MedicalReportPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Medication {
  name: string;
  dosageMorning: string;
  dosageAfternoon: string;
  dosageEvening: string;
  duration: string;
  suggestion: string;
}

interface PrescriptionData {
  name: string;
  id: string;
  age: number;
  school: string;
  date: string;
  time: string;
  designation: string;
  residenceType: string;
  sex: string;
  meds: Medication[];
}

const CommonPrescription = () => {
  const { toast } = useToast();
  const [ndata, setNdata] = useState<PrescriptionData>({
    name: "",
    id: "",
    age: 0,
    school: "",
    sex: "",
    date: "",
    designation: "",
    time: "",
    residenceType: "",
    meds: [],
  });

  const [diagnosis, setDiagnosis] = useState("");
  const [dietaryRemarks, setDietaryRemarks] = useState("");
  const [testNeeded, setTestNeeded] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "User token is missing. Please log in again.",
          });
          return;
        }

        const role = localStorage.getItem("roles");
        const urlParam = new URLSearchParams(window.location.search).get("id");
        if (!urlParam) return;

        const age = (dob: string) => {
          const diff_ms = Date.now() - new Date(dob).getTime();
          const age_dt = new Date(diff_ms);
          return Math.abs(age_dt.getUTCFullYear() - 1970);
        };

        const apiUrl =
          role === "doctor"
            ? `http://localhost:8081/api/doctor/getPrescription/${urlParam}`
            : role === "ad"
            ? `http://localhost:8081/api/AD/getPrescription/${urlParam}`
            : `http://localhost:8081/api/patient/getPrescription/${urlParam}`;

        const { data } = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { prescription } = data;
        const patient = prescription?.patient || {};

        const medsData = prescription.meds.map((med: any) => ({
          name: med.medicine.medicineName,
          dosageMorning: med.dosageMorning || "0",
          dosageAfternoon: med.dosageAfternoon || "0",
          dosageEvening: med.dosageEvening || "0",
          duration: med.duration || "0",
          suggestion: med.suggestion || "",
        }));

        setNdata({
          name: patient.name || "",
          id: patient.sapID || "",
          age: age(patient.dateOfBirth),
          school: patient.school || "",
          sex: patient.gender || "",
          date: dayjs(data.date).format("DD/MM/YYYY") || "",
          time: data.time || "",
          residenceType: data.residenceType || "",
          designation: data.prescription.doctor.designation || "",
          meds: medsData,
        });

        setDoctorName(prescription.doctor?.name || "");
        setDiagnosis(prescription.diagnosis || "");
        setDietaryRemarks(prescription.dietaryRemarks || "");
        setTestNeeded(prescription.testNeeded || "");

        toast({
          title: "Data Loaded Successfully",
          description: "Prescription details have been fetched.",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error Fetching Data",
          description:
            error.response?.data?.message ||
            "Error occurred while fetching prescription data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        console.error("Error fetching prescription data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] p-2 bg-gradient-to-br from-indigo-50 to-blue-50 sm:p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-indigo-50"
        >
          {/* Header Section */}
          <motion.div variants={fadeIn} className="flex flex-col items-center gap-4 mb-6 sm:flex-row sm:justify-between">
            <img 
              src="/upes-logo.jpg" 
              alt="UPES Logo" 
              className="w-16 sm:w-20" 
            />
            <h2 className="text-xl text-center text-indigo-600 sm:text-2xl">
              UHS Medical Report
            </h2>
            <div className="flex flex-col items-center text-sm sm:text-base text-indigo-500">
              <span>{ndata?.time}</span>
              <span>{ndata?.date}</span>
            </div>
          </motion.div>

          <hr className="border border-indigo-100 my-4" />

          {/* Patient Info Section */}
          <motion.div
            variants={slideIn}
            className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-16 sm:w-20">Name:</label>
                <Input
                  value={ndata?.name}
                  className="bg-indigo-50 border-indigo-100 text-sm"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-16 sm:w-20">ID:</label>
                <Input
                  value={ndata?.id}
                  className="bg-indigo-50 border-indigo-100 text-sm"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-16 sm:w-20">Age:</label>
                <Input
                  value={ndata?.age}
                  className="bg-indigo-50 border-indigo-100 text-sm"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-16 sm:w-20">School:</label>
                <Input
                  value={ndata?.school}
                  className="bg-indigo-50 border-indigo-100 text-sm"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-16 sm:w-20">Sex:</label>
                <Input
                  value={ndata?.sex}
                  className="bg-indigo-50 border-indigo-100 text-sm"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-24 sm:w-32">Residence Type:</label>
                <Input
                  value={ndata?.residenceType}
                  className="bg-indigo-50 border-indigo-100 text-sm"
                  readOnly
                />
              </div>
            </div>
          </motion.div>

          <hr className="border border-indigo-100 my-4" />

          {/* Diagnosis Section */}
          <motion.div variants={fadeIn} className="mb-6">
            <label className="font-medium text-indigo-600 block mb-2">Diagnosis:</label>
            <Textarea
              value={diagnosis}
              className="bg-indigo-50 border-indigo-100 rounded-lg text-sm"
              readOnly
            />
          </motion.div>

          {/* Medicines Table */}
          <motion.div variants={fadeIn} className="mb-6">
            <label className="font-medium text-indigo-600 block mb-2">Medication:</label>
            <div className="overflow-x-auto rounded-lg border border-indigo-100">
              <table className="w-full min-w-[600px]">
                <thead className="bg-indigo-50">
                  <tr>
                    {['S.No.', 'Medicine', 'Dosage', 'Duration', 'Suggestions'].map((header) => (
                      <th 
                        key={header} 
                        className="px-2 py-3 text-left text-indigo-600 font-semibold text-sm sm:px-4 sm:text-base"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ndata.meds.map((med, index) => (
                    <tr key={index} className="even:bg-indigo-50/50">
                      <td className="text-center p-2 text-sm sm:p-3 sm:text-base">
                        {index + 1}
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={med.name}
                          className="bg-indigo-50 border-indigo-100 text-sm"
                          readOnly
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="grid grid-cols-1 gap-1 mb-5 sm:grid-cols-3 sm:gap-2">
                          <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-indigo-500">Morning</span>
                            <Input
                              value={med.dosageMorning}
                              className="bg-indigo-50 border-indigo-100 text-center text-sm"
                              readOnly
                            />
                            
                          </div>
                          <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-indigo-500">Afternoon</span>
                            <Input
                              value={med.dosageAfternoon}
                              className="bg-indigo-50 border-indigo-100 text-center text-sm"
                              readOnly
                            />
                            
                          </div>
                          <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-indigo-500">Evening</span>
                            <Input
                              value={med.dosageEvening}
                              className="bg-indigo-50 border-indigo-100 text-center text-sm"
                              readOnly
                            />
                            
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={med.duration}
                          className="bg-indigo-50 border-indigo-100 text-center text-sm"
                          readOnly
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Textarea
                          value={med.suggestion}
                          className="bg-indigo-50 border-indigo-100 text-sm"
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recommendations and Tests */}
          <motion.div variants={fadeIn} className="space-y-4 sm:space-y-6">
            <div>
              <label className="font-medium text-indigo-600 block mb-2">Recommendations:</label>
              <Textarea
                value={dietaryRemarks}
                className="bg-indigo-50 border-indigo-100 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div>
              <label className="font-medium text-indigo-600 block mb-2">Tests Needed:</label>
              <Textarea
                value={testNeeded}
                className="bg-indigo-50 border-indigo-100 rounded-lg text-sm"
                readOnly
              />
            </div>
          </motion.div>

          {/* Doctor Signature */}
          <motion.div variants={fadeIn} className="flex flex-col items-end mt-6 sm:mt-8">
            <span className="text-indigo-600 font-semibold text-sm sm:text-base">
              {doctorName}
            </span>
            <span className="text-indigo-500 text-sm sm:text-base">
              ({ndata?.designation})
            </span>
            <div className="font-medium text-indigo-600 text-sm sm:text-base">
              Doctor
            </div>
          </motion.div>

          {/* PDF Download Button */}
          <motion.div variants={fadeIn} className="flex justify-end mt-6">
            <PDFDownloadLink
              document={
                <MedicalReportPDF
                  ndata={ndata}
                  diagnosis={diagnosis}
                  dietaryRemarks={dietaryRemarks}
                  doctorName={doctorName}
                  testNeeded={testNeeded}
                />
              }
              fileName="patient_report.pdf"
            >
              <Button
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Download PDF"}
                </Button>
            </PDFDownloadLink>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default CommonPrescription;