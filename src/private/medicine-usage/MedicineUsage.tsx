import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiSearch, FiCalendar, FiUser, FiClock } from "react-icons/fi";
import { Pill } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface MedicineUsage {
  medicineName: string;
  dosage: string;
  duration: string;
  prescribedBy: string;
  patientName: string;
  prescriptionTime: string;
  totalQuantity?: number;
}

const parseDosage = (dosage: string): number => {
  const dosageValues = dosage.split(',').map(item => {
    const value = item.split(':')[1].trim();
    return parseFloat(value) || 0;
  });
  return dosageValues.reduce((sum, val) => sum + val, 0);
};

const MedicineUsage: React.FC = () => {
  const [medicines, setMedicines] = useState<string[]>([]);
  const [usageDetails, setUsageDetails] = useState<MedicineUsage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { medicineName } = useParams();

  useEffect(() => {
    const fetchMedicineNames = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://uhs-backend.onrender.com/api/medicine/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setMedicines(response.data);
      } catch (error) {
        console.error("Failed to fetch medicine names:", error);
      }
    };
    fetchMedicineNames();
  }, []);

  useEffect(() => {
    if (medicineName) {
      const fetchMedicineUsage = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `https://uhs-backend.onrender.com/api/medicine/usage/${medicineName}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
          const dataWithQuantity = response.data.map((usage: MedicineUsage) => ({
            ...usage,
            totalQuantity: parseDosage(usage.dosage) * parseInt(usage.duration),
          }));
          setUsageDetails(dataWithQuantity);
        } catch (error) {
          console.error("Failed to fetch medicine usage:", error);
        }
      };
      fetchMedicineUsage();
    } else {
      setUsageDetails([]);
    }
  }, [medicineName]);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {medicineName ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <button
                  onClick={() => navigate("/admin/medicine-usage")}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <FiArrowLeft className="text-lg" />
                  <span className="font-semibold">Back to Medicines</span>
                </button>
                <h1 className="mt-4 text-3xl font-bold flex items-center gap-3 truncate">
                  <Pill className="text-2xl flex-shrink-0" />
                  <span className="truncate">{medicineName}</span>
                </h1>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="text-sm opacity-80">Total Prescriptions</div>
                    <div className="text-2xl font-bold">{usageDetails.length}</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="text-sm opacity-80">Total Quantity</div>
                    <div className="text-2xl font-bold">
                      {usageDetails.reduce((sum, item) => sum + (item.totalQuantity || 0), 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-medium text-gray-600 min-w-[180px]">
                          <FiUser className="inline mr-2" />Patient
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-600 min-w-[180px]">
                          Prescribed By
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-600">
                          Dosage
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-600">
                          <FiCalendar className="inline mr-2" />Duration
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-600">
                          Total Quantity
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-gray-600">
                          <FiClock className="inline mr-2" />Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usageDetails.map((usage, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm font-medium text-gray-800 truncate max-w-[180px]">
                            {usage.patientName}
                          </td>
                          <td className="p-4 text-sm text-gray-600 truncate max-w-[180px]">
                            {usage.prescribedBy}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md whitespace-nowrap">
                              {usage.dosage}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                            {usage.duration} days
                          </td>
                          <td className="p-4 text-sm font-semibold text-blue-600 whitespace-nowrap">
                            {usage.totalQuantity} units
                          </td>
                          <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                            {new Date(usage.prescriptionTime).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usageDetails.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No prescription records found for this medicine.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Pill className="text-2xl text-purple-600" />
                    Medicine Directory
                  </h1>
                  <div className="relative w-full md:w-96">
                    <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedicines.map((medicine) => (
                    <div
                      key={medicine}
                      className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-4 shadow hover:shadow-lg cursor-pointer transition-shadow flex flex-col items-center"
                      onClick={() => navigate(`/admin/medicine-usage/${medicine}`)}
                    >
                      <Pill className="h-8 w-8 text-purple-600 mb-2" />
                      <span className="font-semibold text-lg text-gray-800 truncate w-full text-center">
                        {medicine}
                      </span>
                    </div>
                  ))}
                  {filteredMedicines.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No medicines found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MedicineUsage;