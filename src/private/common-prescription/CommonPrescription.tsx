import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import MedicalReportPDF from "@/components/MedicalReportPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";

const CommonPrescription = () => {
  const { toast } = useToast();
  const [ndata, setNdata] = useState<{
    name: string;
    id: string;
    age: number;
    course: string;
    date: string;
    time: string;
    designation: string;
    residenceType: string;
    sex: string;
    meds: Array<{
      name: string;
      dosageMorning: string;
      dosageAfternoon: string;
      dosageEvening: string;
      duration: string;
      suggestion: string;
    }>;
  }>({
    name: "",
    id: "",
    age: 0,
    course: "",
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
            ? `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/getPrescription/${urlParam}`
            : role === "ad"
            ? `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getPrescription/${urlParam}`
            : `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/getPrescription/${urlParam}`;

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
          course: patient.program || "",
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
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Toaster />
      <div className="bg-[#ECECEC] p-4 flex flex-col justify-center items-center min-h-[84svh] max-lg:p-0 max-lg:min-h-[93svh]">
        <div
          id="content"
          className="bg-white p-4 w-full border-black border overflow-y-scroll"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex center">
              <img src="/upes-logo.jpg" alt="Logo" className="w-[100px]" />
            </div>
            <h2 className="font-medium text-center text-2xl">UHS</h2>
            <div className="font-medium flex flex-col lg:flex-row items-center max-lg:text-sm">
              <span>{ndata?.time}</span>
              <span className="lg:ml-2">{ndata?.date}</span>
            </div>
          </div>
          <hr className="border border-black my-2" />
          <div className="my-4">
            <div className="flex justify-between max-lg:flex-col max-lg:gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-[10px]">
                  <label className="mr-auto font-medium">Name:</label>
                  <input
                    type="text"
                    value={ndata?.name}
                    className="bg-[#dddce2] p-2 rounded-md"
                    readOnly
                  />
                </div>
                <div className="flex items-center gap-[10px ]">
                  <label className="mr-auto font-medium">ID:</label>
                  <input
                    type="text"
                    value={ndata?.id}
                    className="bg-[#dddce2] p-2 rounded-md"
                    readOnly
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-[10px]">
                  <label className="font-medium mr-auto">Age:</label>
                  <input
                    type="text"
                    value={ndata?.age}
                    className="bg-[#dddce2] p-2 rounded-md"
                    readOnly
                  />
                </div>
                <div className="flex items-center gap-[10px]">
                  <label className="font-medium mr-auto">School:</label>
                  <input
                    type="text"
                    value={ndata?.course}
                    className="bg-[#dddce2] p-2 rounded-md"
                    readOnly
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-[10px]">
                  <label className="font-medium mr-auto">Sex:</label>
                  <input
                    type="text"
                    value={ndata?.sex}
                    className="bg-[#dddce2] p-2 rounded-md"
                    readOnly
                  />
                </div>
                <div className="flex items-center gap-[10px]">
                  <label className="font-medium mr-auto">Residence Type:</label>
                  <input
                    type="text"
                    value={ndata?.residenceType}
                    className="bg-[#dddce2] p-2 rounded-md"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
          <hr className="border border-black my-2" />
          <div className="mt-4 gap-2 flex flex-col">
            <label className="font-medium">Diagnosis:</label>
            <textarea
              className="w-full h-[100px] p-4 rounded-md bg-[#dddce2]"
              value={diagnosis}
              readOnly
            />
          </div>
          <div className="mt-4 max-lg:overflow-scroll flex flex-col gap-2">
            <label className="font-medium">Medicine:</label>
            <table className="max-lg:max-w-[95svw]">
              <thead>
                <tr>
                  <th className="whitespace-nowrap font-medium p-2 border">
                    S. No.
                  </th>
                  <th className="whitespace-nowrap font-medium p-2 border">
                    Medicine
                  </th>
                  <th className="whitespace-nowrap font-medium p-2 border">
                    Dosage (/day)
                  </th>
                  <th className="whitespace-nowrap font-medium p-2 border">
                    Duration (Days)
                  </th>
                  <th className="whitespace-nowrap font-medium p-2 border">
                    Suggestions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ndata.meds.map((med, index) => (
                  <tr key={index} className="text-center">
                    <td className="text-center w-[5%] border p-2">
                      {index + 1}
                    </td>
                    <td className="w-[30%] border p-2">
                      <input
                        className="w-full p-2 border rounded-md"
                        value={med.name}
                        readOnly
                      />
                    </td>
                    <td className="w-[20%] border p-2">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="border p-2 font-medium w-[33%]">
                              Morning
                            </th>
                            <th className="border p-2 font-medium w-[33%]">
                              Afternoon
                            </th>
                            <th className="border p-2 font-medium w-[33%]">
                              Evening
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">
                              <input
                                type="number"
                                min={0}
                                className="rounded-md border p-2 bg-[#dddce2] dosage-morning w-full"
                                value={med.dosageMorning}
                                readOnly
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="number"
                                min={0}
                                className="rounded-md border p-2 bg-[#dddce2] dosage-afternoon w-full"
                                value={med.dosageAfternoon}
                                readOnly
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="number"
                                min={0}
                                className="rounded-md border p-2 bg-[#dddce2] dosage-evening w-full"
                                value={med.dosageEvening}
                                readOnly
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="w-[10%] border p-2">
                      <input
                        type="number"
                        className="rounded-md border p-2 bg-[#dddce2] duration w-full"
                        value={med.duration}
                        readOnly
                      />
                    </td>
                    <td className="border p-2">
                      <textarea
                        className="rounded-md border p-2 bg-[#dddce2] w-full"
                        value={med.suggestion}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="font-medium">Recommendations:</label>
            <textarea
              className="w-full h-[100px] p-4 rounded-md bg-[#dddce2]"
              value={dietaryRemarks}
              readOnly
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="font-medium">Tests Needed:</label>
            <textarea
              className="w-full h-[100px] p-4 rounded-md bg-[#dddce2]"
              value={testNeeded}
              readOnly
            />
          </div>

          <div className="flex flex-col items-end mt-10">
            <span>{doctorName}</span>
            <span>({ndata?.designation})</span>
            <div className="font-medium">Doctor</div>
          </div>
        </div>
        <PDFDownloadLink
          className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded hover:from-blue-600 hover:to-blue-800 max-lg:my-2 whitespace-nowrap min-w-20"
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
          Download PDF
        </PDFDownloadLink>
      </div>
    </>
  );
};

export default CommonPrescription;
