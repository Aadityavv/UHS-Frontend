import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import axios from "axios";
import Shared from "@/Shared";
import { useState } from "react";
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
    email: z.string().email("Invalid email address"),
    designation: z
      .string()
      .min(3, "Designation must be at least 3 characters long")
      .max(50, "Designation must be at most 50 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
  });

const NewAssistantDoctor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: undefined,
      password: undefined,
      confirmPassword: undefined,
      email: undefined,
      designation: undefined,
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
        await axios.post("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/admin/AD/signup", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
    <>
      <Toaster />
      <div className="min-h-[84svh] p-6 max-lg:min-h-[93svh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? Shared.Eye : Shared.SlashEye}
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
                  <FormItem className="mt-3">
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
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                          aria-label="Toggle password visibility"
                        >
                          {showConfirmPassword ? Shared.Eye : Shared.SlashEye}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </form>
        </Form>
      </div>
    </>
  );
};

export default NewAssistantDoctor;
