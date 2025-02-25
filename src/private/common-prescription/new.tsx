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

// ... (keep existing interfaces unchanged)

const CommonPrescription = () => {
  // ... (keep existing state and logic unchanged)

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] p-4 bg-gradient-to-br from-indigo-50 to-blue-50 max-lg:min-h-[93svh] max-lg:p-2">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-50"
        >
          {/* Header Section */}
          <motion.div variants={fadeIn} className="flex items-center justify-between mb-6">
            <div className="flex center">
              <img src="/upes-logo.jpg" alt="Logo" className="w-[100px]" />
            </div>
            <h2 className="font-medium text-center text-2xl text-indigo-600">UHS Medical Report</h2>
            <div className="font-medium flex flex-col lg:flex-row items-center max-lg:text-sm text-indigo-500">
              <span>{ndata?.time}</span>
              <span className="lg:ml-2">{ndata?.date}</span>
            </div>
          </motion.div>

          <hr className="border border-indigo-100 my-4" />

          {/* Patient Info Section */}
          <motion.div
            variants={slideIn}
            className="grid grid-cols-3 gap-6 mb-6 max-lg:grid-cols-1"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-20">Name:</label>
                <Input
                  value={ndata?.name}
                  className="bg-indigo-50 border-indigo-100"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-20">ID:</label>
                <Input
                  value={ndata?.id}
                  className="bg-indigo-50 border-indigo-100"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-20">Age:</label>
                <Input
                  value={ndata?.age}
                  className="bg-indigo-50 border-indigo-100"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-20">School:</label>
                <Input
                  value={ndata?.course}
                  className="bg-indigo-50 border-indigo-100"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-20">Sex:</label>
                <Input
                  value={ndata?.sex}
                  className="bg-indigo-50 border-indigo-100"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-indigo-600 w-32">Residence Type:</label>
                <Input
                  value={ndata?.residenceType}
                  className="bg-indigo-50 border-indigo-100"
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
              className="bg-indigo-50 border-indigo-100 rounded-xl"
              readOnly
            />
          </motion.div>

          {/* Medicines Table */}
          <motion.div variants={fadeIn} className="mb-6">
            <label className="font-medium text-indigo-600 block mb-2">Medication:</label>
            <div className="overflow-x-auto rounded-lg border border-indigo-100">
              <table className="w-full">
                <thead className="bg-indigo-50">
                  <tr>
                    {['S.No.', 'Medicine', 'Dosage (/day)', 'Duration', 'Suggestions'].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-indigo-600 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ndata.meds.map((med, index) => (
                    <tr key={index} className="hover:bg-indigo-50 even:bg-indigo-50/50">
                      <td className="text-center p-3">{index + 1}</td>
                      <td className="p-3">
                        <Input
                          value={med.name}
                          className="bg-indigo-50 border-indigo-100"
                          readOnly
                        />
                      </td>
                      <td className="p-3">
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            value={med.dosageMorning}
                            className="bg-indigo-50 border-indigo-100 text-center"
                            readOnly
                          />
                          <Input
                            value={med.dosageAfternoon}
                            className="bg-indigo-50 border-indigo-100 text-center"
                            readOnly
                          />
                          <Input
                            value={med.dosageEvening}
                            className="bg-indigo-50 border-indigo-100 text-center"
                            readOnly
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <Input
                          value={med.duration}
                          className="bg-indigo-50 border-indigo-100 text-center"
                          readOnly
                        />
                      </td>
                      <td className="p-3">
                        <Textarea
                          value={med.suggestion}
                          className="bg-indigo-50 border-indigo-100"
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
          <motion.div variants={fadeIn} className="space-y-6">
            <div>
              <label className="font-medium text-indigo-600 block mb-2">Recommendations:</label>
              <Textarea
                value={dietaryRemarks}
                className="bg-indigo-50 border-indigo-100 rounded-xl"
                readOnly
              />
            </div>
            <div>
              <label className="font-medium text-indigo-600 block mb-2">Tests Needed:</label>
              <Textarea
                value={testNeeded}
                className="bg-indigo-50 border-indigo-100 rounded-xl"
                readOnly
              />
            </div>
          </motion.div>

          {/* Doctor Signature */}
          <motion.div variants={fadeIn} className="flex flex-col items-end mt-8">
            <span className="text-indigo-600 font-semibold">{doctorName}</span>
            <span className="text-indigo-500">({ndata?.designation})</span>
            <div className="font-medium text-indigo-600">Doctor</div>
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
              {({ loading }) => (
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default CommonPrescription;