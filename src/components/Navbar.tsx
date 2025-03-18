import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, UserCircle2, ArrowLeft } from "lucide-react";

const Navbar = ({ props }: {
  props: {
    title: string;
    titleLogo: JSX.Element | string | false;
    additionalLogo: JSX.Element | undefined;
    menu: boolean | undefined;
    role: string | null;
    prevRef: string | null;
  };
}) => {
  const navigate = useNavigate();
  const [navPageBack, setNavPageBack] = useState("");

  useEffect(() => {
    if (props.prevRef !== null) setNavPageBack(props.prevRef);
    else setNavPageBack(`/${props.role}-dashboard`);
  }, [props.prevRef, props.role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate(props.role === "admin" ? "/admin-portal" : "/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-2 flex items-center justify-between relative"
    >
      {/* Left Section */}
      <div className="flex items-center z-10">
        <img
          src="/upes-logo.jpg"
          alt="UPES Logo"
          className="w-24 lg:w-28"
        />
        {/* <p className="font-mono text-2xl lg:text-3xl font-semibold text-gray-800">|UHS
        </p> */}
      </div>

      {/* Center Title & Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3 pointer-events-none">
        {/* {props.titleLogo &&
          (typeof props.titleLogo === "string" ? (
            <img src={props.titleLogo} alt="Title Logo" className="h-8 w-8" />
          ) : (
            props.titleLogo
          ))} */}
        <span className="font-bold text-lg lg:text-2xl text-gray-800 capitalize">
          {props.title}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 z-10">
        {props.additionalLogo && props.menu ? (
          <Popover>
            <PopoverTrigger className="flex items-center justify-center text-gray-700 hover:text-indigo-600">
              {props.additionalLogo}
            </PopoverTrigger>
            <PopoverContent align="end" className="space-y-2 p-2 w-48 shadow-md">
              {props.role !== "doctor" && props.role !== "ad" && props.role !== "admin" && (
                <button
                  onClick={() => navigate("/patient-profile")}
                  className="flex items-center w-full gap-2 px-3 py-2 rounded-md text-sm hover:bg-indigo-50"
                >
                  <UserCircle2 className="h-5 w-5 text-indigo-600" />
                  <span>Profile</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <Link
            to={navPageBack}
            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 text-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden lg:inline">Back</span>
          </Link>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
