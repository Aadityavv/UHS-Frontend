import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ToastAction } from "@/components/ui/toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  reason: z.string().min(1, "Reason is required"),
  medicine: z.object({
    id: z.string(),
    name: z.string(),
    quantity: z
      .number()
      .min(1, "Quantity must be at least 1")
      .refine((val) => !isNaN(val), {
        message: "Quantity must be a number",
      }),
  }),
});

const AdHocTreatment = () => {
  const { toast } = useToast();
  const [time, setTime] = useState<Date>(new Date());
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
      medicine: { id: "", name: "", quantity: 1 },
    },
  });

  const [stock, setStock] = useState<
    Array<{
      id: string;
      medicineName: string;
      quantity: number;
      expirationDate: string;
      company: string;
      locationName: string;
    }>
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchMedicineStock = async () => {
      try {
        const response = await axios.get(
          "https://uhs-backend.onrender.com/api/AD/stock/available",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "X-Latitude": localStorage.getItem("latitude"),
              "X-Longitude": localStorage.getItem("longitude"),
            },
          }
        );

        const formattedStock = response.data.map((item: any) => ({
          id: item.id,
          medicineName: item.medicineName,
          quantity: item.quantity,
          expirationDate: item.expirationDate,
          company: item.company,
          locationName: item.location.locationName,
        }));

        setStock(formattedStock);
      } catch (error: any) {
        console.error("Failed to fetch medicine stock", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            error.response?.data?.details ||
            "Failed to fetch medicine stock.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    };

    fetchMedicineStock();
  }, []);

  const handleSubmit = async (data: any) => {
    const submitData = {
      name: data.name,
      patientEmail: data.email,
      medicine: data.medicine.id,
      quantity: data.medicine.quantity,
    };

    try {
      if (
        !(localStorage.getItem("latitude") || localStorage.getItem("longitude"))
      ) {
        toast({
          title: "Location Required",
          description: "Select a location to proceed.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        return;
      }

      const response = await axios.post(
        "https://uhs-backend.onrender.com/api/AD/submit/adHoc",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "X-Latitude": localStorage.getItem("latitude"),
            "X-Longitude": localStorage.getItem("longitude"),
          },
        }
      );
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Medicine given successfully.",
        });
        setTimeout(() => {
          navigate("/ad-dashboard");
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message,
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleBack = () => {
    navigate("/ad-dashboard");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
    return `${formattedHours}:${minutes}:${seconds} ${period}`;
  };

  return (
    <>
      <Toaster />
      <div className="min-h-[84svh] w-full flex gap-8 max-lg:min-h-[93svh]">
        <div className="flex flex-col gap-4 w-3/4 justify-center items-center max-lg:hidden">
          <div className="flex items-center justify-center p-5 max-lg:p-5 bg-gray-800 rounded-lg shadow-lg my-5">
            <p className="text-4xl font-bold text-white drop-shadow-lg">
              {formatTime(time)}
            </p>
          </div>
          <div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border bg-white shadow-lg max-lg:hidden"
            />
          </div>
        </div>
        <div className="w-full p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="h-[100%] flex flex-col gap-4"
            >
              {/* Patient Details */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the name of patient"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the email of patient"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the reason for medications"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Medicine Selection */}
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  {/* Medicine Dropdown */}
                  <FormField
                    control={form.control}
                    name="medicine.name"
                    render={({ field }) => (
                      <div className="w-1/2">
                        <FormLabel>Medicine</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const [id, name] = value.split(":");
                            field.onChange(name);
                            form.setValue("medicine", {
                              ...form.getValues("medicine"),
                              id,
                              name,
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Medicine" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <input
                                type="text"
                                placeholder="Search Medicine"
                                className="w-full px-2 py-1 border rounded"
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            {stock
                              .filter((medicine) =>
                                medicine.medicineName
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                              )
                              .map((medicine) => (
                                <SelectItem
                                  key={medicine.id}
                                  value={`${medicine.id}:${medicine.medicineName}`}
                                >
                                  {medicine.medicineName} (Qty:{" "}
                                  {medicine.quantity}, Exp:{" "}
                                  {formatDate(medicine.expirationDate)}, Co:{" "}
                                  {medicine.company})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    )}
                  />

                  {/* Quantity Input */}
                  <FormField
                    control={form.control}
                    name="medicine.quantity"
                    render={({ field }) => (
                      <div className="w-1/2">
                        <FormLabel>Quantity</FormLabel>
                        <Input
                          type="number"
                          placeholder="Enter Quantity"
                          min="1"
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value, 10) : 0);
                          }}
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="w-full flex justify-end items-center gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  className="text-red-500 bg-white border border-red-500 w-24"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#2061f5] to-[#13398f] w-24 text-white"
                >
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AdHocTreatment;
