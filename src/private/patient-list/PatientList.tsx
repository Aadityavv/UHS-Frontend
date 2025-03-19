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
import { Button } from "@/components/ui/button";
import { Search, FileText, Stethoscope } from "lucide-react";

interface Patient {
  id: string;
  email?: string;
  name: string;
  reason?: string;
  aptId?: string;
  doctorName?: string;
  tokenNum?: string;
  status: "Pending" | "Assigned" | "Appointed";
  rawData: any;
}

const PatientList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dialogData, setDialogData] = useState({
    pref_doc: "",
    temperature: "",
    weight: "",
    doctorEmail: "",
    patientEmail: "",
  });
  const [, setCurrentPatientEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const encodeEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    return domain ? `${localPart}@${domain.replace(".", ",")}` : email;
  };

  const fetchAllPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const headers = {
        Authorization: `Bearer ${token}`,
        "X-Latitude": localStorage.getItem("latitude"),
        "X-Longitude": localStorage.getItem("longitude"),
      };

      const [pendingRes, assignedRes, appointedRes] = await Promise.all([
        axios.get("https://uhs-backend.onrender.com/api/AD/getPatientQueue", { headers }),
        axios.get("https://uhs-backend.onrender.com/api/AD/getAssignedPatient", { headers }),
        axios.get("https://uhs-backend.onrender.com/api/AD/getCompletedQueue", { headers }),
      ]);

      const combinePatients = [
        ...pendingRes.data.map((p: any) => ({
          id: p.Id,
          email: p.sapEmail,
          name: p.name,
          reason: p.reason,
          aptId: p.aptId,
          status: "Pending" as const,
          rawData: p,
        })),
        ...assignedRes.data.map((p: any) => ({
          id: p.PatientToken,
          name: p.PatientName,
          doctorName: p.doctorName,
          tokenNum: p.PatientToken,
          status: "Assigned" as const,
          rawData: p,
        })),
        ...appointedRes.data.map((p: any) => ({
          id: p.Id,
          email: p.sapEmail,
          name: p.name,
          reason: p.reason,
          aptId: p.aptId,
          status: "Appointed" as const,
          rawData: p,
        })),
      ];

      setPatients(combinePatients);
      setFilteredPatients(combinePatients);
    } catch (error) {
      handleError(error, "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter((p) =>
      Object.values(p).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const fetchAvailableDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "X-Latitude": localStorage.getItem("latitude"),
        "X-Longitude": localStorage.getItem("longitude"),
      };
  
      const response = await axios.get(
        "https://uhs-backend.onrender.com/api/AD/getAvailableDoctors",
        { headers }
      );
  
      const availableDoctors = response.data.map((d: any) => ({
        id: d.doctorId.toString(),
        name: d.name,
      }));
  
      setDoctors(availableDoctors);
  
      if (availableDoctors.length === 0) {
        toast({
          variant: "destructive",
          title: "No Doctors Available",
          description: "Currently, no doctors are available for appointment.",
        });
      }
    } catch (error) {
      handleError(error, "Error fetching doctors");
    }
  };
  

  const handleAction = async (action: string, email?: string) => {
    if (!email) return;

    try {
      const token = localStorage.getItem("token");
      setSubmitting(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        "X-Latitude": localStorage.getItem("latitude"),
        "X-Longitude": localStorage.getItem("longitude"),
      };

      if (action === "assign") {
        const weight = parseFloat(dialogData.weight);
        const temperature = parseFloat(dialogData.temperature);

        if (isNaN(weight)) throw new Error("Weight must be a number");
        if (isNaN(temperature)) throw new Error("Temperature must be a number");
        if (weight <= 0 || weight > 300) throw new Error("Invalid weight value");
        if (temperature < 90 || temperature > 110) throw new Error("Temperature out of range");

        await axios.post(
          "https://uhs-backend.onrender.com/api/AD/submitAppointment",
          {
            weight: weight,
            temperature: temperature,
            doctorAss: dialogData.pref_doc,
            patEmail: email, // Use original email for assignment
          },
          { headers }
        );
      } else if (action === "reassign") {
        const modifiedEmail = encodeEmail(email);
        await axios.post(
          "https://uhs-backend.onrender.com/api/AD/reassign",
          {
            patientEmail: modifiedEmail,
            doctorEmail: dialogData.doctorEmail,
          },
          { headers }
        );
      } else if (action === "reject") {
        const modifiedEmail = encodeEmail(email);
        await axios.get(
          `https://uhs-backend.onrender.com/api/AD/rejectAppointment?email=${modifiedEmail}`,
          { headers }
        );
      }

      toast({ title: `Action ${action} successful` });
      fetchAllPatients();
    } catch (error) {
      handleError(error, `Failed to ${action} appointment`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteAppointment = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      const modifiedEmail = encodeEmail(email);
      const headers = {
        Authorization: `Bearer ${token}`,
        "X-Latitude": localStorage.getItem("latitude"),
        "X-Longitude": localStorage.getItem("longitude"),
      };

      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/AD/completeAppointment/${modifiedEmail}`,
        { headers }
      );

      toast({
        title: "Appointment Completed",
        description: response.data,
      });
      fetchAllPatients(); // Refresh the patient list
    } catch (error) {
      handleError(error, "Failed to complete appointment");
    }
  };

  const handleRejectAppointment = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      const modifiedEmail = encodeEmail(email);
      const headers = {
        Authorization: `Bearer ${token}`,
        "X-Latitude": localStorage.getItem("latitude"),
        "X-Longitude": localStorage.getItem("longitude"),
      };

      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/AD/rejectAppointment?email=${modifiedEmail}`,
        { headers }
      );

      toast({
        title: "Appointment Rejected",
        description: response.data,
      });
      fetchAllPatients(); // Refresh the patient list
    } catch (error) {
      handleError(error, "Failed to reject appointment");
    }
  };

  const handleError = (error: any, message: string) => {
    console.error(error);
    toast({
      title: "Error",
      description: `${message}: ${error.message}`,
      variant: "destructive",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  return (
    <div className="bg-[#ECECEC] min-h-[84svh] p-8 space-y-8">
      <Toaster />
      <div className="flex space-x-2 items-center bg-white p-4 rounded-lg">
        <Search className="text-gray-500" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-gray-200/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <Table className="bg-white rounded-lg">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.email || "-"}</TableCell>
                <TableCell>{patient.reason || "-"}</TableCell>
                <TableCell>{patient.doctorName || "-"}</TableCell>
                <TableCell>{patient.tokenNum || "-"}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : patient.status === "Assigned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {patient.status}
                  </span>
                </TableCell>
                <TableCell className="space-x-2 flex justify-end">
  {patient.status === "Pending" && (
    <>
      {/* Dedicated Reject Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleAction("reject", patient.email)}
        disabled={submitting}
      >
        Reject
      </Button>

      {/* Assign Button and Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (patient.email) {
                setCurrentPatientEmail(patient.email);
                fetchAvailableDoctors();
              }
            }}
          >
            <Stethoscope className="mr-2 h-4 w-4" /> Assign
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Doctor</DialogTitle>
            <DialogDescription>
              Assign a doctor to {patient.name}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("assign", patient.email);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Select Doctor *
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={dialogData.pref_doc}
                onChange={(e) =>
                  setDialogData({
                    ...dialogData,
                    pref_doc: e.target.value,
                  })
                }
                required
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Temperature (°F) *
                </label>
                <Input
                  type="number"
                  min="90"
                  max="110"
                  step="0.1"
                  value={dialogData.temperature}
                  onChange={(e) =>
                    setDialogData({
                      ...dialogData,
                      temperature: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Weight (kg) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={dialogData.weight}
                  onChange={(e) =>
                    setDialogData({
                      ...dialogData,
                      weight: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Confirm"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )}

                  {/* {patient.status === "Assigned" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDialogData({
                              ...dialogData,
                              patientEmail: patient.email || "",
                            });
                            fetchAvailableDoctors();
                          }}
                        >
                          Reassign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Reassign Patient</DialogTitle>
                          <DialogDescription>
                            Reassign {patient.name} to another doctor
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAction("reassign", patient.email);
                          }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Select New Doctor *
                            </label>
                            <select
                              className="w-full p-2 border rounded-md"
                              value={dialogData.doctorEmail}
                              onChange={(e) =>
                                setDialogData({
                                  ...dialogData,
                                  doctorEmail: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">Choose a doctor</option>
                              {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                  {doctor.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setDialogData({ ...dialogData, doctorEmail: "" })}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                              {submitting ? "Updating..." : "Confirm Reassignment"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )} */}

                  {patient.status === "Appointed" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/appointed-prescription?id=${patient.aptId}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" /> Prescription
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteAppointment(patient.email || "")}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectAppointment(patient.email || "")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && filteredPatients.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No patients found matching your search
        </div>
      )}
    </div>
  );
};

export default PatientList;