import "./UserAppointment.scss";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioButton } from "primereact/radiobutton";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const UserAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [lastAppointmentDate, setLastAppointmentDate] = useState<string | null>(null);

  const formSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
    followUp: z.enum(["Yes", "No"]),
    lastAppointmentDate: z.string().optional(),
    preferredDoctor: z.string().optional(),
    reasonForPreference: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastAppointmentDate: "",
      followUp: "No",
      preferredDoctor: undefined,
      reasonForPreference: undefined,
      reason: undefined,
    },
  });

  const [userDetails, setUserDetails] = useState({
    email: "",
    name: "",
    school: "",
    dateOfBirth: "",
    program: "",
    phoneNumber: "",
    emergencyContact: "",
    bloodGroup: "",
    imageUrl: "",
    password: "",
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        if (!localStorage.getItem("latitude") || !localStorage.getItem("longitude")) {
          toast({
            title: "Location Required",
            description: "Select a location to proceed.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          return;
        }

        const response = await axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/getAvailableDoctors",
          {
            headers: {
              Authorization: "Bearer " + token,
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
        console.error("Error fetching doctors: ", error);
        toast({
          title: "Error",
          description: "Could not fetch available doctors",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    };

    const getUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const res = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.data;
        setUserDetails(data);
      } catch (error: any) {
        console.log(error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error fetching patient details.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    };

    fetchDoctors();
    getUser();
  }, []);

  const fetchLastAppointmentDate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/lastAppointmentDate",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setLastAppointmentDate(response.data || null);
      form.setValue("lastAppointmentDate", response.data);
    } catch (error) {
      console.error("Error fetching last appointment date:", error);
      toast({
        title: "Error",
        description: "Couldn't get last appointment date",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const { isValid } = form.formState;
  const onSubmit = async (data: any) => {
    if (data.preferredDoctor && data.preferredDoctor !== "none" && !data.reasonForPreference?.trim()) {
      form.setError("reasonForPreference", {
        type: "manual",
        message: "Reason for preference is required when a preferred doctor is selected.",
      });
      return;
    }

    if (isValid) {
      try {
        const token = localStorage.getItem("token");
        const appointmentData = {
          reason: data.reason,
          isFollowUp: data.followUp === "Yes",
          preferredDoctor: data.preferredDoctor || null,
          reasonPrefDoctor: data.reasonForPreference || null,
        };

        if (!localStorage.getItem("latitude") || !localStorage.getItem("longitude")) {
          toast({
            title: "Location Required",
            description: "Select a location to proceed.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          return;
        }

        const response = await axios.post(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/submitAppointment",
          appointmentData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Latitude": localStorage.getItem("latitude"),
              "X-Longitude": localStorage.getItem("longitude"),
            },
          }
        );

        if (response.status === 200) {
          toast({
            title: "Success",
            description: "Appointment submitted successfully.",
          });
          setTimeout(() => {
            navigate("/patient-dashboard");
          }, 1000);
        } else {
          toast({
            title: "Error",
            description: "Failed to submit appointment",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "An error occurred.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Form is not valid",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleCancel = () => {
    navigate("/patient-dashboard");
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#D9E2EC] p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2E3A48]">Schedule an Appointment</h1>
          <p className="text-lg text-[#6C757D]">Fill out the form to book your appointment</p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex flex-col items-center">
              <img
                src={
                  userDetails.imageUrl
                    ? `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/${userDetails.imageUrl}`
                    : "/default-user.jpg"
                }
                alt="User Profile"
                className="w-32 h-32 rounded-full border-4 border-[#1F60C0] object-cover"
              />
              <h2 className="mt-4 text-2xl font-bold text-[#2E3A48]">{userDetails.name}</h2>
              <p className="text-[#6C757D]">{userDetails.email}</p>
              <div className="mt-4 space-y-2 text-center">
                <p className="text-[#6C757D]">
                  <span className="font-semibold">DOB:</span>{" "}
                  {new Date(userDetails.dateOfBirth).toLocaleDateString("en-GB")}
                </p>
                <p className="text-[#6C757D]">
                  <span className="font-semibold">Contact:</span> {userDetails.phoneNumber}
                </p>
                <p className="text-[#6C757D]">
                  <span className="font-semibold">Blood Group:</span> {userDetails.bloodGroup}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Appointment Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Reason for Appointment</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reason for appointment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="followUp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Is this a follow-up?</FormLabel>
                      <div className="flex gap-4">
                        <div className="flex items-center">
                          <RadioButton
                            inputId="followUpYes"
                            name="followUp"
                            value="Yes"
                            onChange={(e) => {
                              field.onChange(e.value);
                              fetchLastAppointmentDate();
                            }}
                            checked={field.value === "Yes"}
                          />
                          <label htmlFor="followUpYes" className="ml-2">
                            Yes
                          </label>
                        </div>
                        <div className="flex items-center">
                          <RadioButton
                            inputId="followUpNo"
                            name="followUp"
                            value="No"
                            onChange={(e) => {
                              field.onChange(e.value);
                              setLastAppointmentDate(null);
                            }}
                            checked={field.value === "No"}
                          />
                          <label htmlFor="followUpNo" className="ml-2">
                            No
                          </label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastAppointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Last appointment date?</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={lastAppointmentDate || ""}
                          disabled
                          placeholder="Last appointment date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredDoctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Preferred doctor (if any)</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                          disabled={doctors.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={doctors.length === 0 ? "No doctors available" : "Select a doctor"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="none">None</SelectItem>
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reasonForPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Reason for Preference?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter reason for preference (if preferred)"
                          {...field}
                          disabled={!form.getValues("preferredDoctor")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-4">
                  <Button type="button" onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserAppointment;