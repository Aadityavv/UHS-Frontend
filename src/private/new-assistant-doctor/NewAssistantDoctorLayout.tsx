import { useEffect, useState } from "react";
import Shared from "@/Shared";
import Navbar from "@/components/Navbar";

const NewAssistantDoctorLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [title, setTitle] = useState("Register New Nursing Assistant");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setTitle(e.matches ? "Register New AD" : "Register New Nursing Assistant");
    };

    setTitle(
      mediaQuery.matches ? "Register New AD" : "Register New Nursing Assistant"
    );

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const navsetting = {
    title,
    titleLogo: Shared.UserPlus,
    additionalLogo: Shared.ArrowLeft,
    menu: false,
    role: "admin",
    prevRef:null
  };

  return (
    <>
      <div className="min-h-[100svh]">
        <Navbar props={navsetting} />
        {children}
        <div className="flex items-center justify-center w-full border-t border-black bg-white text-black min-h-[8svh] max-lg:hidden">
        <b>Energy Acres, Bidholi : </b>&nbsp;+91-7500201816, +91-8171323285
        &nbsp; | &nbsp; <b>Knowledge Acres, Kandoli : </b>
        &nbsp;+91-8171979021, +91-7060111775
      </div>
      </div>
    </>
  );
};

export default NewAssistantDoctorLayout;
