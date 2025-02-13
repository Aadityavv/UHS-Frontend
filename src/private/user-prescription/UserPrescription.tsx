import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Shared from "@/Shared";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays, Eye } from "lucide-react";

const UserPrescription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reports, setReports] = useState<
    Array<{
      reportId: string;
      date: string;
      token: string;
      downloadLink: string;
    }>
  >([]);
  const [filteredReports, setFilteredReports] = useState(reports);
  const [showCalendar, setShowCalendar] = useState(false); // State to control calendar visibility on mobile

  // Fetch reports data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = "";
        const role = localStorage.getItem("roles");

        if (role !== "patient") {
          const url = window.location.search;
          const email = url.substring(url.indexOf("?") + 4);
          const emailSent = email.substring(0, email.indexOf("@")) + email.substring(email.indexOf("@")).replace(".", ",");
          apiUrl = `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/doctor/getAppointmentPat/${emailSent}`;
        } else {
          apiUrl = "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/getAppointment";
        }

        const resp = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const response = resp.data;

        const formatData = response.map((rept: any) => ({
          reportId: rept.appointmentId,
          date: rept.date,
          token: rept.token,
          downloadLink: `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/prescription?id=${rept.appointmentId}`,
        }));

        setReports(formatData);
        setFilteredReports(formatData); // Initialize filtered reports
      } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
          toast({
            title: "Error",
            description: error.response.data.message,
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        } else {
          toast({
            title: "Error",
            description: "An error occurred while fetching reports. Please try again.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }
    };

    fetchData();
  }, []);

  // Filter reports based on selected date
  useEffect(() => {
    if (date) {
      const filtered = reports.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate.toDateString() === date.toDateString();
      });
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [date, reports]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format time to HH:MM:SS AM/PM
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
    return `${formattedHours}:${minutes}:${seconds} ${period}`;
  };

  return (
    <>
      <Toaster />
      <div className="h-[84svh] flex flex-col gap-8 p-4 max-lg:h-[93svh] bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Prescriptions</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto bg-white/90 backdrop-blur-md hover:bg-gray-100"
              onClick={() => setShowCalendar(!showCalendar)} // Toggle calendar visibility on mobile
            >
              <CalendarDays className="w-4 h-4" />
              {date?.toLocaleDateString()}
            </Button>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto bg-white/90 backdrop-blur-md hover:bg-gray-100">
              <Clock className="w-4 h-4" />
              {formatTime(time)}
            </Button>
          </div>
        </motion.div>

        {/* Calendar and Reports Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar Section */}
          {/* Visible by default on large screens, hidden on mobile unless toggled */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`w-full lg:w-1/3 ${showCalendar ? "block" : "hidden lg:block"}`} // Hide on mobile unless toggled
          >
            <Card className="p-6 shadow-lg bg-white/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl">Select a Date</CardTitle>
                <CardDescription>View reports for a specific date.</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Reports Table Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full lg:w-2/3"
          >
            <Card className="shadow-lg bg-white/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl">Recent Reports</CardTitle>
                <CardDescription>A list of your recent prescriptions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of your recent reports</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Token Number</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-center">View Report</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.reportId} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="text-center">{report.token}</TableCell>
                        <TableCell className="text-center">{report.date}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            className="hover:bg-gray-100"
                            onClick={() => {
                              if (localStorage.getItem("roles") === "patient")
                                navigate(`/prescription?id=${report.reportId}`);
                              else
                                navigate(`/doctor-prescription?id=${report.reportId}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserPrescription;