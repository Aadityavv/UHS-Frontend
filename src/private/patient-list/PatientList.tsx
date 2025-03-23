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
import { Search, FileText, Stethoscope, RefreshCcw } from "lucide-react";

interface Patient {
  id: string;
  email?: string;
  name: string;
  reason?: string;
  aptId?: string;
  doctorName?: string;
  preferredDoctor?: string;
  reasonForPref?: string;
  tokenNum?: string;
  status: "Pending" | "Assigned" | "Appointed";
  rawData: any;
}

const PatientList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [dialogData, setDialogData] = useState({
    pref_doc: "",
    temperature: "",
    weight: "",
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const encodeEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    return domain ? `${localPart}@${domain.replace(".", ",")}` : email;
  };

  const fetchAllPatients = async () => {
    try {
      setLoading(true);
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

      const pendingPatients = await Promise.all(
        pendingRes.data.map(async (p: any) => {
          const { preferredDoctor, reasonForPref } = await fetchAppointmentDetails(p.sapEmail);
          return {
            id: p.Id,
            email: p.sapEmail,
            name: p.name,
            reason: p.reason,
            aptId: p.aptId,
            status: "Pending" as const,
            doctorName: "",
            preferredDoctor,
            reasonForPref,
            rawData: p,
          };
        })
      );

      const assignedPatients = assignedRes.data.map((p: any) => ({
        id: p.PatientToken,
        name: p.PatientName,
        email: p.sapEmail,
        reason: p.reason,
        aptId: p.aptId,
        tokenNum: p.PatientToken,
        doctorName: p.doctorName,
        preferredDoctor: "-",
        reasonForPref: "-",
        status: "Assigned" as const,
        rawData: p,
      }));

      const appointedPatients = appointedRes.data.map((p: any) => ({
        id: p.Id,
        email: p.sapEmail,
        name: p.name,
        reason: p.reason,
        aptId: p.aptId,
        doctorName: p.doctorName,
        preferredDoctor: "-",
        reasonForPref: "-",
        status: "Appointed" as const,
        rawData: p,
      }));

      const combinePatients = [...pendingPatients, ...assignedPatients, ...appointedPatients];
      setPatients(combinePatients);
      setFilteredPatients(combinePatients);
    } catch (error) {
      handleError(error, "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentDetails = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      const modifiedEmail = encodeEmail(email);
      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/AD/getAptForm/${modifiedEmail}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      return {
        preferredDoctor: data.pref_doc?.name || "No Preferred Doctor",
        reasonForPref: data.doc_reason || "-",
      };
    } catch (error) {
      return { preferredDoctor: "-", reasonForPref: "-" };
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

      setDoctors(
        response.data.map((d: any) => ({
          id: d.doctorId.toString(),
          name: d.name,
        }))
      );
    } catch (error) {
      handleError(error, "Error fetching doctors");
    }
  };

  const handleAction = async (action: string, patient: Patient | null) => {
    if (!patient || !patient.email) return;

    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "X-Latitude": localStorage.getItem("latitude"),
      "X-Longitude": localStorage.getItem("longitude"),
    };

    try {
      setSubmitting(true);

      if (action === "assign") {
        const weight = parseFloat(dialogData.weight);
        const temperature = parseFloat(dialogData.temperature);

        if (isNaN(weight) || weight <= 0 || weight > 300) {
          throw new Error("Invalid weight value");
        }
        if (isNaN(temperature) || temperature < 90 || temperature > 110) {
          throw new Error("Temperature out of range");
        }

        await axios.post(
          "https://uhs-backend.onrender.com/api/AD/submitAppointment",
          {
            weight,
            temperature,
            doctorAss: dialogData.pref_doc,
            patEmail: patient.email,
          },
          { headers }
        );

        toast({ title: `Patient assigned successfully!` });
      } else if (action === "reject") {
        const modifiedEmail = encodeEmail(patient.email);
        await axios.get(
          `https://uhs-backend.onrender.com/api/AD/rejectAppointment?email=${modifiedEmail}`,
          { headers }
        );
        toast({ title: "Appointment Rejected" });
      }

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

      await axios.get(
        `https://uhs-backend.onrender.com/api/AD/completeAppointment/${modifiedEmail}`,
        { headers }
      );

      toast({ title: "Appointment Completed" });
      fetchAllPatients();
    } catch (error) {
      handleError(error, "Failed to complete appointment");
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
    <div className="bg-[#ECECEC] min-h-[84svh] p-4 md:p-8 space-y-8">
      <Toaster />

      <div className="flex space-x-2 items-center bg-white p-4 rounded-lg">
        <Search className="text-gray-500" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0"
        />
        <Button variant="outline" onClick={fetchAllPatients}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-gray-200/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="hidden md:block">
            <Table className="bg-white rounded-lg">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Preferred Doctor</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.email || "-"}</TableCell>
                    <TableCell>{patient.reason || "-"}</TableCell>
                    <TableCell>{patient.preferredDoctor || "-"}</TableCell>
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
                        <Dialog
                          onOpenChange={(open) => {
                            if (open) {
                              setSelectedPatient(patient);
                              fetchAvailableDoctors();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Stethoscope className="mr-2 h-4 w-4" /> Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Assign Doctor</DialogTitle>
                              <DialogDescription>
                                Assign a doctor to {patient.name}
                                <br />
                                <strong>Preferred Doctor:</strong> {patient.preferredDoctor}
                                <br />
                                <strong>Reason For Preference:</strong> {patient.reasonForPref}
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleAction("assign", selectedPatient);
                              }}
                              className="space-y-4"
                            >
                              <div>
                                <label>Select Doctor *</label>
                                <select
                                  className="w-full p-2 border rounded-md"
                                  value={dialogData.pref_doc}
                                  onChange={(e) =>
                                    setDialogData({ ...dialogData, pref_doc: e.target.value })
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
                                <div>
                                  <label>Temperature (°F) *</label>
                                  <Input
                                    type="number"
                                    min="90"
                                    max="110"
                                    step="0.1"
                                    value={dialogData.temperature}
                                    onChange={(e) =>
                                      setDialogData({ ...dialogData, temperature: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <label>Weight (kg) *</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={dialogData.weight}
                                    onChange={(e) =>
                                      setDialogData({ ...dialogData, weight: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => handleAction("reject", selectedPatient)}
                                  disabled={submitting}
                                >
                                  Reject
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                  {submitting ? "Submitting..." : "Confirm"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}

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
                            onClick={() => handleAction("reject", patient)}
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
          </div>

          {/* MOBILE */}
          <div className="md:hidden space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.email || "-"}</p>
                  </div>
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
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p><strong>Reason:</strong> {patient.reason || "-"}</p>
                  <p><strong>Preferred Doctor:</strong> {patient.preferredDoctor || "-"}</p>
                  <p><strong>Doctor:</strong> {patient.doctorName || "-"}</p>
                  <p><strong>Token:</strong> {patient.tokenNum || "-"}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  {patient.status === "Pending" && (
                    <Dialog
                      onOpenChange={(open) => {
                        if (open) {
                          setSelectedPatient(patient);
                          fetchAvailableDoctors();
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Stethoscope className="mr-2 h-4 w-4" /> Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Assign Doctor</DialogTitle>
                          <DialogDescription>
                            Assign a doctor to {patient.name}
                            <br />
                            <strong>Preferred Doctor:</strong> {patient.preferredDoctor}
                            <br />
                            <strong>Reason For Preference:</strong> {patient.reasonForPref}
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAction("assign", selectedPatient);
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label>Select Doctor *</label>
                            <select
                              className="w-full p-2 border rounded-md"
                              value={dialogData.pref_doc}
                              onChange={(e) =>
                                setDialogData({ ...dialogData, pref_doc: e.target.value })
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
                            <div>
                              <label>Temperature (°F) *</label>
                              <Input
                                type="number"
                                min="90"
                                max="110"
                                step="0.1"
                                value={dialogData.temperature}
                                onChange={(e) =>
                                  setDialogData({ ...dialogData, temperature: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div>
                              <label>Weight (kg) *</label>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                value={dialogData.weight}
                                onChange={(e) =>
                                  setDialogData({ ...dialogData, weight: e.target.value })
                                }
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => handleAction("reject", selectedPatient)}
                              disabled={submitting}
                            >
                              Reject
                            </Button>
                            <Button type="submit" disabled={submitting}>
                              {submitting ? "Submitting..." : "Confirm"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

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
                        onClick={() => handleAction("reject", patient)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientList;