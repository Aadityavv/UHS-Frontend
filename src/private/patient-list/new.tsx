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
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  CheckSquare,
  XSquare,
  FilePlus2,
  RefreshCw,
  User,
  Stethoscope,
  ClipboardList
} from "lucide-react";

const PatientList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<
    {
      email: string;
      name: string;
      reason: string;
      aptId: string;
      Id: string;
    }[]
  >([]);
  const [selectedButton, setSelectedButton] = useState("Pending");
  const [reassignPat,setReassignPat] = useState({
    doctorEmail:"",
    patientEmail:""
  });
  const [dialogData, setDialogData] = useState({
    pref_doc: "",
    reason: "",
    doc_reason: "",
    temperature: "",
    weight: "",
  });
  const [docData, setDocData] = useState<{
    pref_doc: string;
    doc_reason: string;
  }>();
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [currentPatientEmail, setCurrentPatientEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatient, setFilteredPatient] = useState(patient);
  const [assignedData, setAssignedData] = useState<Array<{patientName:string, tokenNum:string,doctorName:string}>>([]);

  const fetchList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (
        !(localStorage.getItem("latitude") || localStorage.getItem("longitude"))
      ) {
        toast({
          title: "Location Required",
          description: "Please select a location before fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
          variant: "destructive",
        });
        return;
      }

      const url =
        selectedButton === "Pending"
          ? "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getPatientQueue"
          : selectedButton === "Assigned" ? "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getAssignedPatient" : "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getCompletedQueue";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Latitude": localStorage.getItem("latitude"),
          "X-Longitude": localStorage.getItem("longitude"),
        },
      });

      const fetchedData = response.data;
      if(selectedButton === "Assigned"){
        const formattedData = fetchedData.map((pat: any) => ({
          patientName:pat.PatientName, 
          tokenNum:pat.PatientToken,
          doctorName:pat.doctorName
        }));

        setAssignedData(formattedData);
      }else{
        const formattedData = fetchedData.map((pat: any) => ({
          email: pat.sapEmail,
          name: pat.name,
          reason: pat.reason,
          aptId: pat.aptId,
          Id: pat.Id,
        }));
        setPatient(formattedData);
        setFilteredPatient(formattedData);
      }
        
    } catch (error) {
      handleError(error, "Failed to fetch patient list");
    }
  };

  useEffect(() => {
    fetchList();
  }, [selectedButton]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patient.filter(
        (pat) =>
          pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pat.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pat.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatient(filtered);
    } else {
      setFilteredPatient(patient);
    }
  }, [searchQuery, patient]);

  const getAppointmentDetails = async (email: string) => {
    const modifiedEmail = email.replace(/@.*?\./g, (match) =>
      match.replace(/\./g, ",")
    );
    setCurrentPatientEmail(email);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getAptForm/${modifiedEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      const formatData = response.data;
      setDocData({
        pref_doc: formatData.pref_doc
          ? formatData.pref_doc.name
          : "No Preferred Doctor",
        doc_reason: formatData.doc_reason || "",
      });

      await fetchAvailableDoctors();
    } catch (error) {
      handleError(error, "Error fetching appointment details");
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      if (
        !(localStorage.getItem("latitude") || localStorage.getItem("longitude"))
      ) {
        toast({
          title: "Location Required",
          description: "Please select a location before fetching data.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        return;
      }
      const response = await axios.get(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/getAvailableDoctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Latitude": localStorage.getItem("latitude"),
            "X-Longitude": localStorage.getItem("longitude"),
          },
        }
      );

      const doctorList = response.data.map((doctor: any) => ({
        id: doctor.doctorId.toString(),
        name: doctor.name,
      }));
      setDoctors(doctorList);
    } catch (error) {
      handleError(error, "Error fetching available doctors");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/submitAppointment",
        {
          weight: dialogData.weight,
          temperature: dialogData.temperature,
          doctorAss: dialogData.pref_doc,
          patEmail: currentPatientEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Appointment details submitted successfully.",
        });
        window.location.reload();
      } else {
        throw new Error("Failed to submit appointment details.");
      }
    } catch (error) {
      handleError(error, "Failed to submit appointment details");
    }
  };

  const handleError = (error: any, defaultMessage: string) => {
    let message = defaultMessage;
    if (axios.isAxiosError(error)) {
      if (error.response) {
        message = `${error.response.data.message}`;
      } else if (error.request) {
        message =
          "No response from server. Please check your network connection.";
      } else {
        message = error.message;
      }
    }
    console.error(message, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };
  const handleRejectAppointment = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      const emailSent = email.substring(0,email.indexOf("@"))+email.substring(email.indexOf("@")).replace(".",",");
      const response = await axios.get(
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/rejectAppointment?email=${emailSent}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast({ title: "Appointment Rejected", description: response.data });
        fetchList();
      }
    } catch (err) {
      handleError(err, "Failed to reject appointment");
    }
  };

  const handleCompleteAppointment = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      const emailSent = email.substring(0,email.indexOf("@"))+email.substring(email.indexOf("@")).replace(".",",");
      const response = await axios.get(
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/completeAppointment/${emailSent}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Appointment Completed",
        description: response.data,
      });
      fetchList();
    } catch (err) {
      handleError(err, "Failed to complete appointment");
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/AD/reassign",
        {
          patientEmail:reassignPat.patientEmail,
          doctorEmail:reassignPat.doctorEmail
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Appointment details submitted successfully.",
        });
        window.location.reload();
      } else {
        throw new Error("Failed to submit appointment details.");
      }
    } catch (error) {
      handleError(error, "Failed to submit appointment details");
    }
  }


  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    className="pl-10 pr-4 py-2 rounded-lg border-gray-200 focus:ring-indigo-500"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-3 gap-4">
              {["Pending", "Assigned", "Appointed"].map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedButton(status)}
                  className={`p-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    selectedButton === status
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {status === "Pending" && <ClipboardList className="h-6 w-6" />}
                  {status === "Assigned" && <User className="h-6 w-6" />}
                  {status === "Appointed" && <Stethoscope className="h-6 w-6" />}
                  <span className="font-medium">{status}</span>
                </motion.button>
              ))}
            </div>

            {/* Table Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <Table className="border-none">
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-transparent">
                    {selectedButton !== "Assigned" ? (
                      <>
                        <TableHead className="text-gray-600 font-semibold">S.No.</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Name</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Email</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Reason</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Actions</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-gray-600 font-semibold">Doctor</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Patient</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Token</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedButton !== "Assigned" ? filteredPatient : assignedData).length > 0 ? (
                    (selectedButton !== "Assigned" ? filteredPatient : assignedData).map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <TableRow className="hover:bg-gray-50">
                          {selectedButton !== "Assigned" ? (
                            <>
                              <TableCell className="text-gray-700">{index + 1}</TableCell>
                              <TableCell className="text-gray-700">{item.name}</TableCell>
                              <TableCell className="text-gray-700">{item.email}</TableCell>
                              <TableCell className="text-gray-700">{item.reason}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {selectedButton === "Pending" ? (
                                  <Dialog
                                    onOpenChange={(open) => {
                                      if (open) {
                                        getAppointmentDetails(item.email);
                                      }
                                    }}
                                  >
                                    <DialogTrigger className="text-indigo-600 hover:text-indigo-700">
                                      <FilePlus2 className="h-5 w-5" />
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle className="font-medium text-center pb-3">
                                          Appointment Details
                                        </DialogTitle>
                                        <DialogDescription>
                                          {/* Keep existing form structure */}
                                        </DialogDescription>
                                      </DialogHeader>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => navigate(`/appointed-prescription?id=${item.aptId}`)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <FileText className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleCompleteAppointment(item.email)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <CheckSquare className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleRejectAppointment(item.email)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XSquare className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-gray-700">{item.doctorName}</TableCell>
                              <TableCell className="text-gray-700">{item.patientName}</TableCell>
                              <TableCell className="text-gray-700">{item.tokenNum}</TableCell>
                            </>
                          )}
                        </TableRow>
                      </motion.div>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <ClipboardList className="h-12 w-12 text-gray-400" />
                          <p>No patients available</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PatientList;