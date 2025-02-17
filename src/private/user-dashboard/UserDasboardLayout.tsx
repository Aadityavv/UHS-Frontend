import Navbar from "@/components/Navbar";
import Shared from "@/Shared";
import React from "react";

const UserDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navsetting = {
    title: "Patient Dashboard",
    titleLogo: Shared.HomeUser,
    additionalLogo: Shared.User,
    menu: true,
    role: "user",
    prevRef: null,
  };

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-gray-50">
      {/* Navbar */}
      <Navbar props={navsetting} />

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center w-full border-t border-gray-200 bg-white text-black min-h-[8svh] max-lg:hidden">
      <div className="flex items-center justify-center w-full border-t border-black bg-white text-black min-h-[8svh] max-lg:hidden">
        <b>Energy Acres, Bidholi : </b>&nbsp;+91-7500201816, +91-8171323285
        &nbsp; | &nbsp; <b>Knowledge Acres, Kandoli : </b>
        &nbsp;+91-8171979021, +91-7060111775
      </div>
      </footer>
    </div>
  );
};

export default UserDashboardLayout;