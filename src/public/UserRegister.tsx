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
import { Eye, EyeOff, User, MapPin, HeartPulse } from "lucide-react";
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
      .regex(/^\d{10}$/, "Emergency contact must be a 10-digit number"),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be a 10-digit number"),
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
  });

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

    if (file.size > 1048576) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 1MB.",
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-[40%_60%]"
      >
        {/* Animated Branding Section */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 relative overflow-hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-200/10 rounded-full blur-xl"
          />
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="absolute bottom-20 right-20 w-48 h-48 bg-purple-200/10 rounded-full blur-lg"
          />

          <div className="relative z-10 text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <img
                src="/upes-logo.jpg"
                alt="UPES Logo"
                className="w-28 mx-auto bg-white rounded-xl p-2 shadow-2xl hover:rotate-3 transition-transform duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                UHS Portal
              </h2>
              <p className="text-gray-600 mt-2 text-sm font-medium">
                University Health Services
              </p>
            </motion.div>

            <motion.div
              className="flex justify-center gap-4 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: User, label: "Patient Registration", color: "text-indigo-600" },
                { icon: HeartPulse, label: "24/7 Support", color: "text-purple-600" },
                { icon: MapPin, label: "Campus Wide", color: "text-pink-600" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  className="text-center"
                >
                  <item.icon className={`h-6 w-6 mb-2 ${item.color}`} />
                  <p className="text-xs text-gray-600">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Compact Form Section */}
        <div className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Patient Registration</h1>
                <p className="text-gray-600 text-sm mt-1">Create your account to access health services</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm password"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
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
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="sapID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SapID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your SapID"
                                {...field}
                                disabled={form.watch("school") === "Guest"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="school"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School</FormLabel>
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

                      <FormField
                        control={form.control}
                        name="program"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Program</FormLabel>
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

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter emergency contact" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
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
                  <div className="flex flex-col items-center space-y-3">
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
                      className="cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Upload</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      onClick={handleCancel}
                      variant="secondary"
                      className="w-24"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="w-24 bg-indigo-600 hover:bg-indigo-700">
                      {status}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserRegister;