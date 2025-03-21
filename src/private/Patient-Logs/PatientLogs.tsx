import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Pill,
  ArrowUp,
  ArrowDown,
  EyeIcon,
} from "lucide-react";

const PatientLogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedButton, setSelectedButton] = useState("Consultation");
  const [, setTime] = useState<Date>(new Date());
  // const [date, setDate] = useState<Date | undefined>(new Date());
  const [reports, setReports] = useState([]);
  const [adHocRep, setAdHocRep] = useState([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const formatDate = (dateStr: string | Date) => dayjs(dateStr).format("DD/MM/YYYY");

  const fetchData = async (date?: string) => {
    try {
      if (!date) return;
      let apiUrl = selectedButton === "Consultation"
        ? `http://localhost:8081/api/AD/getAppointmentByDate?date=${date}`
        : `http://localhost:8081/api/AD/getAdHocByDate?date=${date}`;

      const resp = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const response = resp.data;
      if (selectedButton === "Consultation") {
        const formatData = response.map((rept: any) => ({
          reportId: rept.appointmentId,
          patientName: rept.PatientName,
          token: rept.token,
          date: formatDate(rept.date),
          time: rept.time,
          location: rept.location,
        }));
        setReports(formatData);
      } else {
        const formatData = response.map((rept: any) => ({
          patientName: rept.PatientName,
          medicineName: rept.MedicineName,
          quantity: rept.Quantity,
          patientEmail: rept.PatientEmail,
          adName: rept.ADName,
          adEmail: rept.ADEmail,
          date: formatDate(rept.Date),
          time: rept.Time,
        }));
        setAdHocRep(formatData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value);
  const handleDateFilter = () => {
    if (!selectedDate) {
      toast({ title: "Select a date first", description: "Please pick a date before submitting." });
      return;
    }
    fetchData(selectedDate);
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...(selectedButton === "Consultation" ? reports : adHocRep)].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    selectedButton === "Consultation" ? setReports(sortedData) : setAdHocRep(sortedData);
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchData(today);
  }, [selectedButton]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 space-y-6">
              {/* <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Current Time</p>
                    <p className="text-2xl font-bold">{formatTimeString(time)}</p>
                  </div>
                  <Clock className="h-8 w-8" />
                </div>
              </motion.div> */}
              <div className="bg-gray-50 rounded-xl p-6 shadow">
                <h3 className="text-md font-semibold text-gray-700 mb-4">Select Date</h3>
                <input type="date" value={selectedDate} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-400" />
                <Button onClick={handleDateFilter} className="w-full mt-4 bg-indigo-600 text-white">Fetch Data</Button>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 shadow">
                <h3 className="text-md font-semibold text-gray-700 mb-4">Data Views</h3>
                <div className="flex flex-col gap-4">
                  <Button onClick={() => setSelectedButton("Consultation")} className={`w-full ${selectedButton === "Consultation" ? "bg-indigo-600 text-white" : "bg-white border text-gray-700"}`}>
                    <Stethoscope className="h-4 w-4 mr-2" /> Consultations
                  </Button>
                  <Button onClick={() => setSelectedButton("AdHoc")} className={`w-full ${selectedButton === "AdHoc" ? "bg-indigo-600 text-white" : "bg-white border text-gray-700"}`}>
                    <Pill className="h-4 w-4 mr-2" /> Ad-Hoc Treatments
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow border p-4 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedButton} Records</h2>
                <div className="overflow-auto">
                  <Table>
                    <TableCaption className="text-sm text-gray-500">List of {selectedButton} Records</TableCaption>
                    <TableHeader>
                      <TableRow>
                        {selectedButton === "Consultation" ? (
                          <>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('token')}>Token {sortConfig.key === 'token' && (sortConfig.direction === 'ascending' ? <ArrowUp className="inline w-4 h-4" /> : <ArrowDown className="inline w-4 h-4" />)}</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Action</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Patient</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Nurse</TableHead>
                            <TableHead>Nurse Email</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedButton === "Consultation" ? reports : adHocRep).map((item: any, index: number) => (
                        <TableRow key={index} className="hover:bg-indigo-50/50">
                          {selectedButton === "Consultation" ? (
                            <>
                              <TableCell>{item.token}</TableCell>
                              <TableCell>{item.patientName}</TableCell>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.time}</TableCell>
                              <TableCell>{item.location}</TableCell>
                              <TableCell>
                                <Button variant="outline" onClick={() => navigate(`/previous-prescription?id=${item.reportId}`)}>
                                  <EyeIcon className="h-4 w-4 mr-2" /> View
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{item.patientName}</TableCell>
                              <TableCell>{item.patientEmail}</TableCell>
                              <TableCell>{item.medicineName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.adName}</TableCell>
                              <TableCell>{item.adEmail}</TableCell>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.time}</TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientLogs;
