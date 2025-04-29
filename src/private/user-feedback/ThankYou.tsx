import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/patient-dashboard");
    }, 3000);  // Redirect after 3 seconds

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-2">Your feedback has been submitted successfully.</p>
        <p className="text-gray-400 text-sm">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
};

export default ThankYou;
