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
import "./SignIn.scss";
import Shared from "@/Shared";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API_URLS = {
  patient: "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/auth/patient/signin",
  doctor: "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/auth/doctor/signin",
  nursing_assistant: "http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/auth/ad/signin",
};

const DASHBOARD_ROUTES = {
  patient: "/patient-dashboard",
  doctor: "/doctor-dashboard",
  nursing_assistant: "/ad-dashboard",
};

const ROLES = [
  { value: "doctor", label: "Doctor" },
  { value: "patient", label: "Patient" },
  { value: "nursing_assistant", label: "Nursing Assistant" },
];

const SignIn = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string>("patient");
  const [location, setLocation] = useState<{
    latitude: string;
    longitude: string;
  }>({
    latitude: "-1",
    longitude: "-1",
  });
  const [locations, setLocations] = useState<
    Array<{ locationName: string; latitude: string; longitude: string }>
  >([]);
  const [passRole, setPassRole] = useState<string>("patient");
  const [process, setProcess] = useState<string>("Submit");

  // const getRoleDisplayName = (role: string) => {
  //   const roleMapping: { [key: string]: string } = {
  //     doctor: "Doctor",
  //     patient: "Patient",
  //     assistant_doctor: "Nursing Assistant",
  //   };
  //   return roleMapping[role] || role.replace("_", " ");
  // };

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { id, value } = e.target;
    setInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleChangePass: ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const selectedRole = e.target.value;
    setPassRole(selectedRole);
  };

  const handleRoleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
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
    }
  };

  const handlePassChange = async (data: any) => {
    data.preventDefault();

    setProcess("Loading...");
    const email = data.target.email.value;
    const emailSent =
      email.substring(0, email.indexOf("@")) +
      email.substring(email.indexOf("@")).replaceAll(".", ",");
    try {
      const response = await axios.get(
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/auth/passwordChangeRequest?email=${emailSent}&role=${passRole}`
      );

      if (response.status === 200) {
        setProcess("Submit");
        return toast({
          variant: "default",
          title: "Request Successfull",
          description: response.data,
        });
      } else {
        setProcess("Submit");
        return toast({
          variant: "destructive",
          title: "Request Unsuccessfull",
          description: response.data.message,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (err: any) {
      setProcess("Submit");
      return toast({
        variant: "destructive",
        title: "Request Unsuccessfull",
        description: err.response.data.message,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

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
    const dashboardRoute =
      DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES];

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

      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem(
        "roles",
        roles[0].replace("ROLE_", "").toLowerCase()
      );
      localStorage.setItem("longitude", location.longitude);
      localStorage.setItem("latitude", location.latitude);

      toast({
        variant: "default",
        title: "Login Successful",
        description: `Welcome back, ${role.replace("_", " ")}!`,
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

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const resp = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/location/");
        if (resp.status === 200) {
          const data = resp.data;
          setLocations(data);
        } else {
          toast({
            variant: "destructive",
            title: "Fetch Error",
            description: resp.data.message,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Error in fetching locations. Please try again.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    };
    fetchLocations();
  }, []);

  return (
    <>
      <Toaster />
      <div className="sign-container">
        <div className="sign-container__left"></div>
        <div className="sign-container__right">
          <div className="sign-container__right-content">
            <img src="/upes-logo.jpg" alt="UPES Logo" />
            <h1 className="text-[2.1rem] font-medium pb-4 whitespace-nowrap">
              Welcome to UHS Portal
            </h1>
            <div className="sign-container__right-header">
              <p className="font-medium pb-1">Login as:</p>
              <div className="flex w-full pb-4">
                {ROLES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center whitespace-nowrap ${
                      value === "doctor"
                        ? "justify-start"
                        : value === "nursing_assistant"
                        ? "justify-end"
                        : "justify-center"
                    } w-full`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={handleRoleChange}
                      className="mr-2"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <h1>
                <span className="capitalize">{role.replace("_", " ")}</span>{" "}
                Sign in
              </h1>
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
              <div>
                <Label>Location</Label>
                <Select onValueChange={handleLocationChange}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    <SelectGroup className="h-[4rem] overflow-y-scroll">
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
            </form>

            <div className="gap-2 flex flex-col w-full">
              <Button className="sign-in-btn" onClick={handleSignIn}>
                Sign In
              </Button>

              {role === "patient" && (
                <div className="flex flex-col items-center">
                  <div className="flex w-full justify-center items-center">
                    <span className="w-[40%] flex items-center justify-center whitespace-nowrap">
                      Need an account?&nbsp;&nbsp;
                      <Link to="/register" className="text-blue-500">
                        Register
                      </Link>
                    </span>
                  </div>
                </div>
              )}
              <Dialog>
                <DialogTrigger>
                  <span className="text-blue-500">Forgot Password?</span>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="font-medium text-center">
                    Forgot Password
                  </DialogTitle>
                  <DialogDescription>
                    <label className="font-medium text-black">You are:</label>
                    <div className="flex w-full pb-4">
                      {ROLES.map(({ value, label }) => (
                        <label
                          key={value}
                          className={`flex items-center text-black whitespace-nowrap ${
                            value === "doctor"
                              ? "justify-start"
                              : value === "nursing_assistant"
                              ? "justify-end"
                              : "justify-center"
                          } w-full`}
                        >
                          <input
                            type="radio"
                            name="passRole"
                            value={value}
                            checked={passRole === value}
                            onChange={handleRoleChangePass}
                            className="mr-2"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    <form onSubmit={handlePassChange}>
                      <div className="form-group">
                        <label
                          htmlFor="Forgot Email"
                          className="text-black font-medium"
                        >
                          Enter your email ID:
                        </label>
                        <input name="email" type="email" />
                      </div>
                      <button
                        type={process === "Submit" ? "submit" : "button"}
                        className="submit-button"
                      >
                        {process}
                      </button>
                    </form>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
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

export default SignIn;
