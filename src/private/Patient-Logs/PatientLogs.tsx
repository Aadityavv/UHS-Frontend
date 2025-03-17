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
import { Button } from "@/components/ui/button";

const PatientLogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedButton, setSelectedButton] = useState("Consultation");
  const [time, setTime] = useState<Date>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reports, setReports] = useState<
    Array<{
      reportId: string;
      patientName: string;
      token: string;
      date:string;
      time:string;
      location:string;
    }>
  >([]);
  const [adHocRep, setAdHocRep] = useState<
    Array<{
      patientName: string;
      medicineName: string;
      quantity: string;
      patientEmail: string;
      adName: string;
      adEmail: string;
      date: string;
      time: string;
    }>
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const fetchData = async (date?: string) => {
    try {
      if (selectedButton === "Consultation") {
        let apiUrl =
          "https://uhs-backend.onrender.com//api/AD/getAppointmentByDate";

        if (date) {
          apiUrl += `?date=${date}`;
        }

        const resp = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const response = resp.data;

        const formatData = response.map((rept: any) => ({
          reportId: rept.appointmentId,
          patientName: rept.PatientName,
          token: rept.token,
          date: rept.date,
          time: rept.time,
          location: rept.location
        }));

        setReports(formatData);
        if (formatData.length === 0) {
          toast({
            title: "No Appointment Found",
            description: "No Appointments are found for the current date",
          });
        }
      } else {
        let apiUrl = `https://uhs-backend.onrender.com//api/AD/getAdHocByDate?date=${date}`;

        const resp = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const response = resp.data;

        const formatData = response.map((rept: any) => ({
          patientName: rept.PatientName,
          medicineName: rept.MedicineName,
          quantity: rept.Quantity,
          patientEmail: rept.PatientEmail,
          adEmail: rept.ADEmail,
          adName: rept.ADName,
          date: rept.Date,
          time: rept.Time,
        }));
        setAdHocRep(formatData);
        if (formatData.length === 0) {
          toast({
            title: "No Ad-Hoc Treatments Found",
            description: "No Ad-Hoc treatments are found for the current date",
          });
        }
      }
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleDateFilter = () => {
    fetchData(selectedDate);
  };

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

  useEffect(() => {
    const fetchDefaultData = () => {
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
      fetchData(today);
    };

    fetchDefaultData();

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] flex flex-col items-center max-lg:h-[93svh]">
        <div className="w-full p-5 flex gap-4 items-center max-lg:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="date-picker" className="font-medium">
              Select Date:
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border rounded px-2 py-1"
            />
          </div>
          <Button
            type="submit"
            onClick={handleDateFilter}
            className="bg-gradient-to-r from-[#2061f5] to-[#13398f] w-24 text-white"
          >
            Submit
          </Button>
        </div>
        <div className="flex justify-center w-full max-lg:h-[80svh]">
          <div className="flex flex-col gap-4 w-1/2 justify-center items-center max-lg:hidden">
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
          <div className="w-full overflow-y-scroll p-5 pt-0">
            <div className="flex justify-center items-center gap-2 mb-4">
              <button
                onClick={() => setSelectedButton("Consultation")}
                className={`shadow-md px-4 py-2 rounded-md w-40 ${
                  selectedButton === "Consultation"
                    ? "bg-gradient-to-r from-[#2061f5] to-[#13398f] text-white"
                    : "bg-gray-100 text-black"
                }`}
              >
                Consultations
              </button>
              <button
                onClick={() => setSelectedButton("AdHoc")}
                className={`shadow-md px-4 py-2 rounded-md w-40 whitespace-nowrap ${
                  selectedButton === "AdHoc"
                    ? "bg-gradient-to-r from-[#2061f5] to-[#13398f] text-white"
                    : "bg-gray-100 text-black"
                }`}
              >
                Ad-Hoc Treatments
              </button>
            </div>
            {selectedButton === "Consultation" ? (
              <Table className="border">
                <TableCaption>A list of your recent reports</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[16.6%] text-center">
                      Token Number
                    </TableHead>
                    <TableHead className="w-[16.6%] text-center">
                      Patient Name
                    </TableHead>
                    <TableHead className="w-[16.6%] text-center">
                      Date                     
                    </TableHead>
                    <TableHead className="w-[16.6%] text-center">
                      Time
                    </TableHead>
                    <TableHead className="w-[16.6%] text-center">
                      Location
                    </TableHead>
                    <TableHead className="text-center whitespace-nowrap">
                      Download Report
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.reportId}>
                      <TableCell className="font-medium text-center">
                        {report.token}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.patientName}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.date}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.time}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.location}
                      </TableCell>

                      <TableCell className="text-center">
                        <a
                          onClick={() =>
                            navigate(
                              `/previous-prescription?id=${report.reportId}`
                            )
                          }
                          download
                        >
                          {Shared.Download}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table className="border">
                <TableCaption>A list of your recent reports</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Patient Name
                    </TableHead>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Patient Email
                    </TableHead>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Medicine Name
                    </TableHead>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Quantity
                    </TableHead>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Nursing Assistant Name
                    </TableHead>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Nursing Assistant Email
                    </TableHead>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Date
                    </TableHead>
                    <TableHead className="w-[12.5%] text-center whitespace-nowrap">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adHocRep.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-center">
                        {report.patientName}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.patientEmail}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.medicineName}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.quantity}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.adName}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.adEmail}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.date}
                      </TableCell>

                      <TableCell className="text-center">
                        {report.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientLogs;
