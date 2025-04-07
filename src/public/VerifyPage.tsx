import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<string>("Verifying your email, please wait...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setStatus("Invalid verification link. Please check your email or contact support.");
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Invalid Link",
        description: "Verification code is missing or invalid."
      });
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/api/auth/user/verify?code=${code}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setStatus("Email verified successfully! Redirecting to login...");
          toast({
            variant: "default",
            title: "Verification Successful",
            description: "Redirecting to login page..."
          });
          setLoading(false);

          setTimeout(() => {
            navigate("/");
          }, 5000);
        } else {
            const errorText = await response.text();
            console.log(errorText); // Log the raw response text for debugging
            
            try {
              // Parse the errorText as JSON
              const errorData = JSON.parse(errorText);
            
              // Set the status using the `message` property from the parsed JSON
              setStatus(`Verification failed: ${errorData.message}`);
            
              // Show a toast notification
              toast({
                variant: "destructive",
                title: "Verification Failed",
                description: errorData.message || "Invalid or Expired Verification Link",
              });
            } catch (error) {
              // Handle cases where errorText is not valid JSON
              console.error("Failed to parse error response:", error);
              setStatus("Verification failed: An unknown error occurred.");
            
              toast({
                variant: "destructive",
                title: "Verification Failed",
                description: "An unknown error occurred.",
              });
            }
            
            setLoading(false);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("Something went wrong. Please try again later.");
        toast({
          variant: "destructive",
          title: "Server Error",
          description: "Something went wrong. Please try again later."
        });
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-900 px-4">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl max-w-md w-full border border-white/20 text-center"
      >
        <div className="flex justify-center mb-6">
          <img
            src="/upes-logo.jpg"
            alt="UPES Logo"
            className="w-24 h-24 object-contain bg-white p-2 rounded-full shadow-lg"
          />
        </div>

        {loading ? (
          <>
            <h2 className="text-xl font-semibold text-white mb-4">Verifying...</h2>
            <p className="text-sm text-gray-300">Please wait while we verify your email.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white mb-4">{status}</h2>
            {status.includes("successfully") && (
              <Button
                onClick={() => navigate("/")}
                className="w-full mt-4 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300"
              >
                Go to Login
              </Button>
            )}
          </>
        )}

        <div className="text-center text-xs text-gray-400 mt-8">
          Energy Acres, Bidholi: +91-7500201816, +91-8171323285 <br />
          Knowledge Acres, Kandoli: +91-8171979021, +91-7060111775
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyPage;
