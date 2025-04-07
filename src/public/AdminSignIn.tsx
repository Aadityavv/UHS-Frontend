import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

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
    const apiUrl = "http://localhost:8081/api/auth/admin/signin";
    const dashboardRoute = "/admin-dashboard";

    try {
      const response = await axios.post(apiUrl, input);
      console.log("Login response:", response.data);
      const { token, email, roles } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("roles", roles[0].replace("ROLE_", "").toLowerCase());

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
        //action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
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
        className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-[45%_55%]"
      >
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/upes-logo.jpg"
              alt="UPES Logo"
              className="w-20 bg-white rounded-xl p-1 shadow-md"
            />
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              UHS Admin Portal
            </h2>
          </div>
        </div>

        {/* Animated Branding Section */}
        <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 relative overflow-hidden">
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
                UHS Admin Portal
              </h2>
              <p className="text-gray-600 mt-2 text-sm font-medium">
                Manage healthcare services with ease
              </p>
            </motion.div>

            <motion.div
              className="flex justify-center gap-4 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: Eye, label: "Monitor Systems", color: "text-indigo-600" },
                { icon: EyeOff, label: "Secure Access", color: "text-purple-600" },
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
          <div className="lg:hidden mb-4"></div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Sign In</h1>
                <p className="text-gray-600 text-sm mt-1">Access the admin dashboard</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-gray-700 text-sm">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Admin ID"
                    value={input.email}
                    onChange={onInputChange}
                    className="mt-1 h-9 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 text-sm">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      value={input.password}
                      onChange={onInputChange}
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
                </div>

                <Button
                  onClick={handleSignIn}
                  className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSignIn;