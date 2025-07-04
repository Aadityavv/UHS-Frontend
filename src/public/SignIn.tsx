import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
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
import { ChangeEventHandler, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, EyeOff, MapPin, Stethoscope, User, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

const API_URLS = {
  patient: "https://uhs-backend.onrender.com/api/auth/patient/signin",
  doctor: "https://uhs-backend.onrender.com/api/auth/doctor/signin",
  nursing_assistant: "https://uhs-backend.onrender.com/api/auth/ad/signin",
};

const DASHBOARD_ROUTES = {
  patient: "/patient-dashboard",
  doctor: "/doctor-dashboard",
  nursing_assistant: "/ad-dashboard",
};

const ROLES = [
  { value: "doctor", label: "Doctor", icon: Stethoscope },
  { value: "patient", label: "User", icon: User },
  { value: "nursing_assistant", label: "Nursing Assistant", icon: HeartPulse },
];

const SignIn = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string>("patient");
  const [location, setLocation] = useState({

    latitude: "-1",
    longitude: "-1",
  });
  const [locations, setLocations] = useState<
    Array<{id:string; locationName: string; latitude: string; longitude: string }>
  >([]);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { id, value } = e.target;
    setInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleLocationChange = (value: string) => {
    const selectedLocation = locations.find(
      (loc) => loc.locationName === value
    );
    if (selectedLocation) {
      setLocation({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
      localStorage.setItem("locationId", selectedLocation.id);
    }
  };

  const [passRole, setPassRole] = useState<string>("patient");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetProcess, setResetProcess] = useState("Submit");


  const handleSignIn = async () => {
    if (location.latitude === "-1" || location.longitude === "-1") {
      return toast({
        variant: "destructive",
        title: "Location Missing",
        description: "Please select a location.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  
    const apiUrl = API_URLS[role as keyof typeof API_URLS];
  
    try {
      const headers =
        role === "nursing_assistant"
          ? {
              "X-Latitude": location.latitude,
              "X-Longitude": location.longitude,
            }
          : {};
  
      const response = await axios.post(apiUrl, input, { headers });
      const { token, email, roles } = response.data;

      console.log("Login response:", token);
  
      // Save tokens and info
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("roles", roles[0].replace("ROLE_", "").toLowerCase());
      localStorage.setItem("longitude", location.longitude);
      localStorage.setItem("latitude", location.latitude);
      
      localStorage.setItem("locationName", locations.find(loc => 
        loc.latitude === location.latitude && 
        loc.longitude === location.longitude
      )?.locationName || "Unknown Location");
      
  
      toast({
        variant: "default",
        title: "Login Successful",
        description: `Welcome back, ${role.replace("_", " ")}!`,
      });
  
      if (role === "patient") {
        let userDetails = null;
  
        try {
          const profileRes = await axios.get(
            "https://uhs-backend.onrender.com/api/patient/getAllDetails",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
  
          userDetails = profileRes.data;
        } catch (error: any) {
          // ✅ Gracefully handle 404 (profile not found)
          if (error.response?.status === 404) {
            userDetails = null;
          } else {
            return toast({
              variant: "destructive",
              title: "Error fetching profile",
              description: error.response?.data?.message || "An error occurred while fetching profile",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
          }
        }
  
        // ✅ Profile check
        const incompleteProfile =
          !userDetails ||
          !userDetails.height ||
          !userDetails.weight ||
          !userDetails.medicalHistory ||
          !userDetails.familyMedicalHistory ||
          !userDetails.currentAddress ||
          !userDetails.residenceType ||
          !userDetails.allergies;
  
        if (incompleteProfile) {
          setTimeout(() => navigate("/patient-profile"), 1000);
        } else {
          setTimeout(() => navigate("/patient-dashboard"), 1000);
        }
      } else {
        const dashboardRoute = DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES];
        setTimeout(() => navigate(dashboardRoute), 1000);
      }
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!recoveryEmail) {
      return toast({
        variant: "destructive",
        title: "Missing Email",
        description: "Please enter your registered email.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  
    setResetProcess("Loading...");
  
    const formattedEmail =
      recoveryEmail.substring(0, recoveryEmail.indexOf("@")) +
      recoveryEmail.substring(recoveryEmail.indexOf("@")).replace(/\./g, ",")

  
    try {
      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/auth/passwordChangeRequest?email=${formattedEmail}&role=${passRole}`
      );
  
      if (response.status === 200) {
        toast({
          variant: "default",
          title: "Reset Link Sent",
          description: response.data,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Request Unsuccessful",
          description: response.data.message,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.response?.data?.message || "Something went wrong",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setResetProcess("Submit");
    }
  };
  
  

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const resp = await axios.get("https://uhs-backend.onrender.com/api/location");
      
        const locations: Array<any> = resp.data;
      
        if (resp.status === 200 && locations && locations.length > 0) {
          const formattedLocations = locations.map((loc: any) => ({
            id: loc.locId.toString(),
            locationName: loc.locationName,
            latitude: loc.latitude.toString(),
            longitude: loc.longitude.toString()
          }));
      
          setLocations(formattedLocations);
        } else {
          throw new Error("No locations found");
        }
      } catch (err) {
        console.error("Full Axios Error:", err);
      
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Using default locations due to error fetching data.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
      
  };
  
  fetchLocations();
  }, []);
  
  

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
            UHS Portal
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
                UHS Portal
              </h2>
              <p className="text-gray-600 mt-2 text-sm font-medium">
                UPES Health Services
              </p>
            </motion.div>

            <motion.div
              className="flex justify-center gap-4 mt-4 ml-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: Stethoscope, label: "Medical Experts", color: "text-indigo-600" },
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
        <div className="lg:hidden mb-4"></div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                <p className="text-gray-600 text-sm mt-1">Access your health services</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <motion.div
                    key={value}
                    whileHover={{ scale: 1.02 }}
                    className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-all ${
                      role === value
                        ? "bg-indigo-50 border border-indigo-200"
                        : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                    }`}
                    onClick={() => setRole(value)}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        role === value ? "text-indigo-600" : "text-gray-500"
                      } mb-1`}
                    />
                    <span className={`text-xs font-medium ${
                      role === value ? "text-indigo-700" : "text-gray-700"
                    }`}>
                      {label}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-gray-700 text-sm">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="name.SapID@upes.ac.in"
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

                <div>
                  <Label className="text-gray-700 text-sm">Campus</Label>
                  <Select onValueChange={handleLocationChange}>
                    <SelectTrigger className="mt-1 h-9 rounded-lg text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <SelectValue placeholder="Select location" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-lg text-sm">
                      <SelectGroup>
                        {locations.map((loc) => (
                          <SelectItem
                            key={loc.locationName}
                            value={loc.locationName}
                          >
                            {loc.locationName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSignIn}
                  className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm"
                >
                  Sign In
                </Button>
              </div>
            </div>

            <div className="text-center space-y-2">
            <p className={`text-sm text-gray-600 transition-opacity duration-300 ${role === "patient" ? "opacity-100" : "opacity-0 pointer-events-none select-none"}`}>
  New User?{" "}
  <Link
    to="/register"
    className="text-indigo-600 hover:underline font-medium"
  >
    Create account
  </Link>
</p>

              <Dialog>
  <DialogTrigger asChild>
    <button className="text-sm text-indigo-600 hover:underline font-medium">
      Forgot password?
    </button>
  </DialogTrigger>
  <DialogContent className="rounded-lg">
    <DialogTitle className="text-lg">Password Recovery</DialogTitle>
    <DialogDescription>
      <form className="space-y-3" onSubmit={handlePasswordReset}>
        <div>
          <Label className="text-sm">Account Type</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {ROLES.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={passRole === value ? "default" : "outline"}
                onClick={() => setPassRole(value)}
                className="h-8 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm">Registered Email</Label>
          <Input
            type="email"
            placeholder="Enter email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            className="mt-1 h-8 text-sm"
          />
        </div>

        <Button
          type={resetProcess === "Submit" ? "submit" : "button"}
          disabled={resetProcess !== "Submit"}
          className="w-full h-8 text-sm"
        >
          {resetProcess}
        </Button>
      </form>
    </DialogDescription>
  </DialogContent>
</Dialog>

            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;