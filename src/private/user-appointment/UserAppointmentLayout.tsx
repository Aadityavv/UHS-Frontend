import Navbar from "@/components/Navbar";
import Shared from "@/Shared";
import React from "react";

const UserAppointmentLayout = ({ children }: { children: React.ReactNode }) => {
  const navsetting = {
    title: "Patient Appointment",
    titleLogo: Shared.UserPlus,
    additionalLogo: Shared.ArrowLeft,
    menu: false,
    role: localStorage.getItem("roles"),
    prevRef: null,
  };

  return (
    <div className="min-h-[100vh] max-lg:min-h-[100svh] overflow-x-hidden bg-gradient-to-br from-[#F9FAFB] to-[#ECF0F3]">
      {/* Navbar */}
      <Navbar props={navsetting} />

      {/* Main Content */}
      <main className="flex-1 p-6 max-lg:p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center w-full border-t border-gray-200 bg-white text-black min-h-[8svh] max-lg:hidden">
        <div className="text-center text-sm text-gray-600">
          <p>
            <b>Energy Acres, Bidholi:</b> +91-7500201816, +91-8171323285
          </p>
          <p>
            <b>Knowledge Acres, Kandoli:</b> +91-8171979021, +91-7060111775
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserAppointmentLayout;