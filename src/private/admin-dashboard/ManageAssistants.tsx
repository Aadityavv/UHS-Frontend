import { DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, HeartPulse, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Assistant = {
  email: string;
  name: string;
  designation: string;
};

const ManageAssistants = () => {
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDeleteEmail, setConfirmDeleteEmail] = useState<string | null>(null);


  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://uhs-backend.onrender.com/api/admin/ad", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAssistants(res.data);
    } catch (err) {
      toast({ title: "Error fetching assistants", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAssistant) return;

    try {
      const updatePayload = {
        ...editingAssistant,
        ...(password.trim() && { password }) // only send password if not empty
      };

      await axios.put(
        `https://uhs-backend.onrender.com/api/admin/ad/${editingAssistant.email}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast({ title: "Assistant updated successfully" });
      setIsDialogOpen(false);
      setPassword("");
      setShowPasswordField(false);
      fetchAssistants();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const performDelete = async (email: string) => {
    try {
      await axios.delete(`https://uhs-backend.onrender.com/api/admin/ad/${email}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast({ title: "Assistant deleted" });
      fetchAssistants();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };
  

  useEffect(() => {
    fetchAssistants();
  }, []);

  return (
    
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <HeartPulse className="h-6 w-6" />
        Manage Nursing Assistants
      </h1>

      {loading ? (
        <Skeleton className="h-[300px] w-full rounded-lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((ad) => (
            <Card key={ad.email}>
              <CardHeader>
                <CardTitle>{ad.name}</CardTitle>
                <p className="text-sm text-gray-500">{ad.email}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Designation:</strong> {ad.designation}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => {
                    setEditingAssistant({ ...ad });
                    setIsDialogOpen(true);
                  }}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteEmail(ad.email)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Assistant</DialogTitle>
      <DialogDescription>
        Update assistant details and optionally change their password.
      </DialogDescription>
    </DialogHeader>
          {editingAssistant ? (
            <div className="space-y-3">
              <Input
                value={editingAssistant.name}
                onChange={(e) => setEditingAssistant({ ...editingAssistant, name: e.target.value })}
                placeholder="Name"
              />
              <Input
                value={editingAssistant.designation}
                onChange={(e) => setEditingAssistant({ ...editingAssistant, designation: e.target.value })}
                placeholder="Designation"
              />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowPasswordField(!showPasswordField)}
              >
                {showPasswordField ? "Cancel Password Change" : "Change Password"}
              </Button>

              {showPasswordField && (
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    className="absolute right-3 top-9 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </div>
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

      <Dialog open={!!confirmDeleteEmail} onOpenChange={() => setConfirmDeleteEmail(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
    </DialogHeader>
    <p>
      Are you sure you want to delete <strong>
        {assistants.find(a => a.email === confirmDeleteEmail)?.name}
      </strong>? This action cannot be undone.
    </p>
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="ghost" onClick={() => setConfirmDeleteEmail(null)}>Cancel</Button>
      <Button
        variant="destructive"
        onClick={() => {
          if (confirmDeleteEmail) {
            performDelete(confirmDeleteEmail);
            setConfirmDeleteEmail(null);
          }
        }}
      >
        Yes, Delete
      </Button>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default ManageAssistants;
