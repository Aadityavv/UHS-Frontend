// In CommonPrescriptionLayout.tsx
import Navbar from "@/components/Navbar";
import Shared from "@/Shared";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CommonPrescriptionLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const role = localStorage.getItem("roles");
  let fallbackPath = "/doctor-dashboard"; // default
  
  if (role === "admin") fallbackPath = "/admin/patient-logs";
  else if (role === "ad") fallbackPath = "/patient-logs";
  else if (role === "patient") fallbackPath = "/patient-dashboard";
  
  const prevPath = location.state?.prevPath || fallbackPath;
  
  
  const navsetting = {
    title: "Prescription",
    titleLogo: Shared.Prescription,
    additionalLogo: Shared.ArrowLeft,
    menu: false,
    role: localStorage.getItem("roles"),
    prevRef: prevPath, // Use the previous path from location state
    onBackClick: () => navigate(prevPath) // Explicit back navigation handler
  };
  
  return (
    <div className="min-h-[100svh]">
      <Navbar props={navsetting} />
      {children}
      <div className="flex items-center justify-center w-full border-t border-black bg-white text-black min-h-[8svh] max-lg:hidden">
        <b>Energy Acres, Bidholi : </b>&nbsp;+91-7500201816, +91-8171323285
        &nbsp; | &nbsp; <b>Knowledge Acres, Kandoli : </b>
        &nbsp;+91-8171979021, +91-7060111775
      </div>
    </div>
  );
};

export default CommonPrescriptionLayout;