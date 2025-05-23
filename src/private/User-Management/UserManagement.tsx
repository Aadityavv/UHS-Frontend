import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Edit, Trash2, Users, AlertCircle, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  email: string;
  sapId: string;
  name: string;
  phoneNumber: string;
  bloodGroup: string;
  school: string;
  createdAt: string;
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

const UserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const isMobile = useMobile();

  // Filter users based on search term
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (aValue && bValue) {
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredUsers = sortedUsers.filter(user =>
    Object.values(user).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get<User[]>("https://uhs-backend.onrender.com/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        throw new Error("Invalid users data format");
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message
        : "Failed to fetch users";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://uhs-backend.onrender.com/api/admin/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Success", description: "User deleted successfully" });
      fetchUsers();
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to delete user";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const toggleExpandUser = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.replace(" ", "T"));
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderDesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
            Email {sortKey === "email" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead onClick={() => handleSort("sapId")} className="cursor-pointer">
            Sap ID {sortKey === "sapId" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
            Name {sortKey === "name" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Blood Group</TableHead>
          <TableHead>School</TableHead>
          <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
            Joined on {sortKey === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.sapId}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.phoneNumber}</TableCell>
            <TableCell>{user.bloodGroup}</TableCell>
            <TableCell>{user.school}</TableCell>
            <TableCell>{formatDate(user.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/users/edit/${user.email}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteUser(user.email)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="p-3 rounded-lg shadow-sm border border-gray-100"
        >
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpandUser(user.id)}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatDate(user.createdAt)}
              </span>
              {expandedUserId === user.id ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>

          {expandedUserId === user.id && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">Sap ID</p>
                  <p className="text-sm">{user.sapId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Phone</p>
                  <p className="text-sm">{user.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Blood Group</p>
                  <p className="text-sm">{user.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">School</p>
                  <p className="text-sm">{user.school}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/users/edit/${user.email}`)}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(user.email)}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 flex flex-col items-center">
            <AlertCircle className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load users</h3>
            <p className="text-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchUsers}>
              Retry
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {users.length === 0 ? "No users found" : "No matching users found"}
          </div>
        ) : (
          isMobile ? renderMobileView() : renderDesktopView()
        )}
      </div>
    </div>
  );
};

export default UserManagement;