import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";

const TokenPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tokenData, setTokenData] = useState<
    Array<{ doctorName: string; PatientToken: string }>
  >([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      toast({
        title: "Unauthorized",
        description: "Session expired. Please log in again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://uhs-backend.onrender.com//api/AD/getTokenData",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          setTokenData(response.data);
        } else if (response.status === 401) {
          toast({
            title: "Unauthorized",
            description: "You are not authorized. Redirecting to login...",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          toast({
            title: "Error",
            description: response.data.message || "Something went wrong.",
            variant: "destructive",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Something Went Wrong. Please try again later.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    };

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    fetchData();

    return () => {
      clearInterval(interval);
    };
  }, [navigate, toast]);

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] flex flex-col items-center justify-start py-4">
        <table className="table-auto border-collapse border border-gray-400 w-[95%]">
          <thead>
            <tr className="bg-gray-300">
              <th className="border border-gray-400 px-4 py-2">Doctor</th>
              <th className="border border-gray-400 px-4 py-2">
                Patient Token
              </th>
            </tr>
          </thead>
          <tbody>
            {tokenData?.map((data, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {data.doctorName}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {data.PatientToken}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TokenPage;
