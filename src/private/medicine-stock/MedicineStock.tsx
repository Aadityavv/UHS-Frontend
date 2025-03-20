import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  Download,
  Search,
  Sliders,
  PackageOpen
} from "lucide-react";

interface Stock {
  id: string;
  location: any;
  batchNumber: number | string;
  medicineName: string;
  composition: string;
  quantity: number | string;
  medicineType: string;
  expirationDate: string;
  company: string;
}

const MedicineStock = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [editStock, setEditStock] = useState<Stock | null>(null);
  const { toast } = useToast();
  const [newStock, setNewStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStocks, setSelectedStocks] = useState<Set<number | string>>(
    new Set()
  );
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState<
    Array<{
      locId: string;
      locationName: string;
      latitude: string;
      longitude: string;
    }>
  >([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<string>("quantity");
  const [selectedLocationFilter, setSelectedLocationFilter] =
    useState<string>("all");

  const handleEdit = (stock: Stock) => {
    setEditStock(stock);
  };

  const handleLocationChange = (value: string) => {
    const selectedLocation = locations.find(
      (loc) => loc.locationName === value
    );
    if (selectedLocation) {
      setLocation(selectedLocation.locId);
    }
  };

  const handleSaveEdit = async () => {
    if (editStock) {
      try {
        const token = localStorage.getItem("token");
        let role = localStorage.getItem("roles");

        if (role === "ad") role = role.toUpperCase();

        console.log(editStock);

        await axios.post(
          `https://uhs-backend.onrender.com//api/${role}/stock/editStock`,
          editStock,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Location": editStock.location.locId,
            },
          }
        );

        setStocks((prevStocks) =>
          prevStocks.map((stock) =>
            stock.id === editStock.id ? editStock : stock
          )
        );
        toast({
          title: "Success",
          description: "Stock updated successfully!",
        });
        setEditStock(null);
      } catch (error: any) {
        console.error("Error updating stock:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to update stock.",
          variant: "destructive",
        });
      }
    }
  };

  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem("token");
      let role = localStorage.getItem("roles");

      if (role === "ad") role = role.toUpperCase();

      const response = await axios.get(
        `https://uhs-backend.onrender.com//api/${role}/stock/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStocks(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const resp = await axios.get("https://uhs-backend.onrender.com//api/location/");
      if (resp.status === 200) {
        const data = resp.data;
        setLocations(data);
      } else {
        toast({
          title: "Error",
          description: resp.data.message,
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Error in fetching locations. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchStocks();
  }, []);

  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      let role = localStorage.getItem("roles");

      if (role === "ad") role = role.toUpperCase();

      const response = await axios.get(
        `https://uhs-backend.onrender.com//api/${role}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: response.headers["Content-Type"]?.toString(),
        })
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = "medicine_stocks.xlsx";
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        variant: "default",
        title: "Success",
        description: "Excel downloaded Successdully",
      });
    } catch (err: any) {
      return toast({
        title: "Error",
        description: err.response?.data?.message,
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleAddNewRow = () => {
    setNewStock({
      id: "",
      batchNumber: "",
      medicineName: "",
      composition: "",
      quantity: "",
      medicineType: "",
      expirationDate: "",
      company: "",
      location: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Stock
  ) => {
    if (newStock) {
      setNewStock({
        ...newStock,
        [field]: e.target.value,
      });
    }
  };

  const formatExpirationDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatExpirationDateForSave = (dateString: string) => {
    const month = dateString.split("/");
    return month.join("-");
  };

  const handleSave = async () => {
    if (newStock) {
      try {
        const token = localStorage.getItem("token");
        let role = localStorage.getItem("roles");

        if (role === "ad") role = role.toUpperCase();

        const formattedNewStock = {
          ...newStock,
          expirationDate: formatExpirationDateForSave(
            newStock.expirationDate as string
          ),
        };

        await axios.post(
          `https://uhs-backend.onrender.com//api/${role}/stock/addStock`,
          formattedNewStock,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Location": location,
            },
          }
        );
        setNewStock(null);
        toast({
          title: "Success",
          description: "New stock added successfully!",
        });
        fetchLocations();
        fetchStocks();
      } catch (error: any) {
        console.error("Error adding new stock:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message,
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    let role = localStorage.getItem("roles");

    if (role === "ad") role = role.toUpperCase();

    for (const batchNumber of selectedStocks) {
      try {
        await axios.delete(
          `https://uhs-backend.onrender.com//api/${role}/stock/${batchNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast({
          title: "Deleted",
          description: `Stock deleted successfully!`,
        });

        await fetchStocks();
      } catch (error) {
        console.error("Error deleting stock:", error);
        toast({
          title: "Error",
          description: `Failed to delete stock.`,
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    }

    setSelectedStocks(new Set());
  };

  const handleCancel = () => {
    setNewStock(null);
    setEditStock(null);
  };

  const getSortedAndFilteredStocks = (stocks: Stock[]) => {
    // First filter by location if a specific location is selected
    let filteredByLocation = stocks;
    if (selectedLocationFilter !== "all") {
      filteredByLocation = stocks.filter(
        (stock) => stock.location.locationName === selectedLocationFilter
      );
    }

    // Then filter by search term
    const filteredBySearch = filteredByLocation.filter(
      (stock) =>
        stock.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    // Finally sort
    return [...filteredBySearch].sort((a, b) => {
      if (sortColumn === "quantity") {
        const qtyA = Number(a.quantity) || 0;
        const qtyB = Number(b.quantity) || 0;
        return sortDirection === "asc" ? qtyA - qtyB : qtyB - qtyA;
      }
      if (sortColumn === "expirationDate") {
        const dateA = new Date(a.expirationDate).getTime();
        const dateB = new Date(b.expirationDate).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const filteredStocks = getSortedAndFilteredStocks(stocks);

  const handleSelectStock = (batchNumber: number | string) => {
    const updatedSelection = new Set(selectedStocks);
    if (updatedSelection.has(batchNumber)) {
      updatedSelection.delete(batchNumber);
    } else {
      updatedSelection.add(batchNumber);
    }
    setSelectedStocks(updatedSelection);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Medicine Stock Management</h1>
              <button
                onClick={handleDownloadExcel}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Export Excel
              </button>
            </div>

            {/* Filters Section */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex items-center">
                <Search className="h-5 w-5 text-gray-400 ml-2" />
                <Input
                  className="border-0 focus-visible:ring-0"
                  placeholder="Search medicine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={selectedLocationFilter}
                onValueChange={setSelectedLocationFilter}
              >
                <SelectTrigger className="bg-white text-black h-full">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-gray-400" />
                    <SelectValue placeholder="Filter by Location" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectGroup>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc.locId} value={loc.locationName}>
                        {loc.locationName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                {selectedStocks.size === 0 && !editStock && !newStock && (
                  <button
                    onClick={handleAddNewRow}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors flex-1"
                  >
                    <Plus className="h-5 w-5" />
                    Add New
                  </button>
                )}
              </div>
            </div>

            {/* Table Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <Table className="border-none">
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[5%] text-gray-600 font-semibold">
                      Select
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold">
                      Batch No.
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold">
                      Medicine
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold">
                      Composition
                    </TableHead>
                    <TableHead
                      className="text-gray-600 font-semibold cursor-pointer"
                      onClick={() => handleSort("quantity")}
                    >
                      Quantity {sortColumn === "quantity" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold">
                      Type
                    </TableHead>
                    <TableHead
                      className="text-gray-600 font-semibold cursor-pointer"
                      onClick={() => handleSort("expirationDate")}
                    >
                      Expiry {sortColumn === "expirationDate" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold">
                      Company
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold">
                      Location
                    </TableHead>
                    <TableHead className="text-gray-600 font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.id} className="hover:bg-gray-50">
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          checked={selectedStocks.has(stock.id)}
                          onChange={() => handleSelectStock(stock.id)}
                        />
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <Input
                            value={editStock.batchNumber.toString()}
                            onChange={(e) => setEditStock({
                              ...editStock,
                              batchNumber: e.target.value
                            })}
                          />
                        ) : stock.batchNumber}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <Input
                            value={editStock.medicineName}
                            onChange={(e) => setEditStock({
                              ...editStock,
                              medicineName: e.target.value
                            })}
                          />
                        ) : stock.medicineName}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <Input
                            value={editStock.composition}
                            onChange={(e) => setEditStock({
                              ...editStock,
                              composition: e.target.value
                            })}
                          />
                        ) : stock.composition}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <Input
                            value={editStock.quantity.toString()}
                            onChange={(e) => setEditStock({
                              ...editStock,
                              quantity: e.target.value
                            })}
                          />
                        ) : stock.quantity}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <Input
                            value={editStock.medicineType}
                            onChange={(e) => setEditStock({
                              ...editStock,
                              medicineType: e.target.value
                            })}
                          />
                        ) : stock.medicineType}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <Input
                            type="date"
                            value={editStock.expirationDate}
                            onChange={(e) => setEditStock({
                              ...editStock,
                              expirationDate: e.target.value
                            })}
                          />
                        ) : formatExpirationDateForDisplay(stock.expirationDate)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <Input
                            value={editStock.company}
                            onChange={(e) => setEditStock({
                              ...editStock,
                              company: e.target.value
                            })}
                          />
                        ) : stock.company}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {stock.location?.locationName || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {editStock?.id === stock.id ? (
                          <div className="flex gap-2">
                            <Save
                              className="h-5 w-5 text-green-600 cursor-pointer"
                              onClick={handleSaveEdit}
                            />
                            <X
                              className="h-5 w-5 text-red-600 cursor-pointer"
                              onClick={handleCancel}
                            />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Pencil
                              className="h-5 w-5 text-blue-600 cursor-pointer"
                              onClick={() => handleEdit(stock)}
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {newStock && (
                    <TableRow className="bg-blue-50">
                      <TableCell></TableCell>
                      <TableCell>
                        <Input
                          value={newStock.batchNumber.toString()}
                          onChange={(e) => handleInputChange(e, 'batchNumber')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newStock.medicineName}
                          onChange={(e) => handleInputChange(e, 'medicineName')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newStock.composition}
                          onChange={(e) => handleInputChange(e, 'composition')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newStock.quantity.toString()}
                          onChange={(e) => handleInputChange(e, 'quantity')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newStock.medicineType}
                          onChange={(e) => handleInputChange(e, 'medicineType')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={newStock.expirationDate}
                          onChange={(e) => handleInputChange(e, 'expirationDate')}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newStock.company}
                          onChange={(e) => handleInputChange(e, 'company')}
                        />
                      </TableCell>
                      <TableCell>
                        <Select onValueChange={handleLocationChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc.locId} value={loc.locationName}>
                                {loc.locationName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Save
                            className="h-5 w-5 text-green-600 cursor-pointer"
                            onClick={handleSave}
                          />
                          <X
                            className="h-5 w-5 text-red-600 cursor-pointer"
                            onClick={handleCancel}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredStocks.length === 0 && !newStock && (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <PackageOpen className="h-12 w-12 text-gray-400 mb-4" />
                  No medicines found in stock
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {selectedStocks.size > 0 && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Selected ({selectedStocks.size})
                </button>
              )}

              {/* {editStock && (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    Cancel
                  </button>
                </>
              )} */}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default MedicineStock;