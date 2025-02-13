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
import Shared from "@/Shared";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/${role}/stock/editStock`,
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
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/${role}/stock/`,
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
      const resp = await axios.get("http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/location/");
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
        `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/${role}/export`,
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
          `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/${role}/stock/addStock`,
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
          `http://ec2-13-201-227-93.ap-south-1.compute.amazonaws.com/api/${role}/stock/${batchNumber}`,
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
        stock.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.company.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="bg-[#ECECEC] min-h-[84svh] p-8 space-y-8 flex flex-col max-lg:h-[93svh] max-lg:p-4">
        <div className="flex gap-4">
          <div className="flex w-full space-x-2 items-center">
            {Shared.Search}
            <Input
              className="bg-white"
              placeholder="Search Medicine"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-64">
            <Select
              value={selectedLocationFilter}
              onValueChange={setSelectedLocationFilter}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                <SelectGroup>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="UPES Bidholi Campus">
                    UPES Bidholi Campus
                  </SelectItem>
                  <SelectItem value="UPES Kandoli Campus">
                    UPES Kandoli Campus
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-full overflow-y-scroll">
          {stocks.length > 0 || newStock ? (
            <Table className="bg-white rounded-md">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[5%] border text-black font-bold text-center">
                    Select
                  </TableHead>
                  <TableHead className="w-[8%] border text-black font-bold text-center whitespace-nowrap">
                    Batch no.
                  </TableHead>
                  <TableHead className="w-[15%] border text-black font-bold text-center">
                    Medicine
                  </TableHead>
                  <TableHead className="w-[15%] border text-black font-bold text-center">
                    Composition
                  </TableHead>
                  <TableHead
                    className="w-[8%] border text-black font-bold text-center cursor-pointer"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity{" "}
                    {sortColumn === "quantity" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="w-[10%] border text-black font-bold text-center">
                    Type
                  </TableHead>
                  <TableHead
                    className="w-[10%] border text-black font-bold text-center cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("expirationDate")}
                  >
                    Expiration Date{" "}
                    {sortColumn === "expirationDate" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="w-[14%] border text-black font-bold text-center">
                    Company
                  </TableHead>
                  <TableHead className="w-[15%] border text-black font-bold text-center">
                    Location
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.map((stock) => (
                  <TableRow key={stock.id} className="text-center">
                    <TableCell className="border whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStocks.has(stock.id)}
                        onChange={() => handleSelectStock(stock.id)}
                      />
                    </TableCell>
                    {editStock && editStock.id === stock.id ? (
                      <TableCell className="border whitespace-nowrap">
                        <Input
                          value={editStock.batchNumber}
                          type="number"
                          onChange={(e) =>
                            setEditStock({
                              ...editStock,
                              batchNumber: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                    ) : (
                      <TableCell className="border whitespace-nowrap">
                        {stock.batchNumber}
                      </TableCell>
                    )}
                    <TableCell className="border whitespace-nowrap">
                      {editStock && editStock.id === stock.id ? (
                        <Input
                          value={editStock.medicineName}
                          onChange={(e) =>
                            setEditStock({
                              ...editStock,
                              medicineName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        stock.medicineName
                      )}
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      {editStock && editStock.id === stock.id ? (
                        <Input
                          value={editStock.composition}
                          onChange={(e) =>
                            setEditStock({
                              ...editStock,
                              composition: e.target.value,
                            })
                          }
                        />
                      ) : (
                        stock.composition
                      )}
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      {editStock && editStock.id === stock.id ? (
                        <Input
                          value={editStock.quantity}
                          type="number"
                          onChange={(e) =>
                            setEditStock({
                              ...editStock,
                              quantity: e.target.value,
                            })
                          }
                        />
                      ) : (
                        stock.quantity
                      )}
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      {editStock && editStock.id === stock.id ? (
                        <Input
                          value={editStock.medicineType}
                          onChange={(e) =>
                            setEditStock({
                              ...editStock,
                              medicineType: e.target.value,
                            })
                          }
                        />
                      ) : (
                        stock.medicineType
                      )}
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      {editStock && editStock.id === stock.id ? (
                        <Input
                          value={editStock.expirationDate}
                          type="date"
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
                    <TableCell className="border whitespace-nowrap">
                      {editStock && editStock.id === stock.id ? (
                        <Input
                          value={editStock.company}
                          onChange={(e) =>
                            setEditStock({
                              ...editStock,
                              company: e.target.value,
                            })
                          }
                        />
                      ) : (
                        stock.company
                      )}
                    </TableCell>

                    <TableCell className="border whitespace-nowrap">
                      {editStock && editStock.id === stock.id ? (
                        <Select
                          value={editStock.location?.locId || ""}
                          onValueChange={(value) =>
                            setEditStock({
                              ...editStock,
                              location:
                                locations.find((loc) => loc.locId === value) ||
                                editStock.location,
                            })
                          }
                        >
                          <SelectTrigger className="bg-white text-black">
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-black">
                            <SelectGroup>
                              {locations.map((loc) => (
                                <SelectItem key={loc.locId} value={loc.locId}>
                                  {loc.locationName}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        stock.location.locationName || "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {newStock && (
                  <TableRow className="text-center">
                    <TableCell className="border whitespace-nowrap">
                      <input type="checkbox" disabled />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Input
                        value={newStock.batchNumber}
                        type="number"
                        onChange={(e) => handleInputChange(e, "batchNumber")}
                      />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Input
                        value={newStock.medicineName}
                        onChange={(e) => handleInputChange(e, "medicineName")}
                      />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Input
                        value={newStock.composition}
                        onChange={(e) => handleInputChange(e, "composition")}
                      />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Input
                        value={newStock.quantity}
                        type="number"
                        onChange={(e) => handleInputChange(e, "quantity")}
                      />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Input
                        value={newStock.medicineType}
                        onChange={(e) => handleInputChange(e, "medicineType")}
                      />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Input
                        type="date"
                        value={newStock.expirationDate}
                        onChange={(e) => handleInputChange(e, "expirationDate")}
                      />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Input
                        value={newStock.company}
                        onChange={(e) => handleInputChange(e, "company")}
                      />
                    </TableCell>
                    <TableCell className="border whitespace-nowrap">
                      <Select onValueChange={handleLocationChange}>
                        <SelectTrigger className="bg-white text-black">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          <SelectGroup className="h-[4rem] overflow-y-scroll">
                            {locations.map((loc) => (
                              <SelectItem
                                key={loc.locationName}
                                value={loc.locationName}
                              >
                                {loc.locationName}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500">
              No medicine in the stock
            </div>
          )}
        </div>
        <div className="flex items-center max-lg:justify-center">
          <div className="flex items-center gap-4 max-lg:gap-2">
            {selectedStocks.size === 0 && !editStock && !newStock && (
              <button
                onClick={handleAddNewRow}
                className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
              >
                Add
                {Shared.SquarePlus}
              </button>
            )}
            {selectedStocks.size > 0 && !newStock && !editStock && (
              <button
                className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
                onClick={handleDelete}
              >
                Delete
                {Shared.TrashCan}
              </button>
            )}
            {selectedStocks.size === 1 && !editStock && !newStock && (
              <button
                onClick={() => {
                  const selectedStock = stocks.find(
                    (stock) => stock.id === Array.from(selectedStocks)[0]
                  );
                  if (selectedStock) handleEdit(selectedStock);
                }}
                className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
              >
                Edit
                {Shared.Edit}
              </button>
            )}
            {editStock && (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
                >
                  Save
                  {Shared.Save}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
                >
                  Cancel
                  {Shared.Cancel}
                </button>
              </>
            )}
            {newStock && (
              <>
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
                >
                  Save
                  {Shared.Save}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
                >
                  Cancel
                  {Shared.Cancel}
                </button>
              </>
            )}
            <button
              onClick={handleDownloadExcel}
              className="bg-gradient-to-r from-[#1F60C0] gap-2 to-[#0D4493] text-white font-semibold flex items-center px-8 py-2 rounded-md max-lg:px-4"
            >
              Download Excel
              {Shared.Save}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicineStock;
