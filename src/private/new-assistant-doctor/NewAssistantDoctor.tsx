import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { ToastAction } from "@/components/ui/toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Zod schema for form validation
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
    email: z.string().email("Invalid email address")
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const NewAssistantDoctor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Added setter

  // React Hook Form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      email: ""
    },
  });

  const { isValid } = form.formState;

  // Form submission handler
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
          "http://localhost:8081/api/admin/AD/signup",
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

  // Cancel button handler
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
        className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl grid grid-cols-1"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                New Assistant Doctor Registration
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Register a new assistant doctor
              </p>
            </div>

            <div className="space-y-3">
              {/* Name Input */}
              <Label className="text-gray-700 text-sm">Name</Label>
              <Input
                type="text"
                placeholder="Enter name"
                {...form.register("name")}
                className="mt-1 h-9 rounded-lg text-sm"
              />
              {form.formState.errors.name && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.name.message}
                </span>
              )}

              {/* Email Input */}
              <Label className="text-gray-700 text-sm">Email</Label>
              <Input
                type="email"
                placeholder="Enter email"
                {...form.register("email")}
                className="mt-1 h-9 rounded-lg text-sm"
              />
              {form.formState.errors.email && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.email.message}
                </span>
              )}

              {/* Password Input */}
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
                <span className="text-red-500 text-xs">
                  {form.formState.errors.password.message}
                </span>
              )}

              {/* Confirm Password Input */}
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
                <span className="text-red-500 text-xs">
                  {form.formState.errors.confirmPassword.message}
                </span>
              )}

              {/* Designation Input */}
              {/* <Label className="text-gray-700 text-sm">Designation</Label>
              <Input
                type="text"
                placeholder="Enter designation"
                {...form.register("designation")}
                className="mt-1 h-9 rounded-lg text-sm"
              />
              {form.formState.errors.designation && (
                <span className="text-red-500 text-xs">
                  {form.formState.errors.designation.message}
                </span>
              )} */}
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
                className="bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900 w-[6rem] text-white"
              >
                Submit
              </Button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewAssistantDoctor;