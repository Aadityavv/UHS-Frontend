import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import MedicalReportPDF from "@/components/MedicalReportPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { motion } from "framer-motion";
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
            ? `https://uhs-backend.onrender.com/api/doctor/getPrescription/${urlParam}`
            : role === "ad"
            ? `https://uhs-backend.onrender.com/api/AD/getPrescription/${urlParam}`
            : `https://uhs-backend.onrender.com/api/patient/getPrescription/${urlParam}`;

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-2xl text-indigo-600">
          Loading Report...
        </div>
      </div>
    );
  }

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
          {/* Header Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-indigo-800">
                    Medical Report
                  </h1>
                  <p className="text-slate-500">University Health Services</p>
                </div>
              </div>
              <div className="text-center md:text-right hidden sm:block">
                <div className="space-y-1 text-md font-bold">
                  
                  <div className="text-slate-500">{ndata?.time}</div>
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
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Patient Name
              </label>
              <div className="text-lg font-medium text-indigo-800 mt-1">
                {ndata.name}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Student ID
              </label>
              <div className="text-lg font-medium text-indigo-800 mt-1">
                {ndata.id}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Age & Gender
              </label>
              <div className="text-lg font-medium text-indigo-800 mt-1">
                {ndata.age} / {ndata.sex}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                School
              </label>
              <div className="text-lg font-medium text-indigo-800 mt-1">
                {ndata.school}
              </div>
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
            <div className="prose prose-slate max-w-none">
              {diagnosis.split("\n").map((line, i) => (
                <p key={i} className="text-slate-700">
                  {line}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Medications Section */}
<motion.div
  variants={cardVariants}
  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
>
  <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
    Prescribed Medications
  </h3>

  {/* Mobile View */}
  <div className="md:hidden space-y-4">
    {ndata.meds.map((med, index) => (
      <div key={index} className="bg-slate-50 p-4 rounded-lg">
        {/* Medicine Name */}
        <div className="flex justify-between items-start mb-3">
          <div className="font-medium text-indigo-800">{med.name}</div>
        </div>

        {/* Dosage Information */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-xs text-slate-500">Morning</div>
            <div className="font-medium">{med.dosageMorning}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Afternoon</div>
            <div className="font-medium">{med.dosageAfternoon}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Evening</div>
            <div className="font-medium">{med.dosageEvening}</div>
          </div>
        </div>

        {/* Duration and Suggestions */}
        <div className="text-sm text-slate-600">
          <span className="font-medium">Duration:</span> {med.duration} days
        </div>
        {med.suggestion && (
          <div className="mt-2 text-sm text-slate-600">
            <span className="font-medium">Notes:</span> {med.suggestion}
          </div>
        )}
      </div>
    ))}
  </div>

  {/* Desktop View */}
  <table className="hidden md:table w-full">
    <thead className="bg-slate-50">
      <tr>
        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
          #
        </th>
        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
          Medication
        </th>
        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
          Dosage
        </th>
        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
          Duration
        </th>
        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
          Notes
        </th>
      </tr>
    </thead>
    <tbody>
      {ndata.meds.map((med, index) => (
        <tr
          key={index}
          className="border-b border-slate-100 last:border-0"
        >
          <td className="py-3 px-4 text-indigo-800 font-medium">
            {index + 1}
          </td>
          <td className="py-3 px-4 font-medium text-slate-800">
            {med.name}
          </td>
          <td className="py-3 px-4 text-center">
            <div className="grid grid-cols-3 gap-2 text-lg">
              <div className="text-center">
                <div className="text-sm text-slate-500">Morning</div>
                <div className="font-medium">{med.dosageMorning}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500">Afternoon</div>
                <div className="font-medium">{med.dosageAfternoon}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500">Evening</div>
                <div className="font-medium">{med.dosageEvening}</div>
              </div>
            </div>
          </td>
          <td className="py-3 px-4 text-center text-slate-600">
            {med.duration} days
          </td>
          <td className="py-3 px-4 text-slate-600 text-sm">
            {med.suggestion}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
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
              <div className="prose prose-slate max-w-none">
                {dietaryRemarks.split("\n").map((line, i) => (
                  <p key={i} className="text-slate-700">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Required Tests
              </h3>
              <div className="prose prose-slate max-w-none">
                {testNeeded.split("\n").map((line, i) => (
                  <p key={i} className="text-slate-700">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Doctor Signature & Download */}
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="text-lg font-bold text-indigo-800">
                  {doctorName}
                </div>
                <div className="text-slate-600">{ndata.designation}</div>
                <div className="text-sm text-slate-500">
                  Licensed Medical Practitioner
                </div>
              </div>
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
                  className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Generating PDF..." : "Download Full Report"}
                </Button>
              </PDFDownloadLink>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default CommonPrescription;