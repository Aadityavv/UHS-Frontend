import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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
  sapId: string;
  password?: string;
  confirmPassword?: string;
};

const schoolOptions = [
  "Non_Academics",
  "Guest",
  "SOCS",
  "SOB",
  "SOL",
  "SOHS",
  "SOAE",
  "SFL",
  "SOD",
  "SOLSM"
];

const schoolPrograms: Record<string, string[]> = {
  "SOAE": ["Faculty", "B.Tech", "B.Sc(Hons)", "M.Tech.", "M.Sc"],
  "SOCS": ["Faculty", "B.Tech", "M.Tech", "B.Sc", "BCA", "MCA"],
  "SOB": ["Faculty", "MBA", "BBA", "B.Com(Hons)", "BBA-MBA", "B.Com-MBA(Hons)"],
  "SOL": ["Faculty", "BA LL.B(Hons)", "BBA LL.B(Hons)", "B.COM LL.B(Hons)", "LL.B(Hons)", "LLM"],
  "SOD": ["Faculty", "B.Des", "M.Des"],
  "SOHS": ["Faculty", "B.Sc", "M.Sc", "B.Pharm", "B.Tech"],
  "SOLSM": ["Faculty", "B.Sc (H)", "BA", "BA(H)", "MA"],
  "SFL": ["Faculty", "B.A", "M.A"],
  "Guest": ["Guest"],
  "Non_Academics": ["Staff"]
};

const genderOptions = ["Male", "Female", "Other"];
const bloodGroupOptions = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

type BaseFormField = {
  label: string;
  type: string;
  disabled?: boolean;
  maxLength?: number;
  pattern?: string;
  error?: string;
  options?: string[];
};

type RegularFormField = BaseFormField & {
  id: keyof UserFormData;
};

type PasswordFormField = BaseFormField & {
  id: "password" | "confirmPassword";
  strength?: number;
};

type FormField = RegularFormField | PasswordFormField;

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
    sapId: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [programOptions, setProgramOptions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    return strength;
  };

  useEffect(() => {
    if (formData.school && schoolPrograms[formData.school]) {
      const newProgramOptions = schoolPrograms[formData.school];
      setProgramOptions(newProgramOptions);
      
      if (formData.program && !newProgramOptions.includes(formData.program)) {
        setFormData(prev => ({ ...prev, program: "" }));
      }
    } else {
      setProgramOptions([]);
      if (formData.program) {
        setFormData(prev => ({ ...prev, program: "" }));
      }
    }
  }, [formData.school, formData.program]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`https://uhs-backend.onrender.com/api/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;
        setFormData({
          email: userData.email || "",
          name: userData.name || "",
          phoneNumber: userData.phoneNumber || "",
          bloodGroup: userData.bloodGroup || "",
          school: userData.school || "",
          dateOfBirth: userData.dateOfBirth || "",
          program: userData.program || "",
          emergencyContact: userData.emergencyContact || "",
          gender: userData.gender || "",
          sapId: userData.sapId || "", 
        });

        if (userData.school && schoolPrograms[userData.school]) {
          setProgramOptions(schoolPrograms[userData.school]);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        let errorMessage = "Failed to fetch user data";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
          if (error.response?.status === 401) {
            navigate("/login");
          }
        }

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.password || formData.confirmPassword) {
      const password = formData.password || "";
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else {
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasLowercase) {
          newErrors.password = "Password must contain at least one lowercase letter";
        } else if (!hasUppercase) {
          newErrors.password = "Password must contain at least one uppercase letter";
        } else if (!hasNumber) {
          newErrors.password = "Password must contain at least one number";
        } else if (!hasSpecialChar) {
          newErrors.password = "Password must contain at least one special character (@$!%*?&)";
        }
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    // SAP ID validation - exactly 9 digits
    if (!formData.sapId.match(/^\d{9}$/)) {
      newErrors.sapId = "SAP ID must be 9 digits";
    }
    
    // Phone number validation
if (!formData.phoneNumber.match(/^[1-9]\d{9}$/)) {
  newErrors.phoneNumber = "Phone number must be 10 digits starting with 1-9";
}
    // Emergency contact validation
if (!formData.emergencyContact.match(/^[1-9]\d{9}$/)) {
  newErrors.emergencyContact = "Emergency contact must be 10 digits starting with 1-9";
}
    
    // Phone and emergency contact should be different
    if (formData.phoneNumber && formData.emergencyContact && 
        formData.phoneNumber === formData.emergencyContact) {
      newErrors.emergencyContact = "Emergency contact cannot be same as phone number";
    }
    
    // Date of birth validation - at least 15 years old
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 15) {
        newErrors.dateOfBirth = "User must be at least 15 years old";
      }
    } else {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
     
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(`https://uhs-backend.onrender.com/api/admin/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (formData.password) {
        await axios.put(`https://uhs-backend.onrender.com/api/admin/password/${formData.email}`, {
          password: formData.password
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      navigate("/admin/users");
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));
      
    } catch (error) {
      console.error("Error updating user:", error);
      let errorMessage = "Failed to update user";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formFields: FormField[] = [
    { label: "Email", id: "email", type: "email", disabled: true },
    { label: "Full Name", id: "name", type: "text" },
    { label: "SAP ID", id: "sapId", type: "text", maxLength: 9, pattern: "[0-9]{9}", error: errors.sapId },
    { label: "Phone Number", id: "phoneNumber", type: "text", maxLength: 10, pattern: "[0-9]{10}", error: errors.phoneNumber },
    { label: "Blood Group", id: "bloodGroup", type: "select", options: bloodGroupOptions },
    { label: "School", id: "school", type: "select", options: schoolOptions },
    { label: "Date of Birth", id: "dateOfBirth", type: "date", error: errors.dateOfBirth },
    { label: "Program", id: "program", type: "select", options: programOptions, disabled: !formData.school || fetching },
    { label: "Emergency Contact", id: "emergencyContact", type: "text", maxLength: 10, pattern: "[0-9]{10}", error: errors.emergencyContact },
    { label: "Gender", id: "gender", type: "select", options: genderOptions },
    ...(showPasswordFields
      ? [
          { 
            label: "Password", 
            id: "password", 
            type: "password", 
            error: errors.password,
            strength: getPasswordStrength(formData.password || "")
          } as PasswordFormField,
          { 
            label: "Confirm Password", 
            id: "confirmPassword", 
            type: "password", 
            error: errors.confirmPassword 
          } as PasswordFormField
        ]
      : [])
  ];

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span>Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/admin/users")} 
        className="mb-6"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
      </Button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">Edit User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map((field) => (
              <div className="space-y-2" key={field.id}>
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.type === "select" ? (
                  <div className="flex flex-col gap-1">
                    <select
                      id={field.id}
                      name={field.id}
                      value={formData[field.id as keyof UserFormData] || ""}
                      onChange={handleChange}
                      disabled={field.disabled || loading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                ) : field.id === "password" ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id={field.id}
                        name={field.id}
                        type={showPassword ? "text" : "password"}
                        value={formData[field.id] || ""}
                        onChange={handleChange}
                        disabled={field.disabled || loading}
                        className={(field.disabled ? "bg-gray-100 " : "") + (loading ? "cursor-not-allowed" : "")}
                      />
                      <div
                        className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                        onClick={() => setShowPassword(prev => !prev)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                    {"strength" in field && field.strength !== undefined && field.strength > 0 && (
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            field.strength <= 2 ? "bg-red-500" :
                            field.strength === 3 ? "bg-yellow-500" :
                            "bg-green-500"
                          }`} 
                          style={{ width: `${field.strength * 20}%` }}
                        />
                      </div>
                    )}
                    {field.error && (
                      <p className="text-sm text-red-600">{field.error}</p>
                    )}
                  </div>
                ) : field.id === "confirmPassword" ? (
                  <div className="relative">
                    <Input
                      id={field.id}
                      name={field.id}
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData[field.id] || ""}
                      onChange={handleChange}
                      disabled={field.disabled || loading}
                      className={(field.disabled ? "bg-gray-100 " : "") + (loading ? "cursor-not-allowed" : "")}
                    />
                    <div
                      className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                    {field.error && (
                      <p className="text-sm text-red-600">{field.error}</p>
                    )}
                  </div>
                ) : (
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    value={formData[field.id as keyof UserFormData] || ""}
                    onChange={handleChange}
                    disabled={field.disabled || loading}
                    maxLength={field.maxLength}
                    pattern={field.pattern}
                    className={(field.disabled ? "bg-gray-100 " : "") + (loading ? "cursor-not-allowed" : "")}
                  />
                )}
                {field.error && field.id !== "password" && field.id !== "confirmPassword" && (
                  <p className="text-sm text-red-600">{field.error}</p>
                )}
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (showPasswordFields) {
                setFormData(prev => ({
                  ...prev,
                  password: "",
                  confirmPassword: ""
                }));
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.password;
                  delete newErrors.confirmPassword;
                  return newErrors;
                });
              }
              setShowPasswordFields(prev => !prev);
            }}
            disabled={loading}
          >
            {showPasswordFields ? "Cancel Password Update" : "Change Password"}
          </Button>

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