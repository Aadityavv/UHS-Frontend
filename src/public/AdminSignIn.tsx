import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminSignIn.scss";
import Shared from "@/Shared";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";

const AdminSignIn = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { id, value } = e.target;
    setInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignIn = async () => {
    const apiUrl = "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/auth/admin/signin";
    const dashboardRoute = "/admin-dashboard";

    try {
      const response = await axios.post(apiUrl, input);
      const { token, email, roles } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem(
        "roles",
        roles[0].replace("ROLE_", "").toLowerCase()
      );

      toast({
        variant: "default",
        title: "Login Successful",
        description: `Welcome back, Admin!`,
      });

      setTimeout(() => {
        navigate(dashboardRoute);
      }, 1000);
    } catch (error: any) {
      const message =
        error.response?.status === 401
          ? "Incorrect email or password. Please try again."
          : error.response?.data?.message || "An error occurred.";

      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: message,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  return (
    <>
      <Toaster />
      <div className="sign-container">
        <div className="sign-container__left"></div>
        <div className="sign-container__right">
          <div className="sign-container__right-content">
            <img src="/upes-logo.jpg" alt="UPES Logo" />
            <h1 className="text-2xl font-medium pb-3 whitespace-nowrap">
              Welcome to Infirmary Admin Portal
            </h1>
            <div className="sign-container__right-header">
              <h1>Admin Sign in</h1>
            </div>
            <form>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={input.email}
                  onChange={onInputChange}
                  className="bg-white text-black"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Password"
                    value={input.password}
                    onChange={onInputChange}
                    className="bg-white text-black pr-10"
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
              </div>
            </form>

            <div className="gap-5 flex flex-col w-full">
              <Button className="sign-in-btn" onClick={handleSignIn}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full border-t border-black bg-white text-black min-h-[8svh] max-lg:hidden">
        <b>Energy Acres, Bidholi : </b>&nbsp;+91-7500201816, +91-8171323285
        &nbsp; | &nbsp; <b>Knowledge Acres, Kandoli : </b>
        &nbsp;+91-8171979021, +91-7060111775
      </div>
    </>
  );
};

export default AdminSignIn;
