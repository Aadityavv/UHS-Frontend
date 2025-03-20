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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  patientId: z.string().min(1, "Email is required"),
  school: z.string().min(1, "School is required"),
  program: z.string().min(1, "Program is required"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  emergencyContact: z.string().min(1, "Emergency Contact is required"),
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
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  medicalHistory: z.string().min(1, "Medical History is required"),
  familyMedicalHistory: z.string().min(1, "Family Medical History is required"),
  allergies: z.enum(["Yes", "No"], { required_error: "Allergies is required" }),
  currentAddress: z.string().min(1, "Current Address is required"),
  residenceType: z.enum([
    "Kandoli Campus Hostel",
    "Bidholi Campus Hostel",
    "Guest House (Bidholi)",
    "Guest House (Kandoli)",
    "Day Scholar",
    "Other",
  ], { required_error: "Residence Type is required" }),
});

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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
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
          "https://uhs-backend.onrender.com//api/patient/getAllDetails",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;
        updateFormValues(data);
        setImg(`https://uhs-backend.onrender.com//api//${data.imageUrl}`);
      } catch (error: any) {
        if (error.response?.status === 404) {
          try {
            const resBackup = await axios.get(
              "https://uhs-backend.onrender.com//api/patient/",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const dataBackup = resBackup.data;
            updateFormValues(dataBackup);
            setImg(`https://uhs-backend.onrender.com//api//${dataBackup.imageUrl}`);
            toast({
              title: "Required!",
              description: "Set Height, Weight, Family History, Medical History, Allergies, Address Type, and Current Address.",
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
      setValue("emergencyContact", data.emergencyContact || "");
      setValue("height", data.height ?? "");
      setValue("weight", data.weight ?? "");

      setValue("gender", data.gender || "");
      setValue("bloodGroup", data.bloodGroup || "");
      setValue("medicalHistory", data.medicalHistory || "");
      setValue("familyMedicalHistory", data.familyMedicalHistory || "");
      setValue("allergies", data.allergies || "");
      setValue("currentAddress", data.currentAddress || "");
      setValue("residenceType", data.residenceType || "");
    };

    fetchUserDetails();
  }, [navigate, setValue, toast]);

  const onSubmit = async (data: any) => {
    const height = data.height === "" ? null : data.height;
    const weight = data.weight === "" ? null : data.weight;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://uhs-backend.onrender.com//api/patient/update",
        {
          currentAddress: data.currentAddress,
          medicalHistory: data.medicalHistory,
          familyMedicalHistory: data.familyMedicalHistory,
          allergies: data.allergies,
          height: height,
          weight: weight,
          residenceType: data.residenceType,
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
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleCancel = () => navigate("/patient-dashboard");

  const formFields = [
    { label: "Name", name: "name", icon: User, disabled: true },
    { label: "Email", name: "patientId", icon: ClipboardList, disabled: true },
    { label: "School", name: "school", icon: ClipboardList, disabled: true },
    { label: "Program", name: "program", icon: Activity, disabled: true },
    { label: "Date of Birth", name: "dateOfBirth", icon: Calendar, disabled: true },
    { label: "Emergency Contact", name: "emergencyContact", icon: AlertCircle, disabled: true },
    { label: "Height (cm)", name: "height", icon: Ruler },
    { label: "Weight (kg)", name: "weight", icon: Weight },
    { label: "Gender", name: "gender", icon: User, disabled: true },
    { label: "Blood Group", name: "bloodGroup", icon: Droplet, disabled: true },
    { 
      label: "Residence Type", 
      name: "residenceType", 
      icon: Home,
      type: "select",
      options: [
        "Kandoli Campus Hostel",
        "Bidholi Campus Hostel",
        "Guest House (Bidholi)",
        "Guest House (Kandoli)",
        "Day Scholar",
        "Other",
      ]
    },
    { 
      label: "Allergies", 
      name: "allergies", 
      icon: AlertCircle,
      type: "select",
      options: ["Yes", "No"]
    },
    { label: "Current Address", name: "currentAddress", icon: MapPin, type: "textarea" },
    { label: "Medical History", name: "medicalHistory", icon: Heart, type: "textarea" },
    { label: "Family Medical History", name: "familyMedicalHistory", icon: Heart, type: "textarea" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4 space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {loading ? (
                <div className="space-y-4">
                  <Skeleton variant="circular" width={96} height={96} className="mx-auto" />
                  <Skeleton variant="text" width={150} height={24} className="mx-auto" />
                  <Skeleton variant="text" width={200} height={16} className="mx-auto" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={img || "/default-user.jpg"}
                      // src="/default-user.jpg"
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-1.5 rounded-full">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    {watch("name")}
                  </h2>
                  <p className="text-sm text-gray-500">{watch("patientId")}</p>
                </div>
              )}
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={handleCancel}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <span className="text-indigo-700 font-medium">Go Back</span>
                <AlertCircle className="h-5 w-5 text-indigo-700" />
              </button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.map((field) => (
                    <div
                      key={field.name}
                      className={field.type === "textarea" ? "col-span-2" : ""}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        {field.type === "select" ? (
                          <select
                            {...register(field.name)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading || field.disabled}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            {...register(field.name)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                            rows={4}
                          />
                        ) : (
                          <input
                            type="text"
                            {...register(field.name)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading || field.disabled}
                          />
                        )}
                        {errors[field.name] && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors[field.name]?.message as string}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;