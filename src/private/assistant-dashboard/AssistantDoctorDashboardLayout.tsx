import Navbar from "@/components/Navbar";
import Shared from "@/Shared";
import React, { useEffect, useState } from "react";

const AssistantDoctorDashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [title, setTitle] = useState("nursing assistant dashboard");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setTitle(e.matches ? "AD dashboard" : "nursing assistant dashboard");
    };

    setTitle(
      mediaQuery.matches ? "AD dashboard" : "nursing assistant dashboard"
    );

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const navsetting = {
    title: title,
    titleLogo: Shared.DoctorHome,
    additionalLogo: Shared.User,
    menu: true,
    role: "ad",
    prevRef:null
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

export default AssistantDoctorDashboardLayout;
