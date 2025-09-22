import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Doctor = {
  doctorId: string;
  doctorEmail: string;
  name: string;
  canEditStock: boolean;
};

type AD = {
  email: string;
  name: string;
  canEditStock: boolean;
};

const StockPermissions = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [assistants, setAssistants] = useState<AD[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("doctors");
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null);

  // Filter users based on search term
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.doctorEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("https://uhs-backend.onrender.com/api/admin/doctor", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setDoctors(response.data);
      } else {
        throw new Error("Invalid doctors data format");
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to fetch doctors";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("https://uhs-backend.onrender.com/api/admin/ad", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setAssistants(response.data);
      } else {
        throw new Error("Invalid assistants data format");
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to fetch assistants";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorPermission = async (doctorId: string, doctorEmail: string, canEdit: boolean) => {
    try {
      setUpdatingPermission(doctorEmail);
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://uhs-backend.onrender.com/api/admin/doctor/${doctorId}/stock-permission?canEdit=${canEdit}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDoctors(doctors.map(doctor => 
        doctor.doctorId === doctorId 
          ? { ...doctor, canEditStock: canEdit } 
          : doctor
      ));
      
      toast({ 
        title: "Success", 
        description: `Stock permission ${canEdit ? 'granted to' : 'revoked from'} ${doctorEmail}` 
      });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || "Failed to update permission"
        : "Failed to update permission";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setUpdatingPermission(null);
    }
  };

  const updateAssistantPermission = async (email: string, canEdit: boolean) => {
    try {
      setUpdatingPermission(email);
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://uhs-backend.onrender.com/api/admin/ad/${email}/stock-permission?canEdit=${canEdit}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAssistants(assistants.map(assistant => 
        assistant.email === email 
          ? { ...assistant, canEditStock: canEdit } 
          : assistant
      ));
      
      toast({ 
        title: "Success", 
        description: `Stock permission ${canEdit ? 'granted to' : 'revoked from'} ${email}` 
      });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || "Failed to update permission"
        : "Failed to update permission";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setUpdatingPermission(null);
    }
  };

  useEffect(() => {
    if (activeTab === "doctors") {
      fetchDoctors();
    } else {
      fetchAssistants();
    }
  }, [activeTab]);

  const renderDoctorsList = () => (
    <div className="space-y-4">
      {filteredDoctors.map((doctor) => (
        <Card key={doctor.doctorId} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{doctor.name}</h3>
                <p className="text-sm text-gray-500">{doctor.doctorEmail}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm mr-2">
                  {doctor.canEditStock ? "Can edit stock" : "Cannot edit stock"}
                </span>
                {updatingPermission === doctor.doctorEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    checked={doctor.canEditStock}
                    onCheckedChange={(checked) => updateDoctorPermission(doctor.doctorId, doctor.doctorEmail, checked)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAssistantsList = () => (
    <div className="space-y-4">
      {filteredAssistants.map((assistant) => (
        <Card key={assistant.email} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{assistant.name}</h3>
                <p className="text-sm text-gray-500">{assistant.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm mr-2">
                  {assistant.canEditStock ? "Can edit stock" : "Cannot edit stock"}
                </span>
                {updatingPermission === assistant.email ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    checked={assistant.canEditStock}
                    onCheckedChange={(checked) => updateAssistantPermission(assistant.email, checked)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Stock Edit Permissions</h1>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="assistants">Nursing Assistants</TabsTrigger>
        </TabsList>
        
        <TabsContent value="doctors" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {doctors.length === 0 ? "No doctors found" : "No matching doctors found"}
            </div>
          ) : (
            renderDoctorsList()
          )}
        </TabsContent>
        
        <TabsContent value="assistants" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredAssistants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {assistants.length === 0 ? "No nursing assistants found" : "No matching nursing assistants found"}
            </div>
          ) : (
            renderAssistantsList()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockPermissions;