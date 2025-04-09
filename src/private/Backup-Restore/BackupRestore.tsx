import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Database, Download, Cloud, HardDrive, ShieldAlert } from "lucide-react";
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
      link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Backup Successful",
        description: "All system data has been successfully backed up.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "An error occurred while creating the backup.",
        variant: "destructive",
      });
      console.error("Backup error:", error);
    } finally {
      setLoading(prev => ({...prev, backup: false}));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center space-x-3 mb-8">
        <Database className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Backup & Restore</h1>
          <p className="text-gray-500">Manage system data backups and restoration</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-1 gap-8">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4 mb-5">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Create System Backup</h2>
              <p className="text-gray-500 text-sm">Current version: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Download a complete backup of all system data including patient records, 
            user accounts, and configurations. Backups are encrypted for security.
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleBackup}
              disabled={loading.backup}
              className="w-full"
              size="lg"
            >
              {loading.backup ? (
                <span className="flex items-center">
                  <Cloud className="h-4 w-4 mr-2 animate-pulse" />
                  Creating Backup...
                </span>
              ) : (
                <span className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </span>
              )}
            </Button>
            <div className="flex items-center text-sm text-gray-500">
              <HardDrive className="h-4 w-4 mr-2" />
              <span>Last backup: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice Section */}
      <div className="mt-10 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                • Backups contain sensitive data. Store them securely.
                <br />
                • Restoration will log out all users and may cause temporary downtime.
                <br />
                • Perform backups regularly for data safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;