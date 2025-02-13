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

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = "";
        const role = localStorage.getItem("roles");

        if (role !== "patient") {
          const url = window.location.search;
          const email = url.substring(url.indexOf("?") + 4);
          const emailSent = email.substring(0,email.indexOf("@"))+email.substring(email.indexOf("@")).replace(".",",");
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
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast({
            title: "Error",
            description: error.response.data.message,
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        } else {
          toast({
            title: "Error",
            description:
              "An error occurred while fetching reports. Please try again.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

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
      <div className="h-[84svh] flex justify-center max-lg:h-[93svh]">
        <div className="flex flex-col gap-4 w-3/4 justify-center items-center max-lg:hidden">
          <div className="flex items-center justify-center p-5 max-lg:p-5 bg-gray-800 rounded-lg shadow-lg my-5">
            <p className="text-4xl font-bold text-white drop-shadow-lg">
              {formatTime(time)}
            </p>
          </div>
          <div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border bg-white shadow-lg max-lg:hidden"
            />
          </div>
        </div>
        <div className="w-[100%] overflow-y-scroll p-5">
          <Table className="border">
            <TableCaption>A list of your recent reports</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[33%] text-center">
                  Token Number
                </TableHead>
                <TableHead className="w-[33%] text-center">Date</TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  View Report
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.reportId}>
                  {/* Report Id */}
                  <TableCell className="font-medium text-center">
                    {report.token}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-center">{report.date}</TableCell>

                  {/* Download Report */}
                  <TableCell className="text-center hover:cursor-pointer">
                    <a
                      onClick={() => {
                        if (localStorage.getItem("roles") === "patient")
                          navigate(`/prescription?id=${report.reportId}`);
                        else
                          navigate(
                            `/doctor-prescription?id=${report.reportId}`
                          );
                      }}
                      download
                    >
                      {Shared.Eye}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default UserPrescription;
