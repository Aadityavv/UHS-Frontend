import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type UserFormData = {
  email: string;
  name: string;
  phoneNumber: string;
  bloodGroup: string;
  school: string;
  dateOfBirth: string;
  program: string;
  emergencyContact: string;
  gender: string;
};

export const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    name: "",
    phoneNumber: "",
    bloodGroup: "",
    school: "",
    dateOfBirth: "",
    program: "",
    emergencyContact: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const formFields = [
    { label: "Email", id: "email", type: "email", disabled: true },
    { label: "Full Name", id: "name", type: "text" },
    { label: "Phone Number", id: "phoneNumber", type: "text" },
    { label: "Blood Group", id: "bloodGroup", type: "text" },
    { label: "School", id: "school", type: "text" },
    { label: "Date of Birth", id: "dateOfBirth", type: "date" },
    { label: "Program", id: "program", type: "text" },
    { label: "Emergency Contact", id: "emergencyContact", type: "text" },
    { label: "Gender", id: "gender", type: "text" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8081/api/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          email: response.data.email,
          name: response.data.name,
          phoneNumber: response.data.phoneNumber,
          bloodGroup: response.data.bloodGroup,
          school: response.data.school,
          dateOfBirth: response.data.dateOfBirth,
          program: response.data.program,
          emergencyContact: response.data.emergencyContact,
          gender: response.data.gender,
        });
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Failed to fetch user";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate("/admin/users");
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8081/api/admin/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      navigate("/admin/users");
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to update user";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="container mx-auto px-4 py-8">Loading user data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
      </Button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">Edit User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map((field) => (
              <div className="space-y-2" key={field.id}>
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  value={formData[field.id as keyof UserFormData] || ""}
                  onChange={handleChange}
                  disabled={field.disabled}
                  className={field.disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
