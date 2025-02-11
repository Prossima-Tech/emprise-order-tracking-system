import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Package,
  Building,
  Power,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
} from "../../../components/ui/card";
import { useVendors } from "../hooks/use-vendors";
import type { Vendor } from "../types/vendor";
import { Button } from "../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { DataTable } from "../../../components/data-display/DataTable";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";

export function VendorList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getVendors, updateVendorStatus } = useVendors();

  // Fetch vendors on component mount
  useEffect(() => {
    let mounted = true;

    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getVendors();
        
        if (mounted) {

          if (Array.isArray(data)) {
            setVendors(data);
          } else {
            console.error('Received non-array vendors data:', data);
            setError('Invalid data format received');
          }
        }
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        if (mounted) {
          setError('Failed to fetch vendors. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchVendors();

    return () => {
      mounted = false;
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: Vendor['status']) => {
    try {
      setLoading(true);
      await updateVendorStatus(id, newStatus);
      const updatedVendors = await getVendors();
      if (Array.isArray(updatedVendors)) {
        setVendors(updatedVendors);
      }
    } catch (error) {
      console.error("Failed to update vendor status:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Vendor",
      accessor: (row: Vendor) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
          <div className="text-sm text-muted-foreground">{row.mobile}</div>
        </div>
      ),
    },
    {
      header: "Items",
      accessor: (row: Vendor) => (
        <div className="flex items-center space-x-2">
          <span>{row.items.length}</span>
          {row.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/vendors/${row.id}/items`);
              }}
            >
              View
            </Button>
          )}
        </div>
      ),
    },
    {
      header: "Orders",
      accessor: (row: Vendor) => (
        <div className="flex items-center space-x-2">
          <span>{row.purchaseOrders.length}</span>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: (row: Vendor) => format(new Date(row.createdAt), "PP"),
    },
    {
      header: "Actions",
      accessor: (row: Vendor) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/vendors/${row.id}`)}>
              <Building className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/vendors/${row.id}/items`)}>
              <Package className="mr-2 h-4 w-4" />
              Manage Items
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.status !== 'BLACKLISTED' && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(
                    row.id,
                    row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                  )}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(row.id, 'BLACKLISTED')}
                  className="text-red-600"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Blacklist Vendor
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredVendors = useMemo(() => {
    if (!Array.isArray(vendors)) {
      console.warn('Vendors is not an array:', vendors);
      return [];
    }

    return vendors.filter((vendor) => {
      const matchesSearch =
        searchTerm === "" ||
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.mobile.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || 
        vendor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  if (error) {
    return (
      <div className="text-center py-6 text-red-600">
        <p>{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <Card>
          <div className="flex items-center p-4 justify-between gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => navigate("/vendors/new")}
            >
              Add New Vendor
            </Button>
          </div>
      </Card>

      {/* Vendors Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={filteredVendors}
          onRowClick={(row) => navigate(`/vendors/${row.id}`)}
          loading={loading}
        />
      )}
    </div>
  );
}