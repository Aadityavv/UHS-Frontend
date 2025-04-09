import { useEffect, useState } from "react";
import Shared from "@/Shared";
import Navbar from "@/components/Navbar";

const BackupAndRestoreLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [title, setTitle] = useState("Backup & Restore");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setTitle(e.matches ? "Backup/Restore" : "Backup & Restore");
    };

    setTitle(
      mediaQuery.matches ? "Backup/Restore" : "Backup & Restore"
    );

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const navsetting = {
    title,
    titleLogo: Shared.Download,
    additionalLogo: Shared.ArrowLeft,
    menu: false,
    role: "admin",
    prevRef: null
  };

  return (
    <div className="min-h-[100svh] flex flex-col">
      <Navbar props={navsetting} />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-black bg-white py-3 text-sm text-center max-lg:hidden">
        <div className="container mx-auto px-4">
          <b>Energy Acres:</b> +91-7500201816, +91-8171323285 • <b>Knowledge Acres:</b> +91-8171979021, +91-7060111775
        </div>
      </footer>
    </div>
  );
};

export default BackupAndRestoreLayout;