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
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

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
      <div className="min-h-[84svh] w-full flex gap-8 max-lg:flex-col">
        <div className="w-full lg:w-1/4 space-y-6 p-6 max-lg:p-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-1">Current Time</p>
                <p className="text-xl font-bold">{formatTime(time)}</p>
              </div>
              <Clock className="h-6 w-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </motion.div>
        </div>

        <div className="flex-1 p-6 max-lg:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ad-Hoc Treatment</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Patient Details */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Patient Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter patient name"
                          className="rounded-lg focus:ring-2 focus:ring-indigo-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Patient Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter patient email"
                          className="rounded-lg focus:ring-2 focus:ring-indigo-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Treatment Reason
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter treatment reason"
                          className="rounded-lg focus:ring-2 focus:ring-indigo-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Medicine Selection */}
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <FormField
                      control={form.control}
                      name="medicine.name"
                      render={({ field }) => (
                        <div className="w-1/2">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Medicine
                          </FormLabel>
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
                            <SelectTrigger className="rounded-lg focus:ring-2 focus:ring-indigo-600">
                              <SelectValue placeholder="Select Medicine" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <Input
                                  placeholder="Search Medicine"
                                  className="rounded-lg"
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
                                    className="hover:bg-indigo-50"
                                  >
                                    {medicine.medicineName} (Qty:{" "}
                                    {medicine.quantity}, Exp:{" "}
                                    {formatDate(medicine.expirationDate)}, Co:{" "}
                                    {medicine.company})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-xs" />
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medicine.quantity"
                      render={({ field }) => (
                        <div className="w-1/2">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Quantity
                          </FormLabel>
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            min="1"
                            className="rounded-lg focus:ring-2 focus:ring-indigo-600"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? parseInt(value, 10) : 0);
                            }}
                          />
                          <FormMessage className="text-red-500 text-xs" />
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Submit Treatment
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdHocTreatment;