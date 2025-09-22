import Navbar from "@/components/Navbar";
import Shared from "@/Shared";
import React from "react";

const StockPermissionsLayout = ({ children }: { children: React.ReactNode }) => {
  const navsetting = {
    title: "Stock Permissions",
    titleLogo: Shared.List,
    additionalLogo: Shared.ArrowLeft,
    menu: false,
    role: localStorage.getItem("roles"),
    prevRef: null,
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <Navbar props={navsetting} />

      {/* Main Content */}
      <main className="flex-grow w-full">{children}</main>

      {/* Footer */}
      <footer className="flex items-center justify-center w-full border-t border-black bg-white text-black min-h-[8svh] max-lg:hidden">
        <b>Energy Acres, Bidholi:</b>&nbsp;+91-7500201816, +91-8171323285 &nbsp;|&nbsp;
        <b>Knowledge Acres, Kandoli:</b>&nbsp;+91-8171979021, +91-7060111775
      </footer>
    </div>
  );
};

export default StockPermissionsLayout;