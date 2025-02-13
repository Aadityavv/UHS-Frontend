import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({
  props,
}: {
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
  const navigateTo = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    if (props.prevRef !== null) setNavPageBack(props.prevRef);
    else setNavPageBack(`/${props.role}-dashboard`);
  });

  const handleLogout = () => {
    localStorage.clear();
    if (props.role == "admin") {
      navigateTo("/admin-portal");
    } else {
      navigateTo("/");
    }
  };

  return (
    <div className="bg-white shadow-md p-4 flex items-center justify-between h-[8svh] border-b border border-[gray] max-lg:h-[7svh] relative">
      {/* Title and Title Logo */}
      <div className="text-xl gap-2 absolute inset-0 flex items-center justify-center z-0 pointer-events-none max-lg:hidden">
        {props.titleLogo &&
          (typeof props.titleLogo === "string" ? (
            <img src={props.titleLogo} alt="Title Logo"/>
          ) : (
            props.titleLogo
          ))}
        <span className="capitalize font-semibold text-2xl max-lg:text-xl">
          {props.title}
        </span>
      </div>

      {/* Left Section */}
      <span className="flex items-center justify-center z-10">
        <img
          src="/upes-logo.jpg"
          alt="UPES Logo"
          className="w-[100px] max-lg:w-[80px]"
        />
        <p className="font-mono text-3xl max-lg:text-2xl">|UHS</p>
      </span>

      {/* Right Section */}
      {props.additionalLogo && props.menu ? (
        <Popover>
          <PopoverTrigger className="text-2xl max-lg:text-lg flex items-center justify-end z-10">
            {props.additionalLogo}
          </PopoverTrigger>
          <PopoverContent className="space-y-2 p-2 max-lg:p-2 z-10">
            {props.role !== "doctor" &&
            props.role !== "ad" &&
            props.role !== "admin" ? (
              <div
                className="flex items-center gap-3 max-lg:items-start max-lg:gap-1 hover:bg-gray-100 hover:text-blue-500 hover:cursor-pointer p-1 rounded-md"
                onClick={() => navigateTo("/patient-profile")}
              >
                <img
                  src="/user-icon.png"
                  alt="User Icon"
                  className="w-4 max-lg:w-5"
                />
                <span className="text-base max-lg:text-sm">Profile</span>
              </div>
            ) : (
              <></>
            )}
            <div
              className="flex items-center gap-2.5 max-lg:items-start max-lg:gap-1 hover:bg-gray-100 hover:text-blue-500 p-1 hover:cursor-pointer rounded-md"
              onClick={handleLogout}
            >
              <img
                src="/logout.png"
                alt="Logout Icon"
                className="w-5 max-lg:w-6"
              />
              <span className="text-base max-lg:text-sm">Logout</span>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Link
          to={navPageBack}
          className="text-base max-lg:text-sm flex items-center justify-end z-10"
        >
          {props.additionalLogo}
        </Link>
      )}
    </div>
  );
};

export default Navbar;
