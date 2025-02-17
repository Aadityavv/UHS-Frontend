import Navbar from "@/components/Navbar";
import Shared from "@/Shared";
import React from "react";
import { motion } from "framer-motion";
// import { Phone } from "lucide-react";
// import { title } from "process";

const EmergencyLayout = ({ children }: { children: React.ReactNode }) => {
  const navsetting = {
    title: "Emergency Contacts",
    // titleLogo: "/siren.png",
    titleLogo:"",
    additionalLogo: Shared.ArrowLeft,
    menu: false,
    role: localStorage.getItem("roles"),
    prevRef: null,
  };

  return (
    <div className="min-h-[79svh] flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <Navbar props={navsetting} />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-3"
      >
        {children}
      </motion.main>

      {/* Footer */}
      {/* <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full border-t border-gray-200 bg-white/90 backdrop-blur-md text-black py-4"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" />
            <b>Energy Acres, Bidholi:</b>
            <span>+91-7500201816, +91-8171323285</span>
          </div>
          <div className="hidden md:block text-gray-400">|</div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" />
            <b>Knowledge Acres, Kandoli:</b>
            <span>+91-8171979021, +91-7060111775</span>
          </div>
        </div>
      </motion.footer> */}



<div className="flex items-center justify-center w-full border-t border-black bg-white text-black min-h-[8svh] max-lg:hidden">
        <b>Energy Acres, Bidholi : </b>&nbsp;+91-7500201816, +91-8171323285
        &nbsp; | &nbsp; <b>Knowledge Acres, Kandoli : </b>
        &nbsp;+91-8171979021, +91-7060111775
      </div>
    </div>
  );
};

export default EmergencyLayout;