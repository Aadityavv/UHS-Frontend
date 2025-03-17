import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { ToastAction } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    doctorEmail: z.string().email("Invalid email address"),
    status: z.boolean(),
    gender: z
      .enum(["Male", "Female", "Other"])
      .refine((value) => value !== undefined, {
        message: "Please select a gender",
      }),
    designation: z
      .string()
      .min(3, "Designation must be at least 3 characters long")
      .max(50, "Designation must be at most 50 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
  });

const NewDoctor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      doctorEmail: "",
      gender: "",
      status: false,
      designation: "",
    },
  });

  const { isValid } = form.formState;

  const onSubmit = async (data: any) => {
    if (isValid) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin-portal");
          return;
        }
        const payload = { ...data, status: false };
        await axios.post(
          "https://uhs-backend.onrender.com//api/admin/doctor/signup",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast({
          title: "Registration Successful",
          description: "A verification email has been sent to your email.",
        });
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1000);
      } catch (error: any) {
        console.error("Error submitting form: ", error);
        toast({
          title: "Registration Failed",
          description: error?.response?.data?.message || "Registration failed",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    }
  };

  const handleCancel = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 lg:p-8"
      style={{ background: "linear-gradient(to right, #24186c, #530962)" }}
    >
      <Toaster />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl grid grid-cols-1 "
      >
        {/* Animated Branding Section */}
        {/* <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 relative overflow-hidden">
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
          </div>
        </div> */}

        {/* Form Section */}
        <div className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">New Doctor Registration</h1>
                <p className="text-gray-600 text-sm mt-1">Register a new doctor</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-gray-700 text-sm">Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter name"
                    {...form.register("name")}
                    className="mt-1 h-9 rounded-lg text-sm"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    {...form.register("doctorEmail")}
                    className="mt-1 h-9 rounded-lg text-sm"
                  />
                  {form.formState.errors.doctorEmail && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.doctorEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      {...form.register("password")}
                      className="h-9 rounded-lg text-sm pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      {...form.register("confirmPassword")}
                      className="h-9 rounded-lg text-sm pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Designation</Label>
                  <Input
                    type="text"
                    placeholder="Enter designation"
                    {...form.register("designation")}
                    className="mt-1 h-9 rounded-lg text-sm"
                  />
                  {form.formState.errors.designation && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.designation.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Gender</Label>
                  <Select
                    {...form.register("gender")}
                    onValueChange={(value) => form.setValue("gender", value)}
                    value={form.watch("gender")}
                  >
                    <SelectTrigger className="mt-1 h-9 rounded-lg text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg text-sm">
                      <SelectGroup>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.gender.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 pt-5">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="secondary"
                  className="text-red-500 bg-white border border-red-500 w-[6rem]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  className="bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900 w-[6rem] text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewDoctor;