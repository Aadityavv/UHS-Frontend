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
  Search,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PatientLogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedButton, setSelectedButton] = useState<"Consultation" | "AdHoc">("Consultation");
  const [reports, setReports] = useState<any[]>([]);
  const [adHocRep, setAdHocRep] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr: string | Date) => dayjs(dateStr).format("DD/MM/YYYY");

  const fetchData = async (date?: string) => {
    try {
      if (!date) return;
      setLoading(true);
  
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("roles") || ""; // 👈 assumes you store role on login
      console.log("User Role:", userRole);
      let apiUrl = "";
  
      if (selectedButton === "Consultation") {
        if (userRole === "admin") {
          apiUrl = `https://uhs-backend.onrender.com/api/admin/getAppointmentsByDate?date=${date}`;
        } else {
          apiUrl = `https://uhs-backend.onrender.com/api/AD/getAppointmentByDate?date=${date}`;
        }
      } else {
          if (userRole === "admin") {
            apiUrl = `https://uhs-backend.onrender.com/api/admin/getAdHocByDate?date=${date}`;
          } else {
            apiUrl = `https://uhs-backend.onrender.com/api/AD/getAdHocByDate?date=${date}`;
          }
      }
  
      const resp = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
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
          patientName: rept.PatientName || rept.patientName || "-",
          medicineName: rept.MedicineName || rept.medicineName || "-",
          quantity: rept.Quantity || rept.quantity || "-",
          patientEmail: rept.PatientEmail || rept.patientEmail || "-",
          adName: rept.ADName || rept.adName || "-",
          adEmail: rept.ADEmail || rept.adEmail || "-",
          date: formatDate(rept.Date || rept.date),
          time: rept.Time || rept.time || "-",
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
    } finally {
      setLoading(false);
    }
  };
  

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value);
  const handleDateFilter = () => {
    if (!selectedDate) {
      toast({ 
        title: "Select a date first", 
        description: "Please pick a date before submitting.",
        variant: "destructive"
      });
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

  const filteredData = (selectedButton === "Consultation" ? reports : adHocRep).filter((item) =>
    Object.values(item).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
  ));

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchData(today);
  }, [selectedButton]);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[#ECECEC] p-4 md:p-8 pb-20 md:pb-8"> {/* Added pb-20 for mobile bottom nav */}
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Header with search and refresh */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm">
            <div className="w-full flex items-center space-x-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Button variant="outline" onClick={() => fetchData(selectedDate)}>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Refresh</span>
              </Button>
              {/* Mobile filter button */}
              <div className="md:hidden">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700">Select Date</h3>
                      <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={handleDateChange} 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                      />
                      <Button 
                        onClick={handleDateFilter} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                      >
                        Apply Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-3">
            {/* Sidebar - hidden on mobile */}
            <div className="hidden md:block w-full lg:w-1/4 space-y-4">
              {/* Date Selection */}
              <div className="bg-white rounded-xl p-6 shadow border">
                <h3 className="text-md font-semibold text-gray-700 mb-4">
                  Select Date
                </h3>
                <div className="space-y-4">
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange} 
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                  <Button 
                    onClick={handleDateFilter} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Fetch Data
                  </Button>
                </div>
              </div>

              {/* Data Views - hidden on mobile */}
              <div className="bg-white rounded-xl p-6 shadow border">
                <h3 className="text-md font-semibold text-gray-700 mb-4">
                  Data Views
                </h3>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => setSelectedButton("Consultation")} 
                    className={`text-white ${selectedButton === "Consultation" ? "bg-indigo-600" : "bg-indigo-400 hover:bg-indigo-500"}`}
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    <span>Consultations</span>
                  </Button>
                  <Button 
                    onClick={() => setSelectedButton("AdHoc")} 
                    className={`text-white ${selectedButton === "AdHoc" ? "bg-indigo-600" : "bg-indigo-400 hover:bg-indigo-500"}`}
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    <span>Ad-Hoc</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white rounded-xl shadow border p-4 md:p-6"
              >
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedButton} Records
                  </h2>
                  <p className="text-sm text-gray-500">
                    Showing {filteredData.length} records
                  </p>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 w-full bg-gray-200/50 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <div className="overflow-auto rounded-lg border">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              {selectedButton === "Consultation" ? (
                                <>
                                  <TableHead 
                                    className="cursor-pointer" 
                                    onClick={() => handleSort('token')}
                                  >
                                    <div className="flex items-center">
                                      Token
                                      {sortConfig.key === 'token' && (
                                        sortConfig.direction === 'ascending' ? 
                                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                                        <ArrowDown className="ml-1 h-4 w-4" />
                                      )}
                                    </div>
                                  </TableHead>
                                  <TableHead>Patient</TableHead>
                                  <TableHead>Date</TableHead>
                                  {/* <TableHead>Campus</TableHead> */}
                                  <TableHead>Location</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </>
                              ) : (
                                <>
                                  <TableHead>Patient</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Medicine</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Nurse</TableHead>
                                  {/* <TableHead>Campus</TableHead> */}
                                  <TableHead>Date</TableHead>
                                </>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredData.length > 0 ? (
                              filteredData.map((item: any, index: number) => (
                                <TableRow key={index} className="hover:bg-indigo-50/50">
                                  {selectedButton === "Consultation" ? (
                                    <>
                                      <TableCell className="font-medium">{item.token}</TableCell>
                                      <TableCell>{item.patientName}</TableCell>
                                      <TableCell>{item.date}</TableCell>
                                      <TableCell>
                                        {/* <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                                          {item.campus || 'N/A'}
                                        </span> */}
                                      </TableCell>
                                      <TableCell>{item.location}</TableCell>
                                      <TableCell className="text-right">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => {
                                            const role = localStorage.getItem("roles");
                                            const prevPath = role === "admin" ? "/admin/patient-logs" : "/patient-logs";
                                            navigate(`/previous-prescription?id=${item.reportId}`, {
                                              state: { prevPath }
                                            });
                                          }}
                                          
                                          className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                                        >
                                          <EyeIcon className="h-4 w-4 mr-2" /> View
                                        </Button>
                                      </TableCell>
                                    </>
                                  ) : (
                                    <>
                                      <TableCell>{item.patientName}</TableCell>
                                      <TableCell className="truncate max-w-[180px]">{item.patientEmail}</TableCell>
                                      <TableCell>{item.medicineName}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{item.adName}</TableCell>
                                      <TableCell>
                                        {/* <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                                          {item.campus || 'N/A'}
                                        </span> */}
                                      </TableCell>
                                      <TableCell>{item.date}</TableCell>
                                    </>
                                  )}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell 
                                  colSpan={selectedButton === "Consultation" ? 6 : 7} 
                                  className="text-center py-8 text-gray-500"
                                >
                                  No records found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {filteredData.length > 0 ? (
                        filteredData.map((item: any, index: number) => (
                          <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                            {selectedButton === "Consultation" ? (
                              <>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{item.patientName}</h3>
                                    <p className="text-sm text-gray-500">Token: {item.token}</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/previous-prescription?id=${item.reportId}`, {
                                      state: { prevPath: "/patient-logs" }
                                    })}                                    
                                    className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-gray-500">Date</p>
                                    <p>{item.date}</p>
                                  </div>
                                  <div>
                                    {/* <p className="text-gray-500">Campus</p>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                                      {item.campus || 'N/A'}
                                    </span> */}
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-gray-500">Location</p>
                                    <p>{item.location}</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{item.patientName}</h3>
                                    <p className="text-sm text-gray-500">{item.patientEmail}</p>
                                  </div>
                                  <div className="text-sm text-right">
                                    <p>{item.date}</p>
                                    {/* <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                                      {item.campus || 'N/A'}
                                    </span> */}
                                  </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-gray-500">Medicine</p>
                                    <p>{item.medicineName}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Quantity</p>
                                    <p>{item.quantity}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-gray-500">Nurse</p>
                                    <p>{item.adName}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No records found
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
            <div className="flex justify-around items-center h-16">
              <button
                onClick={() => setSelectedButton("Consultation")}
                className={`flex flex-col items-center justify-center w-full h-full ${selectedButton === "Consultation" ? "text-indigo-600" : "text-gray-500"}`}
              >
                <Stethoscope className="h-5 w-5" />
                <span className="text-xs mt-1">Consultations</span>
              </button>
              <button
                onClick={() => setSelectedButton("AdHoc")}
                className={`flex flex-col items-center justify-center w-full h-full ${selectedButton === "AdHoc" ? "text-indigo-600" : "text-gray-500"}`}
              >
                <Pill className="h-5 w-5" />
                <span className="text-xs mt-1">Ad-Hoc</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientLogs;