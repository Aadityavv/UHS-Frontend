import React, { useEffect, useState } from "react";
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
  PackageOpen,
  ChevronDown,
  ChevronUp,
  Truck,
} from "lucide-react";

interface Stock {
  id: string;
  location: {
    locId: string;
    locationName: string;
    latitude: string;
    longitude: string;
  };
  batchNumber: number | string;
  medicineName: string;
  composition: string;
  quantity: number | string;
  medicineType: string;
  expirationDate: string;
  company: string;
}

interface Location {
  locId: string;
  locationName: string;
  latitude: string;
  longitude: string;
}

interface TransferData {
  fromStock: Stock | null;
  toLocation: string;
  quantity: number | string;
}

const capitalize = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<string>("quantity");
  const [selectedLocationFilter, setSelectedLocationFilter] =
    useState<string>("all");
  const [expandedStockId, setExpandedStockId] = useState<string | null>(null);
  const [transferData, setTransferData] = useState<TransferData>({
    fromStock: null,
    toLocation: "",
    quantity: "",
  });
  const [showTransferModal, setShowTransferModal] = useState(false);

  const isMobile = useMobile();

  const handleEdit = (stock: Stock) => {
    setEditStock(stock);
    setExpandedStockId(stock.id);
  };

  const handleLocationChange = (value: string, isEditMode = false) => {
    const selectedLocation = locations.find(
      (loc: Location) => loc.locationName === value
    );
  
    if (selectedLocation) {
      if (isEditMode && editStock) {
        setEditStock({
          ...editStock,
          location: selectedLocation,
        });
      } else {
        setLocation(selectedLocation.locId);
      }
    }
  };
  
  const handleSaveEdit = async () => {
    if (editStock) {
      try {
        const token = localStorage.getItem("token");
        let role = localStorage.getItem("roles");

        if (role === "ad") role = role.toUpperCase();

        await axios.post(
          `https://uhs-backend.onrender.com/api/${role}/stock/editStock`,
          editStock,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Location": editStock.location.locId,
            },
          }
        );

        await fetchStocks();

        toast({
          title: "Success",
          description: "Stock updated successfully!",
        });
        setEditStock(null);
        setExpandedStockId(null);
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

  const getRowHighlightColor = (stock: Stock): string => {
    const quantity = Number(stock.quantity);
    const isLowQuantity = !isNaN(quantity) && quantity < 50;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(stock.expirationDate);
    expirationDate.setHours(0, 0, 0, 0);
    
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysFromNow = new Date(today.getTime() + thirtyDaysInMs);
    const isExpiringSoon = !isNaN(expirationDate.getTime()) && expirationDate <= thirtyDaysFromNow;
  
    if (isLowQuantity && isExpiringSoon) {
      return 'bg-blue-100 hover:bg-blue-200';
    } else if (isLowQuantity) {
      return 'bg-red-100 hover:bg-red-200';
    } else if (isExpiringSoon) {
      return 'bg-yellow-100 hover:bg-yellow-200';
    }
    return 'hover:bg-gray-50';
  };

  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem("token");
      let role = localStorage.getItem("roles");

      if (role === "ad") role = role.toUpperCase();

      const response = await axios.get(
        `https://uhs-backend.onrender.com/api/${role}/stock/`,
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
      const resp = await axios.get("https://uhs-backend.onrender.com/api/location");
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
        `https://uhs-backend.onrender.com/api/${role}/export`,
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
      location: {
        locId: "",
        locationName: "",
        latitude: "",
        longitude: ""
      }
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Stock
  ) => {
    if (newStock) {
      const value =
        field === "medicineName" ||
        field === "medicineType" ||
        field === "composition" ||
        field === "company"
          ? capitalize(e.target.value)
          : e.target.value;
  
      setNewStock({
        ...newStock,
        [field]: value,
      });
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Stock
  ) => {
    if (editStock) {
      const value =
        field === "medicineName" ||
        field === "medicineType" ||
        field === "composition" ||
        field === "company"
          ? capitalize(e.target.value)
          : e.target.value;

      setEditStock({
        ...editStock,
        [field]: value,
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
  
        const numericStock = {
          ...newStock,
          quantity: Number(newStock.quantity),
          batchNumber: Number(newStock.batchNumber),
          expirationDate: formatExpirationDateForSave(
            newStock.expirationDate as string
          ),
        };
  
        await axios.post(
          `https://uhs-backend.onrender.com/api/${role}/stock/addStock`,
          numericStock,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Location": location,
            },
          }
        );
  
        toast({
          title: "Success",
          description: "Stock updated successfully!",
        });
  
        setNewStock(null);
        fetchStocks();
      } catch (error: any) {
        console.error("Error adding stock:", error);
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
          `https://uhs-backend.onrender.com/api/${role}/stock/${batchNumber}`,
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
    setExpandedStockId(null);
  };

  const getSortedAndFilteredStocks = (stocks: Stock[]) => {
    let filteredByLocation = stocks;
    if (selectedLocationFilter !== "all") {
      filteredByLocation = stocks.filter(
        (stock) => stock.location.locationName === selectedLocationFilter
      );
    }

    const filteredBySearch = filteredByLocation.filter((stock) =>
      stock.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const toggleExpandStock = (stockId: string) => {
    if (expandedStockId === stockId) {
      setExpandedStockId(null);
      setEditStock(null);
    } else {
      setExpandedStockId(stockId);
    }
  };

  // Transfer Medicine Functions
  const handleInitiateTransfer = (stock: Stock) => {
    setTransferData({
      fromStock: stock,
      toLocation: "",
      quantity: "",
    });
    setShowTransferModal(true);
  };

  const handleTransferInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferData({
      ...transferData,
      quantity: e.target.value,
    });
  };

  const handleTransferLocationChange = (value: string) => {
    setTransferData({
      ...transferData,
      toLocation: value,
    });
  };

  const handleTransferSubmit = async () => {
    if (!transferData.fromStock || !transferData.toLocation || !transferData.quantity) {
      toast({
        title: "Error",
        description: "Please fill all transfer details",
        variant: "destructive",
      });
      return;
    }

    const quantity = Number(transferData.quantity);
    const currentQuantity = Number(transferData.fromStock.quantity);

    if (isNaN(quantity) || quantity <= 1) {
      toast({
        title: "Error",
        description: "Atleast 1 medicine should be left in this location",
        variant: "destructive",
      });
      return;
    }

    if (quantity > currentQuantity) {
      toast({
        title: "Error",
        description: "Transfer quantity cannot exceed available stock",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let role = localStorage.getItem("roles");

      if (role === "ad") role = role.toUpperCase();

      const toLocation = locations.find(loc => loc.locationName === transferData.toLocation);
      if (!toLocation) {
        throw new Error("Invalid destination location");
      }

      const updatedSourceStock = {
        ...transferData.fromStock,
        quantity: currentQuantity - quantity
      };
  
      await axios.post(
        `https://uhs-backend.onrender.com/api/${role}/stock/editStock`,
        updatedSourceStock,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Location": transferData.fromStock.location.locId,
          },
        }
      );
  
      // Step 2: Find or create stock at destination location
      const existingDestinationStock = stocks.find(
        stock => 
          stock.medicineName === transferData.fromStock?.medicineName &&
          stock.batchNumber === transferData.fromStock?.batchNumber &&
          stock.location.locId === toLocation.locId
      );
  
      if (existingDestinationStock) {
        // Update existing stock at destination
        const updatedDestinationStock = {
          ...existingDestinationStock,
          quantity: Number(existingDestinationStock.quantity) + quantity
        };
  
        await axios.post(
          `https://uhs-backend.onrender.com/api/${role}/stock/editStock`,
          updatedDestinationStock,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Location": toLocation.locId,
            },
          }
        );
      } else {
        // Create new stock at destination
        const newDestinationStock = {
          ...transferData.fromStock,
          id: "", // Let backend generate new ID
          quantity: quantity,
          location: toLocation
        };
  
        await axios.post(
          `https://uhs-backend.onrender.com/api/${role}/stock/addStock`,
          newDestinationStock,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Location": toLocation.locId,
            },
          }
        );
      }
  

      toast({
        title: "Success",
        description: `Transferred ${quantity} units of ${transferData.fromStock.medicineName} to ${transferData.toLocation}`,
      });

      setShowTransferModal(false);
      fetchStocks();
    } catch (error: any) {
      console.error("Error transferring stock:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to transfer stock",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderDesktopView = () => (
    <>
    <div>
    <Table className="border-none">
      <TableHeader className="bg-gray-50">
        <TableRow>
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
            Quantity{" "}
            {sortColumn === "quantity" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead className="text-gray-600 font-semibold">Type</TableHead>
          <TableHead
            className="text-gray-600 font-semibold cursor-pointer"
            onClick={() => handleSort("expirationDate")}
          >
            Expiry{" "}
            {sortColumn === "expirationDate" &&
              (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead className="text-gray-600 font-semibold">Company</TableHead>
          <TableHead className="text-gray-600 font-semibold">
            Location
          </TableHead>
          <TableHead className="text-gray-600 font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredStocks.map((stock) => (
          <TableRow 
            key={stock.id} 
            className={`${getRowHighlightColor(stock)}`}
          >
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
                  onChange={(e) => handleEditInputChange(e, "batchNumber")}
                />
              ) : (
                stock.batchNumber
              )}
            </TableCell>
            <TableCell className="text-gray-700">
              {editStock?.id === stock.id ? (
                <Input
                  value={editStock.medicineName}
                  onChange={(e) => handleEditInputChange(e, "medicineName")}
                />
              ) : (
                stock.medicineName
              )}
            </TableCell>
            <TableCell className="text-gray-700">
              {editStock?.id === stock.id ? (
                <Input
                  value={editStock.composition}
                  onChange={(e) => handleEditInputChange(e, "composition")}
                />
              ) : (
                stock.composition
              )}
            </TableCell>
            <TableCell className="text-gray-700">
              {editStock?.id === stock.id ? (
                <Input
                  value={editStock.quantity.toString()}
                  onChange={(e) => handleEditInputChange(e, "quantity")}
                />
              ) : (
                stock.quantity
              )}
            </TableCell>
            <TableCell className="text-gray-700">
              {editStock?.id === stock.id ? (
                <Input
                  value={editStock.medicineType}
                  onChange={(e) => handleEditInputChange(e, "medicineType")}
                />
              ) : (
                stock.medicineType
              )}
            </TableCell>
            <TableCell className="text-gray-700">
              {editStock?.id === stock.id ? (
                <Input
                  type="date"
                  value={editStock.expirationDate}
                  onChange={(e) =>
                    setEditStock({
                      ...editStock,
                      expirationDate: e.target.value,
                    })
                  }
                />
              ) : (
                formatExpirationDateForDisplay(stock.expirationDate)
              )}
            </TableCell>
            <TableCell className="text-gray-700">
              {editStock?.id === stock.id ? (
                <Input
                  value={editStock.company}
                  onChange={(e) => handleEditInputChange(e, "company")}
                />
              ) : (
                stock.company
              )}
            </TableCell>
            <TableCell className="text-gray-700">
              {editStock?.id === stock.id ? (
                <Select
                  onValueChange={(value) => handleLocationChange(value, true)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={editStock.location?.locationName || "Select location"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.locId} value={loc.locationName}>
                        {loc.locationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                stock.location?.locationName || "N/A"
              )}
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
                  <Truck
                    className="h-5 w-5 text-purple-600 cursor-pointer"
                    onClick={() => handleInitiateTransfer(stock)}
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
                onChange={(e) => handleInputChange(e, "batchNumber")}
              />
            </TableCell>
            <TableCell>
              <Input
                value={newStock.medicineName}
                onChange={(e) => handleInputChange(e, "medicineName")}
              />
            </TableCell>
            <TableCell>
              <Input
                value={newStock.composition}
                onChange={(e) => handleInputChange(e, "composition")}
              />
            </TableCell>
            <TableCell>
              <Input
                value={newStock.quantity.toString()}
                onChange={(e) => handleInputChange(e, "quantity")}
              />
            </TableCell>
            <TableCell>
              <Input
                value={newStock.medicineType}
                onChange={(e) => handleInputChange(e, "medicineType")}
              />
            </TableCell>
            <TableCell>
              <Input
                type="date"
                value={newStock.expirationDate}
                onChange={(e) => handleInputChange(e, "expirationDate")}
              />
            </TableCell>
            <TableCell>
              <Input
                value={newStock.company}
                onChange={(e) => handleInputChange(e, "company")}
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
    </div>
    </>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
      {filteredStocks.map((stock) => (
        <div
          key={stock.id}
          className={`${getRowHighlightColor(stock).replace('hover:', '')} p-3 rounded-lg shadow-sm border border-gray-100`}
        >
          {/* Compact View */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpandStock(stock.id)}
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                checked={selectedStocks.has(stock.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectStock(stock.id);
                }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {stock.medicineName}
                </p>
                <p className="text-xs text-gray-500">
                  Batch: {stock.batchNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {stock.location?.locationName || "N/A"}
              </span>
              {expandedStockId === stock.id ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
  
          {/* Expanded View */}
          {expandedStockId === stock.id && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
              {editStock?.id === stock.id ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Added Batch Number field */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Batch No.
                      </label>
                      <Input
                        className="w-full"
                        value={editStock.batchNumber.toString()}
                        onChange={(e) => handleEditInputChange(e, "batchNumber")}
                      />
                    </div>
                    
                    {/* Added Medicine Name field */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Medicine Name
                      </label>
                      <Input
                        className="w-full"
                        value={editStock.medicineName}
                        onChange={(e) => handleEditInputChange(e, "medicineName")}
                      />
                    </div>
  
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Composition
                      </label>
                      <Input
                        className="w-full"
                        value={editStock.composition}
                        onChange={(e) => handleEditInputChange(e, "composition")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <Input
                        className="w-full"
                        value={editStock.quantity.toString()}
                        onChange={(e) => handleEditInputChange(e, "quantity")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <Input
                        className="w-full"
                        value={editStock.medicineType}
                        onChange={(e) => handleEditInputChange(e, "medicineType")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Expiry
                      </label>
                      <Input
                        type="date"
                        className="w-full"
                        value={editStock.expirationDate}
                        onChange={(e) =>
                          setEditStock({
                            ...editStock,
                            expirationDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <Input
                        className="w-full"
                        value={editStock.company}
                        onChange={(e) => handleEditInputChange(e, "company")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <Select
                        onValueChange={(value) => handleLocationChange(value, true)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={editStock.location?.locationName || "Select location"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.locId} value={loc.locationName}>
                              {loc.locationName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded flex items-center"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Batch No.</p>
                      <p className="text-sm">{stock.batchNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Medicine Name</p>
                      <p className="text-sm">{stock.medicineName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Composition</p>
                      <p className="text-sm">{stock.composition}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Quantity</p>
                      <p className="text-sm">{stock.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Type</p>
                      <p className="text-sm">{stock.medicineType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Expiry</p>
                      <p className="text-sm">{formatExpirationDateForDisplay(stock.expirationDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Company</p>
                      <p className="text-sm">{stock.company}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Location</p>
                      <p className="text-sm">{stock.location?.locationName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => handleEdit(stock)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded flex items-center"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleInitiateTransfer(stock)}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded flex items-center"
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Transfer
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    
      {/* New Stock Row for Mobile - remains unchanged */}
      {newStock && (
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Batch No.
                </label>
                <Input
                  className="w-full"
                  value={newStock.batchNumber.toString()}
                  onChange={(e) => handleInputChange(e, "batchNumber")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Medicine
                </label>
                <Input
                  className="w-full"
                  value={newStock.medicineName}
                  onChange={(e) => handleInputChange(e, "medicineName")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Composition
                </label>
                <Input
                  className="w-full"
                  value={newStock.composition}
                  onChange={(e) => handleInputChange(e, "composition")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <Input
                  className="w-full"
                  value={newStock.quantity.toString()}
                  onChange={(e) => handleInputChange(e, "quantity")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Input
                  className="w-full"
                  value={newStock.medicineType}
                  onChange={(e) => handleInputChange(e, "medicineType")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expiry
                </label>
                <Input
                  type="date"
                  className="w-full"
                  value={newStock.expirationDate}
                  onChange={(e) => handleInputChange(e, "expirationDate")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Company
                </label>
                <Input
                  className="w-full"
                  value={newStock.company}
                  onChange={(e) => handleInputChange(e, "company")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Select onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-full">
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
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

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
              <h1 className="text-3xl font-bold text-gray-900">
                Medicine Stock Management
              </h1>
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
                {selectedStocks.size > 0 ? (
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors flex-1"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Selected ({selectedStocks.size})
                  </button>
                ) : (
                  !editStock && !newStock && (
                    <button
                      onClick={handleAddNewRow}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors flex-1"
                    >
                      <Plus className="h-5 w-5" />
                      Add New
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Table Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {isMobile ? renderMobileView() : renderDesktopView()}

              {filteredStocks.length === 0 && !newStock && (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <PackageOpen className="h-12 w-12 text-gray-400 mb-4" />
                  No medicines found in stock
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && transferData.fromStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Transfer {transferData.fromStock.medicineName}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Location
                </label>
                <Input
                  value={transferData.fromStock.location?.locationName || "N/A"}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Location
                </label>
                <Select
                  onValueChange={handleTransferLocationChange}
                  value={transferData.toLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter(
                        (loc) =>
                          loc.locId !== transferData.fromStock?.location.locId
                      )
                      .map((loc) => (
                        <SelectItem key={loc.locId} value={loc.locationName}>
                          {loc.locationName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (Available: {transferData.fromStock.quantity})
                </label>
                <Input
                  type="number"
                  value={transferData.quantity.toString()}
                  onChange={handleTransferInputChange}
                  min="1"
                  max={transferData.fromStock.quantity}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicineStock;