// src/features/sites/components/SiteList.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Building,
  MapPin,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Card } from "../../../components/ui/card";
import { Column, DataTable } from "../../../components/data-display/DataTable";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import { useSites } from "../hooks/use-sites";
import { Site, SiteStatus } from "../types/site";
import { StatusBadge } from "../../../components/data-display/StatusBadge";
import { RAILWAY_ZONES } from "../../../lib/constants/railway-zones";
import { toast } from "../../../hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";

export function SiteList() {
  const navigate = useNavigate();
  const { getSites, deleteSite } = useSites();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch sites
  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(zoneFilter !== "all" && { zoneId: zoneFilter }),
        ...(searchTerm && { searchTerm })
      };

      const response = await getSites(params);
      setSites(response.sites || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch sites:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch sites. Please try again."
      });
      setSites([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, zoneFilter, searchTerm]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this site?")) return;
    try {
      await deleteSite(id);
      toast({
        title: "Success",
        description: "Site deleted successfully"
      });
      await fetchSites();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete site"
      });
    }
  };

  // Table columns
  const columns = [
    {
      header: "Site Code",
      accessor: (row: Site) => row.code,
    },
    {
      header: ({ sortable }: { sortable: boolean }) => (
        <div className="flex items-center">
          Name
          {sortable && (
            <Button variant="ghost" className="ml-2 h-8 w-8 p-0">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      accessor: (row: Site) => row.name,
    },
    {
      header: "Location",
      accessor: (row: Site) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {row.location}
        </div>
      ),
    },
    {
      header: "Zone",
      accessor: (row: Site) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          {RAILWAY_ZONES.find(zone => zone.id === row.zoneId)?.name || row.zoneId}
        </div>
      ),
    },
    {
      header: "Statistics",
      accessor: (row: Site) => {
        const stats = row.stats || { totalLoas: 0, totalPurchaseOrders: 0, totalValue: 0 };
        return (
          <div className="space-y-1 text-sm">
            <div>LOAs: {stats.totalLoas}</div>
            <div>POs: {stats.totalPurchaseOrders}</div>
            <div className="font-medium">
              Value: ₹{stats.totalValue.toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (row: Site) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: "Actions",
      accessor: (row: Site) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/sites/${row.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/sites/${row.id}/edit`)}>
              Edit Site
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(row.id)}
              className="text-red-600"
            >
              Delete Site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sites</h1>
        {/* <Button onClick={() => navigate("/sites/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Site
        </Button> */}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4 p-4">
          <div className="flex-1">
            <Input
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(SiteStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {RAILWAY_ZONES.map(zone => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => navigate("/sites/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Site
          </Button>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <DataTable
            columns={columns as Column<Site>[]}
            data={sites}
            loading={loading}
            onRowClick={(row) => navigate(`/sites/${row.id}`)}
          />

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      isActive={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      isActive={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}