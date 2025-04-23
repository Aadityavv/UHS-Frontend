import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardX, ArrowDownUp, Search, PackageX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DeletedAppointment = {
  id: string;
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  reason: string;
  deletedAt: string;
  deletedBy: string;
};

const ITEMS_PER_PAGE = 10;

const DeletedAppointments = () => {
  const [appointments, setAppointments] = useState<DeletedAppointment[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof DeletedAppointment>("deletedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://uhs-backend.onrender.com/api/admin/deleted-appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setAppointments(data);
      } catch {
        toast({ title: "Failed to load deleted appointments", variant: "destructive" });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = appointments
    .filter((appt) =>
      appt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      appt.patientEmail.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: keyof DeletedAppointment) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${String(date.getDate()).padStart(2, '0')}/${
      String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
          <ClipboardX className="w-8 h-8 text-red-500" />
          Deleted Appointments
        </h1>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-2 top-2.5 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search patient or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-[350px] w-full rounded-lg" />
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-xl text-gray-700">
              Total Deleted: {appointments.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10 text-gray-500">
                <PackageX className="h-10 w-10 mb-2" />
                No matching records found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {["patientName", "patientEmail", "reason", "deletedBy", "deletedAt"].map((key) => (
                      <TableHead
                        key={key}
                        onClick={() => handleSort(key as keyof DeletedAppointment)}
                        className="cursor-pointer select-none whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1 capitalize text-sm">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                          <ArrowDownUp className="h-4 w-4 text-gray-400" />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell>{appt.patientName}</TableCell>
                      <TableCell>{appt.patientEmail}</TableCell>
                      <TableCell className="whitespace-normal break-words max-w-xs">
  {appt.reason}
</TableCell>
                      <TableCell>{appt.deletedBy || "N/A"}</TableCell>
                      <TableCell>{formatDate(appt.deletedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-3 px-6 pb-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DeletedAppointments;
