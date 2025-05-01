import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";

const FEEDBACK_API = "https://uhs-backend.onrender.com/api/feedback/submit";

const UserFeedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [appointmentId] = useState(() => localStorage.getItem("appointmentId"));
  const [token] = useState(() => localStorage.getItem("token"));
  const [patientEmail] = useState(() => localStorage.getItem("email"));
  

  useEffect(() => {
    if (!appointmentId || !token || !patientEmail) {
      const pathname = window.location.pathname;
      if (!pathname.includes("thank-you")) {
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        navigate("/patient-dashboard");
      }
    }
  }, [appointmentId, token, patientEmail, navigate, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Incomplete",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        FEEDBACK_API,
        { appointmentId, patientEmail, rating, comments },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Feedback Submitted",
        description: "Thank you for sharing your experience!",
        variant: "default",
      });

      localStorage.removeItem("appointmentId");
      setTimeout(() => navigate("/thank-you"), 700);

    } catch (error) {
      console.error("Feedback submission failed:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster />
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          <h1 className="text-3xl font-bold text-center text-gray-900">Appointment Completed</h1>
          We Value Your Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Comments Input */}
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Write your comments here (optional)"
            rows={4}
            maxLength={500}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              submitting
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserFeedback;
