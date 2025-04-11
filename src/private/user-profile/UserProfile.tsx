import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Calendar, ClipboardList, Activity, User, AlertCircle, Home, MapPin, Ruler, Weight, Droplet, Heart } from "lucide-react";
import Skeleton from "@mui/material/Skeleton";
import { ToastAction } from "@radix-ui/react-toast";

// Define enum types for better type safety
const AllergiesEnum = z.enum(["Yes", "No"], {
  errorMap: (issue, ctx) => {
    if (issue.code === "invalid_enum_value") {
      return { message: "Choose appropriate option" };
    }
    return { message: ctx.defaultError }; 
  }
});
type AllergiesEnum = z.infer<typeof AllergiesEnum>;

const GenderEnum = z.enum(["Male", "Female", "Other"]);
type GenderEnum = z.infer<typeof GenderEnum>;

const BloodGroupEnum = z.enum([
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
], {
  errorMap: (issue, ctx) => {
    if (issue.code === "invalid_enum_value") {
      return { message: "Select appropriate blood group" };
    }
    return { message: ctx.defaultError }; 
  }
});
type BloodGroupEnum = z.infer<typeof BloodGroupEnum>;

const ResidenceTypeEnum = z.enum([
  "Kandoli Campus Hostel",
  "Bidholi Campus Hostel",
  "Guest House (Bidholi)",
  "Guest House (Kandoli)",
  "Day Scholar",
  "Other",
], {
  errorMap: (issue, ctx) => {
    if (issue.code === "invalid_enum_value") {
      return { message: "Select appropriate residence type" };
    }
    return { message: ctx.defaultError }; 
  }
});
type ResidenceTypeEnum = z.infer<typeof ResidenceTypeEnum>;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  patientId: z.string().min(1, "Email is required"),
  school: z.string().min(1, "School is required"),
  program: z.string().min(1, "Program is required"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  phoneNumber: z.string().min(1, "Contact Number is required"),
  emergencyContact: z
  .string()
  .regex(/^\d{10}$/, "Emergency contact must be a 10-digit number"),
  height: z
    .string()
    .regex(/^\d*(\.\d+)?$/, "Height must be a numeric value")
    .refine((value) => value.trim() !== "", { message: "Height is required" })
    .refine((value) => parseInt(value) >= 100 && parseInt(value) <= 300, {
      message: "Height must be between 100 and 300 cm",
    }),
  weight: z
    .string()
    .regex(/^\d*(\.\d+)?$/, "Weight must be a numeric value")
    .refine((value) => value.trim() !== "", { message: "Weight is required" })
    .refine((value) => parseInt(value) >= 1 && parseInt(value) <= 500, {
      message: "Weight must be between 1 and 500 kg",
    }),
  gender: GenderEnum,
  bloodGroup: BloodGroupEnum,
  medicalHistory: z.string().min(1, "Medical History is required"),
  familyMedicalHistory: z.string().min(1, "Family Medical History is required"),
  allergies: AllergiesEnum,
  currentAddress: z.string().min(1, "Current Address is required"),
  residenceType: ResidenceTypeEnum,
});

type FormValues = z.infer<typeof formSchema>;

type FormField = {
  label: string;
  name: keyof FormValues;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  type?: "select" | "textarea";
  options?: string[];
  required?: boolean;
};

const UserProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [img, setImg] = useState<string>("/default-user.jpg");
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(
          "https://uhs-backend.onrender.com/api/patient/getAllDetails",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;
        updateFormValues(data);
        setImg(`https://uhs-backend.onrender.com/${data.imageUrl}`);
      } catch (error: any) {
        if (error.response?.status === 404) {
          try {
            const resBackup = await axios.get(
              "https://uhs-backend.onrender.com/api/patient/",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const dataBackup = resBackup.data;
            updateFormValues(dataBackup);
            setImg(`https://uhs-backend.onrender.com/${dataBackup.imageUrl}`);
            toast({
              title: "Required Information",
              description: "Please complete your profile by filling all required fields",
            });
          } catch (backupError) {
            console.error("Backup fetch error:", backupError);
            toast({
              title: "Error",
              description: "Failed to fetch user details",
              variant: "destructive",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
          }
        } else {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to fetch user details",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const updateFormValues = (data: any) => {
      const dob = new Date(data.dateOfBirth).toLocaleDateString("en-GB");
      setValue("name", data.name || "");
      setValue("patientId", data.email || "");
      setValue("school", data.school || "");
      setValue("program", data.program || "");
      setValue("dateOfBirth", dob || "");
      setValue("phoneNumber", data.phoneNumber || "");
      setValue("emergencyContact", data.emergencyContact || "");
      setValue("height", data.height !== undefined && data.height !== null ? String(data.height) : "");
      setValue("weight", data.weight !== undefined && data.weight !== null ? String(data.weight) : "");
      setValue("gender", data.gender || "");
      setValue("bloodGroup", data.bloodGroup || "");
      setValue("medicalHistory", data.medicalHistory || "");
      setValue("familyMedicalHistory", data.familyMedicalHistory || "");
      setValue("allergies", data.allergies as AllergiesEnum);
      setValue("currentAddress", data.currentAddress || "");
      setValue("residenceType", data.residenceType as ResidenceTypeEnum);
    };

    fetchUserDetails();
  }, [navigate, setValue, toast]);

  const onSubmit = async (data: FormValues) => {
    const token = localStorage.getItem("token");
  
    try {
      // First update the medical & address info
      await axios.put(
        "https://uhs-backend.onrender.com/api/patient/update",
        {
          currentAddress: data.currentAddress,
          medicalHistory: data.medicalHistory,
          familyMedicalHistory: data.familyMedicalHistory,
          allergies: data.allergies,
          height: data.height === "" ? null : data.height,
          weight: data.weight === "" ? null : data.weight,
          residenceType: data.residenceType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Then update emergency contact separately
      await axios.put(
        "https://uhs-backend.onrender.com/api/patient/updateEmergencyContact",
        {
          emergencyContact: data.emergencyContact,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setTimeout(() => navigate("/patient-dashboard"), 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };
  

  const handleCancel = () => navigate("/patient-dashboard");

  const formFields: FormField[] = [
    { label: "Name", name: "name", icon: User, disabled: true },
    { label: "Email", name: "patientId", icon: ClipboardList, disabled: true },
    { label: "School", name: "school", icon: ClipboardList, disabled: true },
    { label: "Program", name: "program", icon: Activity, disabled: true },
    { label: "Date of Birth", name: "dateOfBirth", icon: Calendar, disabled: true },
    { label: "Contact Number", name: "phoneNumber", icon: AlertCircle, disabled: true },
    { label: "Height (cm)", name: "height", icon: Ruler, required: true },
    { label: "Weight (kg)", name: "weight", icon: Weight, required: true },
    { label: "Gender", name: "gender", icon: User, disabled: true },
    { label: "Blood Group", name: "bloodGroup", icon: Droplet, type:"select", options:BloodGroupEnum.options, required: true },
    { 
      label: "Residence Type", 
      name: "residenceType", 
      icon: Home,
      type: "select",
      options: ResidenceTypeEnum.options,
      required: true
    },
    { 
      label: "Allergies", 
      name: "allergies", 
      icon: AlertCircle,
      type: "select",
      options: AllergiesEnum.options,
      required: true
    },
    { label: "Emergency Contact", name: "emergencyContact", icon: AlertCircle },
    { label: "Current Address", name: "currentAddress", icon: MapPin, type: "textarea", required: true },
    { label: "Medical History", name: "medicalHistory", icon: Heart, type: "textarea", required: true },
    { label: "Family Medical History", name: "familyMedicalHistory", icon: Heart, type: "textarea", required: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0">
              {loading ? (
                <Skeleton variant="circular" width={112} height={112} />
              ) : (
                <>
                  <img
                    src={img || "/default-user.jpg"}
                    alt="Profile"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full shadow-md">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </>
              )}
            </div>
            <div className="text-center md:text-left space-y-2">
              {loading ? (
                <>
                  <Skeleton variant="text" width={240} height={36} className="mx-auto md:mx-0" />
                  <Skeleton variant="text" width={200} height={24} className="mx-auto md:mx-0" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {watch("name")}
                  </h1>
                  <p className="text-gray-600 text-lg flex items-center justify-center md:justify-start gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    {watch("patientId")}
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Personal Details Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.slice(0, 6).map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <field.icon className="h-4 w-4 text-gray-500" />
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        {...register(field.name)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                          errors[field.name] ? "border-red-500" : "border-gray-300"
                        } ${field.disabled ? "cursor-not-allowed opacity-70" : ""}`}
                        disabled={loading || field.disabled}
                      />
                      {errors[field.name] && (
                        <p className="text-sm text-red-600 mt-1 flex items-start gap-1">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{errors[field.name]?.message as string}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Information Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-600" />
                  Medical Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.slice(6, 12).map((field) => (
  <div key={field.name} className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      <field.icon className="h-4 w-4 text-gray-500" />
      {field.label}
      {field.required && <span className="text-red-500">*</span>}
    </label>

    {/* If field is disabled, show read-only input */}
    {field.disabled ? (
      <input
        {...register(field.name)}
        className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed"
        disabled
      />
    ) : field.type === 'select' ? (
      <>
        <select
          {...register(field.name)}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
            errors[field.name] ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors[field.name] && (
          <p className="text-sm text-red-600 mt-1 flex items-start gap-1">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{errors[field.name]?.message as string}</span>
          </p>
        )}
      </>
    ) : (
      <input
        {...register(field.name)}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
          errors[field.name] ? "border-red-500" : "border-gray-300"
        }`}
      />
    )}
  </div>
))}

                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-green-600" />
                  Residence Details
                </h2>
                <div className="space-y-6">
                  {formFields.slice(12).map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <field.icon className="h-4 w-4 text-gray-500" />
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <>
                          <textarea
                            {...register(field.name)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                              errors[field.name] ? "border-red-500" : "border-gray-300"
                            }`}
                            rows={4}
                          />
                          {errors[field.name] && (
                            <p className="text-sm text-red-600 mt-1 flex items-start gap-1">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{errors[field.name]?.message as string}</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <input
                          {...register(field.name)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                            errors[field.name] ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Activity className="h-4 w-4 animate-pulse" />
                        Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;