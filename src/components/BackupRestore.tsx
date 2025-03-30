import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Database, Download, Upload } from "lucide-react";
import { useState } from "react";

const BackupRestore = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({
    backup: false,
    restore: false
  });

  const handleBackup = async () => {
    try {
      setLoading(prev => ({...prev, backup: true}));
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        "https://uhs-backend.onrender.com/api/admin/backup",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Success",
        description: "Backup created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
      console.error("Backup error:", error);
    } finally {
      setLoading(prev => ({...prev, backup: false}));
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setLoading(prev => ({...prev, restore: true}));
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('file', file);
      
      await axios.post(
        "https://uhs-backend.onrender.com/api/admin/restore",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      toast({
        title: "Success",
        description: "System restored successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore system",
        variant: "destructive",
      });
      console.error("Restore error:", error);
    } finally {
      setLoading(prev => ({...prev, restore: false}));
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Database className="h-8 w-8 text-amber-600" />
        <h1 className="text-2xl font-bold">Backup & Restore</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Create Backup</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Download a complete backup of the system data including all patient records, 
            user accounts, and system configurations.
          </p>
          <Button 
            onClick={handleBackup}
            disabled={loading.backup}
          >
            {loading.backup ? "Creating Backup..." : "Download Backup"}
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Restore System</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Upload a previous backup file to restore the system to a previous state. 
            This will overwrite all current data.
          </p>
          <input
            type="file"
            id="restoreFile"
            accept=".zip"
            onChange={handleRestore}
            className="hidden"
            disabled={loading.restore}
          />
          <label htmlFor="restoreFile">
            <Button asChild variant="outline" disabled={loading.restore}>
              <div>
                {loading.restore ? "Restoring..." : "Select Backup File"}
              </div>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;