import "./UserProfile.scss";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image } from "primereact/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import axios from "axios";

const formSchema = z.object({
  name: z.string(),
  patientId: z.string(),
  school: z.string(),
  program: z.string(),
  dateOfBirth: z.string(),
  emergencyContact: z.string(),
  height: z
    .string()
    .regex(/^\d*(\.\d+)?$/, "Height must be a numeric value")
    .refine((value) => value.trim() !== "", { message: "Required" })
    .refine((value) => parseInt(value) >= 100 && parseInt(value) <= 300, {
      message: "Height must be between 100 and 300 cm",
    }),

  weight: z
    .string()
    .regex(/^\d*(\.\d+)?$/, "Weight must be a numeric value")
    .refine((value) => value.trim() !== "", { message: "Required" })
    .refine((value) => parseInt(value) >= 1 && parseInt(value) <= 500, {
      message: "Weight must be between 1 and 500 kg",
    }),

  medicalHistory: z.string().refine((value) => value.trim() !== "", {
    message: "Required",
  }),

  familyMedicalHistory: z.string().refine((value) => value.trim() !== "", {
    message: "Required",
  }),

  allergies: z
    .enum(["Yes", "No"])
    .refine((value) => value.trim() !== "", { message: "Required" }),

  currentAddress: z.string().refine((value) => value.trim() !== "", {
    message: "Required",
  }),

  residenceType: z
    .enum([
      "Kandoli Campus Hostel",
      "Bidholi Campus Hostel",
      "Guest House (Bidholi)",
      "Guest House (Kandoli)",
      "Day Scholar",
      "Other",
    ])
    .refine((value) => value.trim() !== "", { message: "Required" }),
});

const UserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      patientId: "",
      school: "",
      program: "",
      dateOfBirth: "",
      emergencyContact: "",
      height: "",
      weight: "",
      gender: "",
      bloodGroup: "",
      medicalHistory: "",
      familyMedicalHistory: "",
      allergies: "",
      currentAddress: "",
      residenceType: "",
    },
  });
  const [img, setImg] = useState<string>("");

  useEffect(() => {
    const getUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const res = await axios.get(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/getAllDetails",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await res.data;
        form.setValue("name", data.name || "");
        form.setValue("patientId", data.email || "");
        form.setValue("school", data.school || "");
        form.setValue("program", data.program || "");

        const dob = new Date(data.dateOfBirth);
        const formattedDOB = dob.toLocaleDateString("en-GB");
        form.setValue("dateOfBirth", formattedDOB || "");

        form.setValue("emergencyContact", data.emergencyContact || "");
        form.setValue("height", `${data.height}` || "");
        form.setValue("weight", `${data.weight}` || "");
        form.setValue("gender", data.gender || "");
        form.setValue("bloodGroup", data.bloodGroup || "");
        form.setValue("medicalHistory", data.medicalHistory || "");
        form.setValue("familyMedicalHistory", data.familyMedicalHistory || "");
        form.setValue("allergies", data.allergies || "");
        form.setValue("currentAddress", data.currentAddress || "");
        form.setValue("residenceType", data.residenceType || "");

        setImg(data.imageUrl);
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          try {
            const resBackup = await axios.get(
              "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/",
              {
                headers: {
                  Authorization: "Bearer " + token,
                },
              }
            );

            const dataBackup = await resBackup.data;
            form.setValue("name", dataBackup.name || "");
            form.setValue("patientId", dataBackup.email || "");
            form.setValue("school", dataBackup.school || "");
            form.setValue("program", dataBackup.program || "");

            const dobBackup = new Date(dataBackup.dateOfBirth);
            const formattedDOBBackup = dobBackup.toLocaleDateString("en-GB");
            form.setValue("dateOfBirth", formattedDOBBackup || "");

            form.setValue(
              "emergencyContact",
              dataBackup.emergencyContact || ""
            );
            form.setValue("height", dataBackup.height || "");
            form.setValue("weight", dataBackup.weight || "");
            form.setValue("gender", dataBackup.gender || "");
            form.setValue("bloodGroup", dataBackup.bloodGroup || "");
            form.setValue("medicalHistory", dataBackup.medicalHistory || "");
            form.setValue(
              "familyMedicalHistory",
              dataBackup.familyMedicalHistory || ""
            );
            form.setValue("allergies", dataBackup.allergies || "");
            form.setValue("currentAddress", dataBackup.currentAddress || "");
            form.setValue("residenceType", dataBackup.residenceType || "");

            setImg(dataBackup.imageUrl);
          } catch (backupError) {
            console.log("Error during backup request:", backupError);
            toast({
              title: "Error",
              description:
                error.response.data.message || "Something went wrong!",
              variant: "destructive",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
          }
          toast({
            title: "Required!",
            description:
              "Set Height, Weight, Family History, Medical History, Allergies, Address Type, and Current Address.",
          });
        } else {
          toast({
            title: "Error",
            description: error.response.data.message || "Something went wrong!",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      }
    };
    getUserDetails();
  }, []);

  const { isValid } = form.formState;
  const onSubmit = async (data: any) => {
    const height = data.height === "" ? null : data.height;
    const weight = data.weight === "" ? null : data.weight;

    if (isValid) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/patient/update",
          {
            currentAddress: data.currentAddress || "",
            medicalHistory: data.medicalHistory || "",
            familyMedicalHistory: data.familyMedicalHistory || "",
            allergies: data.allergies || "",
            height: height,
            weight: weight,
            residenceType: data.residenceType || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Form Data Submitted: ", response.data);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setTimeout(() => {
          navigate("/patient-dashboard");
        }, 1000);
      } catch (error: any) {
        console.error("Error submitting form:", error);
        toast({
          title: "Error",
          description:
            error.response.data.message || "Failed to update profile.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } else {
      console.error("Form Validation Errors:", form.formState.errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
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
      <div className="profile-container__content">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-[100%]">
            <div className="profile-container__body">
              <div className="image-container">
                <Image
                  src={
                    img != null
                      ? `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/${img}`
                      : "/default-user.jpg"
                  }
                  preview
                  style={{
                    border: "1.5px solid black",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  className="shadow-xl"
                />
              </div>
              <div className="patient-details">
                <div className="patient-details__top">
                  <div className="patient-details__left">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="school"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>School</FormLabel>
                          <FormControl>
                            <Input placeholder="School" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Date of Birth"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter height" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Input placeholder="Gender" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="residenceType"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Residence Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue(field.name, value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select residence type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup className="h-[8rem] overflow-y-scroll">
                                <SelectItem value="Bidholi Campus Hostel">
                                  Bidholi Campus Hostel
                                </SelectItem>
                                <SelectItem value="Kandoli Campus Hostel">
                                  Kandoli Campus Hostel
                                </SelectItem>
                                <SelectItem value="Day Scholar">
                                  Day Scholar
                                </SelectItem>
                                <SelectItem value="Guest House (Bidholi)">
                                  Guest House (Bidholi)
                                </SelectItem>
                                <SelectItem value="Guest House (Kandoli)">
                                  Guest House (Kandoli)
                                </SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentAddress"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Current Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your current address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Allergies</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue(field.name, value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select allergies status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup className="overflow-y-scroll">
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="patient-details__right">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Id</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Patient Id"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Program</FormLabel>
                          <FormControl>
                            <Input placeholder="Program" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Parent Contact Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter emergency contact"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter weight" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Blood Group</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Blood group"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="medicalHistory"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Medical History</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter medical history"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="familyMedicalHistory"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Family Medical History</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter family medical history"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="profile-container__footer">
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                className="back-btn"
              >
                Cancel
              </Button>
              <Button type="submit" className="save-btn text-white">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default UserProfile;
