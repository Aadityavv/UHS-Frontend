import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Users, FileSpreadsheet, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const ImportStudents = () => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file before uploading.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const response = await axios.post(
        "https://uhs-backend.onrender.com/api/admin/import-students",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Import Successful",
        description: response.data?.message || "Patients have been added successfully.",
        variant: "default",
      });
      setCsvFile(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was an error while importing the CSV. Please try again.",
        variant: "destructive",
      });
      console.error("Import error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center space-x-3 mb-8">
        <Users className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Import Patients</h1>
          <p className="text-gray-500">Bulk upload patient records from a CSV file</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4 mb-5">
          <div className="p-3 bg-green-50 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Upload CSV File</h2>
            <p className="text-gray-500 text-sm">Ensure the CSV contains valid patient data columns.</p>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVChange}
            className="text-sm text-gray-700 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <Button
            onClick={handleImport}
            disabled={loading || !csvFile}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Import Patients
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-10 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">CSV Format Guidelines</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                • File must be in `.csv` format.<br />
                • Required columns: `name`, `email`, `sapId`, `dob`, `branch`, `year`, etc.<br />
                • Duplicate entries (same SAP ID) will be skipped automatically.<br />
                • Maximum file size: 2MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportStudents;
