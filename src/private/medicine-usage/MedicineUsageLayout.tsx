import Navbar from "@/components/Navbar";
import Shared from "@/Shared";
import React from "react";
import { useLocation } from "react-router-dom";

const MedicineUsageLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navsetting = {
    title: "Medicine Usage",
    titleLogo: Shared.Pills,
    additionalLogo: Shared.ArrowLeft,
    menu: false,
    role: localStorage.getItem("roles"),
    prevRef: location.state?.from || null
  };
  return (
    <div className="h-[100vh] max-lg:min-h-[100svh] overflow-x-hidden">
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

export default MedicineUsageLayout;
