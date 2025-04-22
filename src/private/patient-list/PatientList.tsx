import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { PlusCircle, Search, FileText, Stethoscope, RefreshCcw } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

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
  createdAt?: string;
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

  const [manualOpen, setManualOpen] = useState(false);
  const [manualData, setManualData] = useState({
    email: "",
    reason: "",
    preferredDoctor: "",
    reasonForPref: ""
  });

  const encodeEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    return domain ? `${localPart}@${domain.replace(".", ",")}` : email;
  };

  const handleManualAppointment = async () => {
    try {
      // Check if email already exists in patient list
      const alreadyExists = patients.some(
        (p) => p.email?.toLowerCase() === manualData.email.toLowerCase()
      );

      if (alreadyExists) {
        toast({
          title: "Appointment already queued",
          description: "This patient already has an appointment in the queue.",
          variant: "destructive",
        });
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.post(
        "https://uhs-backend.onrender.com/api/AD/manual/submitAppointment",
        {
          email: manualData.email,
          reason: manualData.reason,
          preferredDoctor: manualData.preferredDoctor || null,
          reasonPrefDoctor: manualData.reasonForPref || null,
        },
        { headers }
      );

      toast({ title: "Manual appointment created successfully!" });
      setManualOpen(false);
      setManualData({
        email: "",
        reason: "",
        preferredDoctor: "",
        reasonForPref: ""
      });
      fetchAllPatients();
    } catch (error) {
      handleError(error, "Failed to create manual appointment");
    } finally {
      setSubmitting(false);
    }
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
          console.log("Raw appointment:", p); // inside map callback
          return {
            id: p.Id,
            email: p.sapEmail,
            name: p.name,
            reason: p.reason,
            aptId: p.aptId,
            tokenNum: p.tokenNum || "-",
            status: "Pending" as const,
            doctorName: "",
            preferredDoctor,
            reasonForPref,
            rawData: p,
            createdAt: p.createdAt || p.aptForm?.createdAt || "-",
          };
        }
      )
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

      const appointedPatients = await Promise.all(
        appointedRes.data.map(async (p: any) => {
          const { preferredDoctor, reasonForPref } = await fetchAppointmentDetails(p.sapEmail);
          return {
            id: p.Id,
            email: p.sapEmail,
            name: p.name,
            reason: p.reason,
            aptId: p.aptId,
            doctorName: p.doctorName,
            tokenNum: p.tokenNum || "-",
            preferredDoctor,
            reasonForPref,
            status: "Appointed" as const,
            rawData: p,
            createdAt: p.createdAt || p.aptForm?.createdAt || "-",
          };
        })
      );

      const combinePatients = [...pendingPatients, ...assignedPatients, ...appointedPatients];
      const statusPriority = { Pending: 0, Assigned: 1, Appointed: 2 };
      const patientMap = new Map<string, Patient>();

      for (const patient of combinePatients) {
        const key = patient.email || patient.id;
        const existing = patientMap.get(key);

        if (
          !existing ||
          statusPriority[patient.status as keyof typeof statusPriority] >
            statusPriority[existing.status as keyof typeof statusPriority]
        ) {
          patientMap.set(key, patient);
        }
      }

      const uniquePatients = Array.from(patientMap.values());
      setPatients(uniquePatients);
      setFilteredPatients(uniquePatients);
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

        if (isNaN(weight)) {
          throw new Error("Please enter a valid weight");
        }
        if (weight <= 0 || weight > 300) {
          throw new Error("Weight must be between 0 and 300 kg");
        }
        if (isNaN(temperature)) {
          throw new Error("Please enter a valid temperature");
        }
        if (temperature < 90 || temperature > 110) {
          throw new Error("Temperature must be between 90°F and 110°F");
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
        try {
          await axios.get(
            `https://uhs-backend.onrender.com/api/AD/rejectAppointment?email=${modifiedEmail}`,
            { headers }
          );
          toast({ title: "Appointment Rejected" });
        } catch (err: any) {
          const errorMessage = err.response?.data?.message;
          if (errorMessage && errorMessage.includes("different campus")) {
            toast({
              title: "Access Denied",
              description: "This appointment belongs to a different campus. You cannot reject it.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: errorMessage || "Something went wrong during rejection.",
              variant: "destructive",
            });
          }
        }
      }

      fetchAllPatients();
      setDialogData({
        pref_doc: "",
        temperature: "",
        weight: "",
      });
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

  useEffect(() => {
    fetchAllPatients();
    const interval = setInterval(fetchAllPatients, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = patients.filter((p) =>
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  return (
    <div className="min-h-[84svh] p-4 space-y-6">
      <Toaster />

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" onClick={fetchAllPatients} className="flex-1 md:flex-none">
            <RefreshCcw className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setManualOpen(true)}
            className="flex-1 md:flex-none"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Manual Appointment Dialog */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manual Appointment</DialogTitle>
            <DialogDescription>
              Add a new patient to the queue manually
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient Email *</label>
              <Input
                placeholder="patient@example.com"
                value={manualData.email}
                onChange={(e) => setManualData({ ...manualData, email: e.target.value.toLowerCase() })}
                type="email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Appointment *</label>
              <Input
                placeholder="Reason for visit"
                value={manualData.reason}
                onChange={(e) => setManualData({ ...manualData, reason: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Doctor (optional)</label>
              <Select
                value={manualData.preferredDoctor}
                onValueChange={(value) => setManualData({ ...manualData, preferredDoctor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Preference (optional)</label>
              <Textarea
                value={manualData.reasonForPref}
                onChange={(e) => setManualData({ ...manualData, reasonForPref: e.target.value })}
                placeholder="Explain your preference"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setManualOpen(false);
                  setManualData({
                    email: "",
                    reason: "",
                    preferredDoctor: "",
                    reasonForPref: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleManualAppointment}
                disabled={submitting || !manualData.email || !manualData.reason}
              >
                {submitting ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Preferred Doctor</TableHead>
                  <TableHead>Assigned Doctor</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.email || "-"}</TableCell>
                      <TableCell>{patient.reason || "-"}</TableCell>
                      <TableCell>{patient.preferredDoctor || "-"}</TableCell>
                      <TableCell>{patient.doctorName || "-"}</TableCell>
                      <TableCell>{patient.tokenNum || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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
                      <TableCell>
                      {dayjs.utc(patient.createdAt).tz("Asia/Kolkata").fromNow()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {patient.status === "Pending" && (
                          <Dialog
                            onOpenChange={(open) => {
                              if (open) {
                                setSelectedPatient(patient);
                                fetchAvailableDoctors();
                              }
                            }}
                          >
                            <div className="flex gap-2 justify-end">
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Stethoscope className="mr-2 h-4 w-4" /> Assign
                                </Button>
                              </DialogTrigger>

                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  navigate("/adhoc", {
                                    state: {
                                      name: patient.name,
                                      email: patient.email,
                                      reason: patient.reason,
                                    },
                                  })
                                }
                              >
                                Ad-Hoc
                              </Button>
                            </div>

                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Doctor</DialogTitle>
                                <DialogDescription>
                                  Assign a doctor to {patient.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-1 text-sm">
                                <p><strong>Preferred Doctor:</strong> {patient.preferredDoctor}</p>
                                <p><strong>Reason For Preference:</strong> {patient.reasonForPref}</p>
                              </div>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleAction("assign", selectedPatient);
                                }}
                                className="space-y-4 pt-4"
                              >
                                <div>
                                  <label className="block text-sm font-medium mb-1">Select Doctor *</label>
                                  <Select
                                    value={dialogData.pref_doc}
                                    onValueChange={(value) =>
                                      setDialogData({ ...dialogData, pref_doc: value })
                                    }
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {doctors.map((doctor) => (
                                        <SelectItem key={doctor.id} value={doctor.id}>
                                          {doctor.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Temperature (°F) *</label>
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
                                    <label className="block text-sm font-medium mb-1">Weight (kg) *</label>
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
                                <div className="flex justify-between pt-2">
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
                          <div className="flex gap-2 justify-end">
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4 bg-background">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{patient.email || "-"}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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

                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Reason</p>
                      <p>{patient.reason || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Token</p>
                      <p>{patient.tokenNum || "-"}</p>
                    </div>
                    <div>
  <p className="text-muted-foreground">Booked At</p>
  <p>{dayjs.utc(patient.createdAt).tz("Asia/Kolkata").fromNow()}</p>
</div>

                    <div>
                      <p className="text-muted-foreground">Preferred Doctor</p>
                      <p>{patient.preferredDoctor || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Assigned Doctor</p>
                      <p>{patient.doctorName || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {patient.status === "Pending" && (
                      <Dialog
                        onOpenChange={(open) => {
                          if (open) {
                            setSelectedPatient(patient);
                            fetchAvailableDoctors();
                          }
                        }}
                      >
                        <div className="flex gap-2 w-full">
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Stethoscope className="h-4 w-4 mr-2" /> Assign
                            </Button>
                          </DialogTrigger>

                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              navigate("/adhoc", {
                                state: {
                                  name: patient.name,
                                  email: patient.email,
                                  reason: patient.reason,
                                },
                              })
                            }
                          >
                            Ad-Hoc
                          </Button>
                        </div>

                        <DialogContent className="max-w-[95vw] rounded-lg">
                          <DialogHeader>
                            <DialogTitle>Assign Doctor</DialogTitle>
                            <DialogDescription>
                              Assign a doctor to {patient.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-1 text-sm">
                            <p><strong>Preferred Doctor:</strong> {patient.preferredDoctor}</p>
                            <p><strong>Reason For Preference:</strong> {patient.reasonForPref}</p>
                          </div>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleAction("assign", selectedPatient);
                            }}
                            className="space-y-4 pt-4"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-1">Select Doctor *</label>
                              <Select
                                value={dialogData.pref_doc}
                                onValueChange={(value) =>
                                  setDialogData({ ...dialogData, pref_doc: value })
                                }
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {doctors.map((doctor) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                      {doctor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Temperature (°F) *</label>
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
                                <label className="block text-sm font-medium mb-1">Weight (kg) *</label>
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
                            <div className="flex justify-between pt-2">
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
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/appointed-prescription?id=${patient.aptId}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" /> Prescription
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCompleteAppointment(patient.email || "")}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAction("reject", patient)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">No patients found</p>
                <Button variant="ghost" onClick={fetchAllPatients} className="mt-2">
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientList;