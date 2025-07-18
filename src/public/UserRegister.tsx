import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Eye, EyeOff, User, MapPin, HeartPulse, Mail, Lock, Phone, AlertCircle, Calendar, BookOpen, Droplet, Camera } from "lucide-react";
import { motion } from "framer-motion";

const schoolOptions = [
  "Guest",
  "Non_Academics",
  "SOCS",
  "SOB",
  "SOL",
  "SOHS",
  "SOAE",
  "SFL",
  "SOD",
  "SOLSM",
] as const;

const bloodGroup = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

const programOptions = {
  Non_Academics: ["Staff"],
  Guest: ["Guest"],
  SOCS: ["Faculty", "B.Tech", "M.Tech", "B.Sc", "BCA", "MCA"],
  SOB: ["Faculty", "MBA", "BBA", "B.Com(Hons)", "BBA-MBA", "B.Com-MBA(Hons)"],
  SOL: [
    "Faculty",
    "BA LL.B(Hons)",
    "BBA LL.B(Hons)",
    "B.COM LL.B(Hons)",
    "LL.B(Hons)",
    "LL.M",
  ],
  SOHS: ["Faculty", "B.Sc", "M.Sc", "B.Pharm", "B.Tech"],
  SOAE: ["Faculty", "B.Tech", "B.Sc(Hons)", "M.Tech.", "M.Sc"],
  SFL: ["Faculty", "B.A", "M.A"],
  SOD: ["Faculty", "B.Des", "M.Des"],
  SOLSM: ["Faculty", "B.Sc (H)", "BA", "BA(H)", "MA"],
};

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(30, "Name must be at most 30 characters long")
      .regex(
        /^[a-zA-Z0-9_ ]+$/,
        "Name can only contain letters, numbers, underscores, and spaces"
      ),
    sapID: z.string().min(8, "Invalid SapID").max(9, "Invalid SapId"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    email: z.string().email("Invalid email address"),
    school: z.enum(schoolOptions, {
      required_error: "Invalid school",
    }),
    program: z.string().min(1, "Invalid program"),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .refine(
        (dateString) => {
          const inputDate = new Date(dateString);
          const today = new Date();
          return inputDate <= today;
        },
        { message: "Date of birth cannot be in the future" }
      ),
    emergencyContact: z
      .string()
      .regex(/^[6-9][0-9]{9}$/, "Emergency contact must be a valid 10-digit Indian mobile number starting with 6-9"),
    phoneNumber: z
      .string()
      .regex(/^[6-9][0-9]{9}$/, "Phone number must be a valid 10-digit Indian mobile number starting with 6-9"),
    gender: z
      .enum(["Male", "Female", "Other"])
      .refine((value) => value !== undefined, {
        message: "Invalid gender",
      }),
    bloodGroup: z.enum(bloodGroup, {
      required_error: "Invalid blood group",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine(
    (data) => data.phoneNumber !== data.emergencyContact,
    {
      message: "Emergency contact cannot be the same as phone number",
      path: ["emergencyContact"], 
    }
  );

const UserRegister = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [bs64Img, setBs64Img] = useState<string | null>(null);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("Submit");

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: undefined,
      sapID: "",
      password: undefined,
      confirmPassword: undefined,
      email: undefined,
      school: undefined,
      program: undefined,
      dateOfBirth: undefined,
      emergencyContact: undefined,
      phoneNumber: undefined,
      gender: undefined,
      bloodGroup: undefined,
      img: undefined,
    },
  });
  const { isValid } = form.formState;

  const onSubmit = async (data: any) => {
    if (isValid) {
      try {
        const payload = {
          ...data,
          img: bs64Img,
        };
        setStatus("Loading...");
        await axios
          .post("https://uhs-backend.onrender.com/api/auth/patient/signup", payload)
          .then((res) => {
            setStatus("Submit");
            return res.data;
          });

        toast({
          title: "Registration Successful",
          description: "A verification email has been sent to your mail id.",
        });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch (error: any) {
        setStatus("Submit");
        console.error("Error submitting form: ", error);
        toast({
          title: "Registration Failed",
          description:
            error?.response?.data?.message || "Something went wrong.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } else {
      console.error("Form Validation Errors:", form.formState.errors);
      toast({
        title: "Validation Error",
        description: "Please fill in required details before submitting.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleSchoolChange = (school: keyof typeof programOptions) => {
    setAvailablePrograms(programOptions[school] || []);
    form.setValue("program", undefined);
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
  
    if (!file) return;
  
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 50 * 1024; // 25KB = 25 * 1024 bytes
  
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only JPG or PNG images are allowed.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      event.target.value = "";
      return;
    }
  
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Profile photo must be less than 25KB.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      event.target.value = "";
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      setBs64Img(reader.result as string);
      setUploadedImage(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };
  

  useEffect(() => {
    if (form.watch("school") === "Guest") {
      form.setValue("sapID", "000000000");
    }
  }, [form.watch("school")]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 lg:p-8"
      style={{ background: "linear-gradient(to right, #24186c, #530962)" }}
    >
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-[40%_60%] overflow-hidden z-10"
      >
        {/* Branding Panel */}
        <div className="hidden lg:flex flex-col bg-gradient-to-br from-indigo-900/80 to-purple-900/80 min-h-screen">
          <div className="sticky top-1/2 w-full" style={{ transform: 'translateY(-50%)' }}>
            <div className="flex flex-col items-center justify-center w-full">
              <motion.img
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120 }}
                src="/upes-logo.jpg"
                alt="UPES Logo"
                className="w-32 mx-auto bg-white rounded-2xl p-3 shadow-2xl mb-8 hover:rotate-3 transition-transform duration-300"
              />
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent mb-2 text-center drop-shadow-lg">
                UHS Portal
              </h2>
              <p className="text-gray-200 text-lg font-medium mb-8 text-center">UPES Health Services</p>
              <div className="flex flex-col gap-6 w-full items-center">
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 w-64 shadow-lg"
                >
                  <User className="h-6 w-6 text-indigo-200" />
                  <span className="text-indigo-100 font-semibold">Patient Registration</span>
                </motion.div>
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 w-64 shadow-lg"
                >
                  <HeartPulse className="h-6 w-6 text-pink-200" />
                  <span className="text-pink-100 font-semibold">24/7 Support</span>
                </motion.div>
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 w-64 shadow-lg"
                >
                  <MapPin className="h-6 w-6 text-purple-200" />
                  <span className="text-purple-100 font-semibold">Campus Wide</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        {/* Form Section */}
        <div className="p-6 lg:p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Patient Registration</h1>
              <p className="text-gray-600 text-base">Create your account to access health services</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input placeholder="Enter your name" {...field} className="pl-10" />
                              <User className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input placeholder="Enter your email" {...field} className="pl-10" />
                              <Mail className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                {...field}
                                className="pl-10 pr-10"
                              />
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2 text-gray-500 hover:text-indigo-600"
                                tabIndex={-1}
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Confirm Password */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                {...field}
                                className="pl-10 pr-10"
                              />
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-2 text-gray-500 hover:text-indigo-600"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Date of Birth */}
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Date of Birth</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                              {/* <Calendar className="absolute left-3 top-3 h-5 w-5 text-indigo-400" /> */}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Right Column */}
                  <div className="space-y-5">
                    {/* SapID */}
                    <FormField
                      control={form.control}
                      name="sapID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">SapID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your SapID"
                              {...field}
                              disabled={form.watch("school") === "Guest"}
                              className="pl-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* School */}
                    <FormField
                      control={form.control}
                      name="school"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">School</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleSchoolChange(value as keyof typeof programOptions);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select school" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {Object.keys(programOptions).map((school) => (
                                  <SelectItem key={school} value={school}>
                                    {school}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Program */}
                    <FormField
                      control={form.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Program</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!availablePrograms.length}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {availablePrograms.map((program) => (
                                  <SelectItem key={program} value={program}>
                                    {program}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input placeholder="Enter your phone number" {...field} className="pl-10" />
                              <Phone className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Emergency Contact */}
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Emergency Contact</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input placeholder="Enter emergency contact" {...field} className="pl-10" />
                              <AlertCircle className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Blood Group */}
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Blood Group</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {bloodGroup.map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Image Upload */}
                <div className="flex flex-col items-center space-y-3 mt-6">
                  <Label htmlFor="upload-image" className="text-sm text-gray-700">
                    Upload Profile Picture
                  </Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="upload-image"
                    className="hidden"
                  />
                  <label
                    htmlFor="upload-image"
                    className="cursor-pointer p-2 bg-gray-100 rounded-full hover:bg-indigo-100 border-4 border-indigo-200 shadow-lg transition-all duration-200 flex items-center justify-center"
                    style={{ width: 110, height: 110 }}
                  >
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-300 shadow-md hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <Camera className="h-24 w-24 text-indigo-400" />
                    )}
                  </label>
                  <span className="text-xs text-gray-500">(JPG/PNG, &lt; 25KB)</span>
                </div>
                {/* Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="secondary"
                    className="w-28 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-32 bg-indigo-600 hover:bg-indigo-700 font-bold text-lg flex items-center justify-center">
                    {status === "Loading..." ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : null}
                    {status === "Loading..." ? "Registering..." : status}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserRegister;