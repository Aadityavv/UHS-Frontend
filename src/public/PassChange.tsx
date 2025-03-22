import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const PassChange = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [input, setInput] = useState({ newPass: "", repeatPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { id, value } = e.target;
    setInput((prev) => ({ ...prev, [id]: value }));
  };

  const handlePassChange = async () => {
    const code = new URLSearchParams(window.location.search).get("code");
    const role = new URLSearchParams(window.location.search).get("role");

    if (!(code && role)) {
      toast({
        variant: "destructive",
        title: "Invalid Request",
        description: "The password change request is invalid.",
      });
      return;
    }

    if (input.newPass !== input.repeatPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Do Not Match",
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `https://uhs-backend.onrender.com/api/auth/passwordChange?code=${code}&role=${role}`,
        input
      );

      if (response.status === 200) {
        toast({
          variant: "default",
          title: "Password Changed Successfully",
          description: response.data,
        });

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Password Change Failed",
          description: response.data.message,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-900 px-4">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl max-w-md w-full border border-white/20"
      >
        <div className="flex justify-center mb-6">
          <img
            src="/upes-logo.jpg"
            alt="UPES Logo"
            className="w-24 h-24 object-contain bg-white p-2 rounded-full shadow-lg"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-white">
          Reset Your Password
        </h2>
        <p className="text-center text-sm text-gray-300 mb-6">
          Enter your new password below
        </p>

        <div className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <Label htmlFor="newPass" className="text-white text-sm">
              New Password
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              id="newPass"
              placeholder="New Password"
              value={input.newPass}
              onChange={onInputChange}
              className="mt-1 h-10 pr-10 bg-white rounded-md text-black"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-8 text-gray-500 hover:text-indigo-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Repeat Password */}
          <div className="relative">
            <Label htmlFor="repeatPassword" className="text-white text-sm">
              Confirm Password
            </Label>
            <Input
              type={showRepeatPassword ? "text" : "password"}
              id="repeatPassword"
              placeholder="Confirm Password"
              value={input.repeatPassword}
              onChange={onInputChange}
              className="mt-1 h-10 pr-10 bg-white rounded-md text-black"
            />
            <button
              type="button"
              onClick={() => setShowRepeatPassword((prev) => !prev)}
              className="absolute right-3 top-8 text-gray-500 hover:text-indigo-500"
            >
              {showRepeatPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handlePassChange}
            disabled={loading}
            className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300"
          >
            {loading ? "Updating..." : "Submit"}
          </Button>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8">
          Energy Acres, Bidholi: +91-7500201816, +91-8171323285 | Knowledge Acres,
          Kandoli: +91-8171979021, +91-7060111775
        </div>
      </motion.div>
    </div>
  );
};

export default PassChange;
