// import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
// import { Toaster } from "@/components/ui/toaster";
// import { ToastAction } from "@/components/ui/toast";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import Shared from "@/Shared";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import "./PatientList.css";
// import { useNavigate } from "react-router-dom";

// const PatientList = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [patient, setPatient] = useState<
//     {
//       email: string;
//       name: string;
//       reason: string;
//       aptId: string;
//       Id: string;
//     }[]
//   >([]);
//   const [selectedButton, setSelectedButton] = useState("Pending");
//   const [reassignPat,setReassignPat] = useState({
//     doctorEmail:"",
//     patientEmail:""
//   });
//   const [dialogData, setDialogData] = useState({
//     pref_doc: "",
//     reason: "",
//     doc_reason: "",
//     temperature: "",
//     weight: "",
//   });
//   const [docData, setDocData] = useState<{
//     pref_doc: string;
//     doc_reason: string;
//   }>();
//   const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
//   const [currentPatientEmail, setCurrentPatientEmail] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredPatient, setFilteredPatient] = useState(patient);
//   const [assignedData, setAssignedData] = useState<Array<{patientName:string, tokenNum:string,doctorName:string}>>([]);

//   const fetchList = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       if (
//         !(localStorage.getItem("latitude") || localStorage.getItem("longitude"))
//       ) {
//         toast({
//           title: "Location Required",
//           description: "Please select a location before fetching data.",
//           action: <ToastAction altText="Try again">Try again</ToastAction>,
//           variant: "destructive",
//         });
//         return;
//       }

//       const url =
//         selectedButton === "Pending"
//           ? "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getPatientQueue"
//           : selectedButton === "Assigned" ? "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getAssignedPatient" : "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getCompletedQueue";

//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "X-Latitude": localStorage.getItem("latitude"),
//           "X-Longitude": localStorage.getItem("longitude"),
//         },
//       });

//       const fetchedData = response.data;
//       if(selectedButton === "Assigned"){
//         const formattedData = fetchedData.map((pat: any) => ({
//           patientName:pat.PatientName, 
//           tokenNum:pat.PatientToken,
//           doctorName:pat.doctorName
//         }));

//         setAssignedData(formattedData);
//       }else{
//         const formattedData = fetchedData.map((pat: any) => ({
//           email: pat.sapEmail,
//           name: pat.name,
//           reason: pat.reason,
//           aptId: pat.aptId,
//           Id: pat.Id,
//         }));
//         setPatient(formattedData);
//         setFilteredPatient(formattedData);
//       }
        
//     } catch (error) {
//       handleError(error, "Failed to fetch patient list");
//     }
//   };

//   useEffect(() => {
//     fetchList();
//   }, [selectedButton]);

//   useEffect(() => {
//     if (searchQuery) {
//       const filtered = patient.filter(
//         (pat) =>
//           pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           pat.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           pat.reason.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredPatient(filtered);
//     } else {
//       setFilteredPatient(patient);
//     }
//   }, [searchQuery, patient]);

//   const getAppointmentDetails = async (email: string) => {
//     const modifiedEmail = email.replace(/@.*?\./g, (match) =>
//       match.replace(/\./g, ",")
//     );
//     setCurrentPatientEmail(email);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await axios.get(
//         `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getAptForm/${modifiedEmail}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           timeout: 10000,
//         }
//       );

//       const formatData = response.data;
//       setDocData({
//         pref_doc: formatData.pref_doc
//           ? formatData.pref_doc.name
//           : "No Preferred Doctor",
//         doc_reason: formatData.doc_reason || "",
//       });

//       await fetchAvailableDoctors();
//     } catch (error) {
//       handleError(error, "Error fetching appointment details");
//     }
//   };

//   const fetchAvailableDoctors = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");
//       if (
//         !(localStorage.getItem("latitude") || localStorage.getItem("longitude"))
//       ) {
//         toast({
//           title: "Location Required",
//           description: "Please select a location before fetching data.",
//           variant: "destructive",
//           action: <ToastAction altText="Try again">Try again</ToastAction>,
//         });
//         return;
//       }
//       const response = await axios.get(
//         "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getAvailableDoctors",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Latitude": localStorage.getItem("latitude"),
//             "X-Longitude": localStorage.getItem("longitude"),
//           },
//         }
//       );

//       const doctorList = response.data.map((doctor: any) => ({
//         id: doctor.doctorId.toString(),
//         name: doctor.name,
//       }));
//       setDoctors(doctorList);
//     } catch (error) {
//       handleError(error, "Error fetching available doctors");
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await axios.post(
//         "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/submitAppointment",
//         {
//           weight: dialogData.weight,
//           temperature: dialogData.temperature,
//           doctorAss: dialogData.pref_doc,
//           patEmail: currentPatientEmail,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         toast({
//           title: "Success",
//           description: "Appointment details submitted successfully.",
//         });
//         window.location.reload();
//       } else {
//         throw new Error("Failed to submit appointment details.");
//       }
//     } catch (error) {
//       handleError(error, "Failed to submit appointment details");
//     }
//   };

//   const handleError = (error: any, defaultMessage: string) => {
//     let message = defaultMessage;
//     if (axios.isAxiosError(error)) {
//       if (error.response) {
//         message = `${error.response.data.message}`;
//       } else if (error.request) {
//         message =
//           "No response from server. Please check your network connection.";
//       } else {
//         message = error.message;
//       }
//     }
//     console.error(message, error);
//     toast({
//       title: "Error",
//       description: message,
//       variant: "destructive",
//       action: <ToastAction altText="Try again">Try again</ToastAction>,
//     });
//   };
//   const handleRejectAppointment = async (email: string) => {
//     try {
//       const token = localStorage.getItem("token");
//       const emailSent = email.substring(0,email.indexOf("@"))+email.substring(email.indexOf("@")).replace(".",",");
//       const response = await axios.get(
//         `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/rejectAppointment?email=${emailSent}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.status === 200) {
//         toast({ title: "Appointment Rejected", description: response.data });
//         fetchList();
//       }
//     } catch (err) {
//       handleError(err, "Failed to reject appointment");
//     }
//   };

//   const handleCompleteAppointment = async (email: string) => {
//     try {
//       const token = localStorage.getItem("token");
//       const emailSent = email.substring(0,email.indexOf("@"))+email.substring(email.indexOf("@")).replace(".",",");
//       const response = await axios.get(
//         `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/completeAppointment/${emailSent}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       toast({
//         title: "Appointment Completed",
//         description: response.data,
//       });
//       fetchList();
//     } catch (err) {
//       handleError(err, "Failed to complete appointment");
//     }
//   };

//   const handleReassign = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await axios.post(
//         "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/reassign",
//         {
//           patientEmail:reassignPat.patientEmail,
//           doctorEmail:reassignPat.doctorEmail
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         toast({
//           title: "Success",
//           description: "Appointment details submitted successfully.",
//         });
//         window.location.reload();
//       } else {
//         throw new Error("Failed to submit appointment details.");
//       }
//     } catch (error) {
//       handleError(error, "Failed to submit appointment details");
//     }
//   }


//   return (
//     <>
//       <Toaster />
//       <div className="bg-[#ECECEC] min-h-[84svh] p-8 space-y-8 flex flex-col max-lg:min-h-[93svh] max-lg:p-4 max-lg:py-4">
//         <div className="flex justify-center items-center gap-2">
//           <button
//             onClick={() => setSelectedButton("Pending")}
//             className={`shadow-md px-4 py-2 rounded-md w-40 ${
//               selectedButton === "Pending"
//                 ? "bg-gradient-to-r from-[#2061f5] to-[#13398f] text-white"
//                 : "bg-gray-100 text-black"
//             }`}
//           >
//             Pending
//           </button>
//           <button
//             onClick={() => setSelectedButton("Assigned")}
//             className={`shadow-md px-4 py-2 rounded-md w-40 ${
//               selectedButton === "Assigned"
//                 ? "bg-gradient-to-r from-[#2061f5] to-[#13398f] text-white"
//                 : "bg-gray-100 text-black"
//             }`}
//           >
//             Assigned
//           </button>
//           <button
//             onClick={() => setSelectedButton("Appointed")}
//             className={`shadow-md px-4 py-2 rounded-md w-40 ${
//               selectedButton === "Appointed"
//                 ? "bg-gradient-to-r from-[#2061f5] to-[#13398f] text-white"
//                 : "bg-gray-100 text-black"
//             }`}
//           >
//             Appointed
//           </button>
          
//         </div>
//         <div className="flex space-x-2 items-center">
//           {Shared.Search}
//           <Input
//             className="bg-white"
//             placeholder="Search patients..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <div className="h-full overflow-y-scroll">
//           {selectedButton !== "Assigned"?(<Table className="bg-white rounded-md">
//             <TableHeader>
//               <TableRow className="h-20">
//                 <TableHead className="border text-black font-bold text-center">
//                   S.No.
//                 </TableHead>
//                 <TableHead className="border text-black font-bold text-center">
//                   Name
//                 </TableHead>
//                 <TableHead className="border text-black font-bold text-center">
//                   Email Id
//                 </TableHead>
//                 <TableHead className="border text-black font-bold text-center whitespace-nowrap">
//                   Reason for visit
//                 </TableHead>
//                 <TableHead className="border text-black font-bold text-center">
//                   Action
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredPatient.length > 0 ? (
//                 filteredPatient.map((pat, index) => (
//                   <TableRow className="text-center" key={index}>
//                     <TableCell className="border">{index + 1}</TableCell>
//                     <TableCell className="border whitespace-nowrap">
//                       {pat.name}
//                     </TableCell>
//                     <TableCell className="border whitespace-nowrap">
//                       {pat.email}
//                     </TableCell>
//                     <TableCell className="border">{pat.reason}</TableCell>
//                     <TableCell className="border flex items-center justify-center">
//                       {selectedButton === "Pending" ? (
//                         <Dialog
//                           onOpenChange={(open) => {
//                             if (open) {
//                               getAppointmentDetails(pat.email);
//                             }
//                           }}
//                         >
//                           <DialogTrigger className="text-2xl">
//                             {Shared.Report}
//                           </DialogTrigger>
//                           <DialogContent>
//                             <DialogHeader>
//                               <DialogTitle className="font-medium text-center pb-3">
//                                 Enter following details
//                               </DialogTitle>
//                               <DialogDescription>
//                                 <form onSubmit={handleSubmit}>
//                                   <div className="form-group">
//                                     <label htmlFor="preferredDoctor">
//                                       Preferred Doctor
//                                     </label>
//                                     <input
//                                       type="text"
//                                       id="preferredDoctor"
//                                       name="preferredDoctor"
//                                       className="form-input"
//                                       placeholder="Enter preferred doctor's name"
//                                       value={docData?.pref_doc}
//                                       readOnly
//                                     />
//                                   </div>
//                                   <div className="form-group">
//                                     <label htmlFor="reason">
//                                       Reason for preference
//                                     </label>
//                                     <input
//                                       id="reason"
//                                       name="reason"
//                                       className="form-input"
//                                       placeholder="Enter reason"
//                                       value={docData?.doc_reason}
//                                       readOnly
//                                     />
//                                   </div>
//                                   <div className="form-group">
//                                     <label htmlFor="appointment">
//                                       Doctor Assigned*
//                                     </label>
//                                     <select
//                                       id="appointment"
//                                       name="appointment"
//                                       className="form-input"
//                                       value={dialogData.pref_doc}
//                                       onChange={(e) =>
//                                         setDialogData({
//                                           ...dialogData,
//                                           pref_doc: e.target.value,
//                                         })
//                                       }
//                                     >
//                                       <option value="">Select a doctor</option>
//                                       {doctors.map((doctor) => (
//                                         <option
//                                           key={doctor.id}
//                                           value={doctor.id}
//                                         >
//                                           {doctor.name}
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </div>

//                                   <div className="flex justify-between">
//                                     <div className="form-group">
//                                       <label
//                                         htmlFor="temperature"
//                                         className="whitespace-nowrap"
//                                       >
//                                         Current Temperature* (in °F)
//                                       </label>
//                                       <input
//                                         type="number"
//                                         id="temperature"
//                                         name="temperature"
//                                         min={0}
//                                         className="form-input"
//                                         placeholder="Enter temperature"
//                                         value={dialogData.temperature}
//                                         onChange={(e) =>
//                                           setDialogData({
//                                             ...dialogData,
//                                             temperature: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </div>
//                                     <div className="form-group">
//                                       <label htmlFor="weight">
//                                         Current Weight* (in Kg)
//                                       </label>
//                                       <input
//                                         type="number"
//                                         id="weight"
//                                         name="weight"
//                                         min={0}
//                                         step={0.01}
//                                         className="form-input"
//                                         placeholder="Enter weight"
//                                         value={dialogData.weight}
//                                         onChange={(e) =>
//                                           setDialogData({
//                                             ...dialogData,
//                                             weight: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </div>
//                                   </div>
//                                   <div className="flex justify-between">
//                                     <button
//                                       type="button"
//                                       className="reject-button"
//                                       onClick={async () => {
//                                         try {
//                                           const token = localStorage.getItem("token");
//                                           const email = pat.email
//                                           const emailSent = email.substring(0,email.indexOf("@"))+email.substring(email.indexOf("@")).replace(".",",");
//                                           const response = await axios.get(
//                                             `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/rejectAppointment?email=${emailSent}`,
//                                             {
//                                               headers: {
//                                                 Authorization: `Bearer ${token}`,
//                                               },
//                                             }
//                                           );

//                                           if (response.status === 200) {
//                                             toast({
//                                               title: "Appointment Rejected",
//                                               description: response.data,
//                                             });
//                                             window.location.reload();
//                                           }
//                                         } catch (error) {
//                                           console.error(
//                                             "Error Rejecting appointment details:",
//                                             error
//                                           );
//                                           handleError(
//                                             error,
//                                             "Failed to reject appointment"
//                                           );
//                                         }
//                                       }}
//                                     >
//                                       Reject
//                                     </button>
//                                     <button
//                                       type="submit"
//                                       className="submit-button"
//                                     >
//                                       Submit
//                                     </button>
//                                   </div>
//                                 </form>
//                               </DialogDescription>
//                             </DialogHeader>
//                           </DialogContent>
//                         </Dialog>
//                       ) : (
//                         <div className="flex items-center gap-5 text-2xl">
//                           <button
//                             onClick={() =>
//                               navigate(`/appointed-prescription?id=${pat.aptId}`)
//                             }
//                           >
//                             {Shared.Prescription}
//                           </button>

//                           <button
//                             onClick={() => handleCompleteAppointment(pat.email)}
//                           >
//                             {Shared.SquareCheck}
//                           </button>
//                           <button
//                             onClick={() => handleRejectAppointment(pat.email)}
//                           >
//                             {Shared.SquareCross}
//                           </button>
//                           <Dialog
//                           onOpenChange={(open) => {
//                             if (open) {
//                               fetchAvailableDoctors();
//                               setReassignPat({
//                                 ...reassignPat,
//                                 patientEmail:pat.email
//                               })
//                             }
//                           }}
//                         >
//                           <DialogTrigger className="text-2xl">
//                             {Shared.Report}
//                           </DialogTrigger>
//                           <DialogContent>
//                             <DialogHeader>
//                               <DialogTitle className="font-medium text-center pb-3">
//                                 Reassign Patient
//                               </DialogTitle>
//                               <DialogDescription>
//                                 <form onSubmit={handleReassign}>
//                                   <div className="form-group">
//                                     <label htmlFor="appointment">
//                                       Doctor Assigned*
//                                     </label>
//                                     <select
//                                       id="appointment"
//                                       name="appointment"
//                                       className="form-input"
//                                       value={reassignPat.doctorEmail}
//                                       onChange={(e) =>
//                                         setReassignPat({
//                                           ...reassignPat,
//                                           doctorEmail: e.target.value,
//                                         })
//                                       }
//                                     >
//                                       <option value="">Select a doctor</option>
//                                       {doctors.map((doctor) => (
//                                         <option
//                                           key={doctor.id}
//                                           value={doctor.id}
//                                         >
//                                           {doctor.name}
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </div>
//                                   <div className="flex justify-between">
                                    
//                                     <button
//                                       type="submit"
//                                       className="submit-button"
//                                     >
//                                       Submit
//                                     </button>
//                                   </div>
//                                 </form>
//                               </DialogDescription>
//                             </DialogHeader>
//                           </DialogContent>
//                         </Dialog>
//                         </div>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow className="text-center">
//                   <TableCell colSpan={5} className="border py-5">
//                     No patient available!
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>):(<Table className="bg-white rounded-md">
//             <TableHeader>
//               <TableRow className="h-20">
//                 <TableHead className="border text-black font-bold text-center">
//                   Doctor Name
//                 </TableHead>
//                 <TableHead className="border text-black font-bold text-center">
//                   Patient Name
//                 </TableHead>
//                 <TableHead className="border text-black font-bold text-center whitespace-nowrap">
//                   Token Number
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {assignedData.length > 0 ? (
//                 assignedData.map((pat, index) => (
//                   <TableRow className="text-center" key={index}>
//                     <TableCell className="border whitespace-nowrap">
//                       {pat.doctorName}
//                     </TableCell>
//                     <TableCell className="border whitespace-nowrap">
//                       {pat.patientName}
//                     </TableCell>
//                     <TableCell className="border">{pat.tokenNum}</TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow className="text-center">
//                   <TableCell colSpan={5} className="border py-5">
//                     No patient available!
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>)}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PatientList;



import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Shared from "@/Shared";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const PatientList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<
    { email: string; name: string; reason: string; aptId: string; Id: string }[]
  >([]);
  const [selectedButton, setSelectedButton] = useState("Pending");
  const [reassignPat, setReassignPat] = useState({
    doctorEmail: "",
    patientEmail: "",
  });
  const [dialogData, setDialogData] = useState({
    pref_doc: "",
    reason: "",
    doc_reason: "",
    temperature: "",
    weight: "",
  });
  const [docData, setDocData] = useState<{ pref_doc: string; doc_reason: string }>();
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [currentPatientEmail, setCurrentPatientEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatient, setFilteredPatient] = useState(patient);
  const [assignedData, setAssignedData] = useState<
    Array<{ patientName: string; tokenNum: string; doctorName: string }>
  >([]);

  // ... (keep all the existing logic and state management)

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] p-8 space-y-8 flex flex-col max-lg:min-h-[93svh] max-lg:p-4 max-lg:py-4 bg-gray-50">
        <div className="flex justify-center items-center gap-4">
          {["Pending", "Assigned", "Appointed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedButton(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedButton === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-600 shadow-md hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            className="border-0 p-0 text-lg focus-visible:ring-0 shadow-none"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="h-full overflow-y-auto rounded-xl shadow-lg">
          {selectedButton !== "Assigned" ? (
            <Table className="bg-white">
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  {["S.No.", "Name", "Email", "Reason", "Actions"].map((header) => (
                    <TableHead
                      key={header}
                      className="px-6 py-4 text-gray-600 font-semibold uppercase tracking-wider"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatient.map((pat, index) => (
                  <TableRow
                    key={pat.Id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 text-gray-600">{index + 1}</TableCell>
                    <TableCell className="px-6 py-4 font-medium text-gray-900">
                      {pat.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">{pat.email}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {pat.reason}
                    </TableCell>
                    <TableCell className="px-6 py-4 flex items-center gap-4">
                      {selectedButton === "Pending" ? (
                        <Dialog
                          onOpenChange={(open) => open && getAppointmentDetails(pat.email)}
                        >
                          <DialogTrigger className="text-blue-600 hover:text-blue-800 transition-colors">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </DialogTrigger>
                          <DialogContent className="max-w-md rounded-xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-gray-900">
                                Patient Details
                              </DialogTitle>
                              <DialogDescription className="mt-4 space-y-4">
                                <form onSubmit={handleSubmit}>
                                  {/* Keep existing form structure */}
                                  <div className="space-y-6">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preferred Doctor
                                      </label>
                                      <input
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={docData?.pref_doc}
                                        readOnly
                                      />
                                    </div>
                                    {/* Other form fields */}
                                    <div className="flex gap-4 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleRejectAppointment(pat.email)}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        Reject
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => navigate(`/appointed-prescription?id=${pat.aptId}`)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          {/* Other action buttons */}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table className="bg-white">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  {["Doctor", "Patient", "Token"].map((header) => (
                    <TableHead
                      key={header}
                      className="px-6 py-4 text-gray-600 font-semibold uppercase tracking-wider"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedData.map((pat, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 font-medium text-gray-900">
                      {pat.doctorName}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">{pat.patientName}</TableCell>
                    <TableCell className="px-6 py-4 text-blue-600 font-medium">
                      #{pat.tokenNum}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientList;