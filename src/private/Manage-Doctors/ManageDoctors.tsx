import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import DoctorFeedbackModalForAdmin from "@/components/DoctorFeedbackModalForAdmin";
type Doctor = {
  doctorId: string;
  doctorEmail: string;
  name: string;
  gender: string;
  status: boolean;
  designation: string;
};

const ManageDoctors = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);


  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    location: "",
    password: "",
  });
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (!hasUpperCase) {
      setPasswordError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!hasLowerCase) {
      setPasswordError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!hasNumber) {
      setPasswordError("Password must contain at least one number");
      return false;
    }
    if (!hasSpecialChar) {
      setPasswordError("Password must contain at least one special character");
      return false;
    }

    setPasswordError(null);
    return true;
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://uhs-backend.onrender.com/api/admin/doctor", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctors(res.data);
    } catch (err) {
      toast({ title: "Error fetching doctors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // const fetchDoctorFeedback = async (doctorId: string) => {
  //   try {
  //     const res = await axios.get(
  //       `https://uhs-backend.onrender.com/api/feedback/allByDoctor?doctorId=${doctorId}`,
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );
  //     setSelectedDoctorFeedback(res.data.data);
  //     setIsFeedbackOpen(true);
  //   } catch (err) {
  //     toast({ title: "Failed to fetch feedback", variant: "destructive" });
  //   }
  // };
  

  const handleUpdate = async () => {
    if (!editingDoctor) return;
    
    // Only validate password if it's being changed (not empty)
    if (formData.password.trim() && !validatePassword(formData.password)) {
      return;
    }

    try {
      const updatePayload = {
        ...editingDoctor,
        ...(formData.password.trim() && { password: formData.password })// only include password if not empty
      };
  
      await axios.put(
        `https://uhs-backend.onrender.com/api/admin/doctor/${editingDoctor.doctorId}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
  
      toast({ title: "Doctor updated successfully" });
      setIsDialogOpen(false);
      setFormData({ ...formData, password: "" }); // reset password field
      setShowPasswordField(false); // hide password field after save
      fetchDoctors();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const performDelete = async (id: string) => {
    try {
      await axios.delete(`https://uhs-backend.onrender.com/api/admin/doctor/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast({ title: "Doctor deleted" });
      fetchDoctors();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
const [selectedDoctorFeedback, setSelectedDoctorFeedback] = useState<any[]>([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Stethoscope className="h-6 w-6" />
        Manage Doctors
      </h1>

      {loading ? (
        <Skeleton className="h-[300px] w-full rounded-lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.doctorId}>
              <CardHeader>
                <CardTitle>{doctor.name}</CardTitle>
                <p className="text-sm text-gray-500">{doctor.doctorEmail}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Gender:</strong> {doctor.gender}</p>
                <p><strong>Status:</strong> {doctor.status ? "Active" : "Inactive"}</p>
                <p><strong>Designation:</strong> {doctor.designation}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => {
                    setEditingDoctor({ ...doctor });
                    setIsDialogOpen(true);
                  }}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setConfirmDeleteId(doctor.doctorId);
                      setConfirmDeleteName(doctor.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                  <Button
  variant="outline"
  size="sm"
  onClick={async () => {
    try {
      const res = await axios.get(
        `https://uhs-backend.onrender.com/api/feedback/admin/doctorFeedback/${doctor.doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSelectedDoctorFeedback(res.data.data);
      setIsFeedbackOpen(true);
    } catch {
      toast({ title: "Failed to fetch feedback", variant: "destructive" });
    }
  }}
>
  View Feedback
</Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setShowPasswordField(false);
          setFormData({ ...formData, password: "" });
          setPasswordError(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          {editingDoctor ? (
            <div className="space-y-3">
              <Input
                value={editingDoctor.name}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                placeholder="Name"
              />
              <Input
                value={editingDoctor.gender}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, gender: e.target.value })}
                placeholder="Gender"
              />
              <Input
                value={editingDoctor.designation}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, designation: e.target.value })}
                placeholder="Designation"
              />
              {/* Toggle button to show password field */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowPasswordField(!showPasswordField);
                  setFormData({ ...formData, password: "" });
                  setPasswordError(null);
                }}
              >
                {showPasswordField ? "Cancel Password Change" : "Change Password"}
              </Button>

              {showPasswordField && (
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (e.target.value) {
                        validatePassword(e.target.value);
                      } else {
                        setPasswordError(null);
                      }
                    }}
                  />
                  <div
                    className="absolute right-3 top-9 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                  {!passwordError && formData.password && (
                    <p className="mt-1 text-sm text-green-600">Password is valid</p>
                  )}
                </div>
              )}

              <Button onClick={handleUpdate} className="w-full">
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDeleteId} onOpenChange={() => {
        setConfirmDeleteId(null);
        setConfirmDeleteName(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete <strong>{confirmDeleteName}</strong>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => {
              setConfirmDeleteId(null);
              setConfirmDeleteName(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDeleteId) {
                  performDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                  setConfirmDeleteName(null);
                }
              }}
            >
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DoctorFeedbackModalForAdmin
  isOpen={isFeedbackOpen}
  onClose={() => setIsFeedbackOpen(false)}
  feedbackData={selectedDoctorFeedback}
/>




    </div>
  );
};

export default ManageDoctors;