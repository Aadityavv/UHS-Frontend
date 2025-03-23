import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>("Verifying your email, please wait...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setStatus("Invalid verification link. Please check your email or contact support.");
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `https://uhs-backend.onrender.com/api/auth/user/verify?code=${code}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setStatus("Email verified successfully! Redirecting to login...");
          setLoading(false);

          // Redirect after 3 seconds to the login page
          setTimeout(() => {
            navigate("/login"); // adjust route as per your app
          }, 3000);
        } else {
          const errorText = await response.text();
          setStatus(`Verification failed: ${errorText}`);
          setLoading(false);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("Something went wrong. Please try again later.");
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        color: "#333",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
          padding: "40px 30px",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {loading ? (
          <div>
            <h2 style={{ color: "#4f46e5" }}>Verifying...</h2>
            <p>Please wait while we verify your email.</p>
          </div>
        ) : (
          <div>
            <h2>{status}</h2>
            {status.includes("successfully") && (
              <p>You will be redirected shortly. If not, <button
                onClick={() => navigate("/login")}
                style={{
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
              >
                Go to Login
              </button></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
