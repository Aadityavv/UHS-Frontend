import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  Calendar as CalendarIcon,
  Clock,
  Eye,
  FileText,
  Filter
} from "lucide-react";
import Skeleton from '@mui/material/Skeleton';
import { ToastAction } from "@radix-ui/react-toast";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UserPrescription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const role = localStorage.getItem("roles");
        const apiUrl = role === "patient" 
          ? "https://uhs-backend.onrender.com/api/patient/getAppointment"
          : `https://uhs-backend.onrender.com/api/doctor/getAppointmentPat/${getPatientEmail()}`;

        const { data } = await axios.get(apiUrl, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const formattedData = data.map((item: any) => ({
          id: item.appointmentId,
          date: format(parseISO(item.date), "dd MMM yyyy"),
          time: format(parseISO(item.date), "hh:mm a"),
          token: item.token,
          link: item.appointmentId
        }));

        setReports(formattedData);
        setFilteredReports(formattedData);
      } catch (error: any) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPatientEmail = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email")?.replace(".", ",") || "";
    return email;
  };

  const handleError = (error: any) => {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to load prescriptions",
      variant: "destructive",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const filterByDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const filtered = reports.filter(report => 
      format(parseISO(report.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
    setFilteredReports(filtered);
  };

  return (
    <div className="min-h-[79vh] bg-gray-50">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Medical Prescriptions</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <FileText className="h-4 w-4" />
                    <span className="hidden lg:inline">{filteredReports.length} records found</span>
                  </div>
                  <Button
                    variant="outline"
                    className="lg:hidden p-2"
                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Date Filter */}
              {isMobileFilterOpen && (
                <div className="lg:hidden mb-6">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[90vw] p-0">
                      <CalendarPrimitive
                        mode="single"
                        selected={date}
                        onSelect={(date) => {
                          if (date) {
                            setDate(date);
                            filterByDate(date);
                            setIsMobileFilterOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between p-3">
                      <Skeleton variant="text" width={100} height={24} />
                      <Skeleton variant="text" width={80} height={24} />
                      <Skeleton variant="text" width={60} height={24} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Date</span>
                    <span className="text-sm font-medium text-gray-500">Time</span>
                    <span className="text-sm font-medium text-gray-500">Token</span>
                    <span className="text-sm font-medium text-gray-500 text-right">Actions</span>
                  </div>

                  {filteredReports.map((report) => (
                    <div key={report.id} className="grid grid-cols-4 gap-4 items-center p-4 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-indigo-600" />
                        <span className="text-gray-600">{report.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                        <span className="text-gray-600">{report.time}</span>
                      </div>
                      <div className="text-gray-600">{report.token}</div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => navigate(`/prescription?id=${report.id}`)}
                          className="flex items-center text-indigo-600 hover:text-indigo-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="text-sm">View</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Desktop Calendar Filter */}
          <div className="w-full lg:w-1/4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hidden lg:block"
            >
              <h3 className="text-sm font-medium text-gray-500 mb-4">Filter by Date</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarPrimitive
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      if (date) {
                        setDate(date);
                        filterByDate(date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserPrescription;