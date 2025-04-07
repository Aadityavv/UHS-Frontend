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
import { Clock, User, Mail, ClipboardList, Pill, PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
  notes: z.string().optional(),
});

const AdHocTreatment = () => {
  const { toast } = useToast();
  const [, setTime] = useState<Date>(new Date());
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
      medicine: { id: "", name: "", quantity: 1 },
      notes: "",
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
          "http://localhost:8081/api/AD/stock/available",
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
    setIsSubmitting(true);
    const submitData = {
      name: data.name,
      patientEmail: data.email,
      medicine: data.medicine.id,
      quantity: data.medicine.quantity,
      reason: data.reason,
      notes: data.notes,
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
        "http://localhost:8081/api/AD/submit/adHoc",
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
          description: "Treatment recorded successfully",
        });
        setTimeout(() => {
          navigate("/ad-dashboard");
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit treatment",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // const formatTime = (date: Date) => {
  //   const hours = date.getHours();
  //   const minutes = date.getMinutes().toString().padStart(2, "0");
  //   const seconds = date.getSeconds().toString().padStart(2, "0");
  //   const period = hours >= 12 ? "PM" : "AM";
  //   const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
  //   return `${formattedHours}:${minutes}:${seconds} ${period}`;
  // };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="h-5 w-5 text-green-600" />
                    Available Medicines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="">
                    <Input
                      placeholder="Search medicines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-lg"
                    />
                    <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
                      {stock
                        .filter((medicine) =>
                          medicine.medicineName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((medicine) => (
                          <div
                            key={medicine.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                              form.setValue("medicine", {
                                id: medicine.id,
                                name: medicine.medicineName,
                                quantity: 1,
                              });
                            }}
                          >
                            <div className="font-medium">{medicine.medicineName}</div>
                            <div className="text-sm text-gray-500 flex justify-between mt-1">
                              <span>Qty: {medicine.quantity}</span>
                              <span>Exp: {formatDate(medicine.expirationDate)}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {medicine.company}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Form */}
          <div className="col-span-1 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Patient Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Patient Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <User className="h-4 w-4 text-gray-500" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter patient's full name"
                              className="rounded-xl focus:ring-2 focus:ring-blue-500"
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
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Mail className="h-4 w-4 text-gray-500" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter patient's email"
                              className="rounded-xl focus:ring-2 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Treatment Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-green-500" />
                      Treatment Details
                    </h3>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            Reason for Treatment
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the reason for treatment"
                              className="rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            Additional Notes
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes or observations"
                              className="rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Medicine Selection Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Pill className="h-5 w-5 text-purple-500" />
                      Medicine Prescription
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="medicine.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Pill className="h-4 w-4 text-gray-500" />
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
                              <FormControl>
                                <SelectTrigger className="rounded-xl focus:ring-2 focus:ring-blue-500">
                                  <SelectValue placeholder="Select a medicine" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <div className="p-2">
                                  <Input
                                    placeholder="Search medicine..."
                                    className="rounded-lg"
                                    value={searchQuery}
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
                                      className="rounded-lg hover:bg-blue-50"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">{medicine.medicineName}</span>
                                        <span className="text-xs text-gray-500">
                                          Qty: {medicine.quantity} | Exp: {formatDate(medicine.expirationDate)}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicine.quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Pill className="h-4 w-4 text-gray-500" />
                              Quantity
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Enter quantity"
                                className="rounded-xl focus:ring-2 focus:ring-blue-500"
                                value={field.value}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value ? parseInt(value, 10) : 0);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                    <Button
                      type="submit"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4 animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <PlusCircle className="h-4 w-4" />
                          Submit Treatment
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdHocTreatment;