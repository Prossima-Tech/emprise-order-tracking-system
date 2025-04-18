// src/features/sites/components/SiteList.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Plus,
  Building,
  MapPin,
  Loader2,
  FileText,
  Pencil,
  Trash2,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Card,
} from "../../../components/ui/card";
import { Column, DataTable } from "../../../components/data-display/DataTable";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import { useSites } from "../hooks/use-sites";
import { Site, SiteStatus } from "../types/site";
import { StatusBadge } from "../../../components/data-display/StatusBadge";
import { toast } from "../../../hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../../../components/ui/pagination";
import { useCustomers, Customer } from "../../customers/hooks/use-customers";

export function SiteList() {
  const navigate = useNavigate();
  const { getSites, deleteSite } = useSites();
  const { getCustomers } = useCustomers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [railwayZones, setRailwayZones] = useState<Customer[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [zoneMap, setZoneMap] = useState<Record<string, Customer>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch railway zones
  const fetchRailwayZones = useCallback(async () => {
    try {
      setLoadingZones(true);
      const zones = await getCustomers();
      setRailwayZones(zones);
      
      // Create map for quick lookups
      const map: Record<string, Customer> = {};
      zones.forEach(zone => {
        map[zone.id] = zone;
      });
      setZoneMap(map);
    } catch (error) {
      console.error("Failed to fetch railway zones:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch railway zones."
      });
    } finally {
      setLoadingZones(false);
    }
  }, []);

  // Fetch sites
  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError("Failed to fetch sites. Please try again.");
      setSites([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, zoneFilter, searchTerm]);

  useEffect(() => {
    fetchRailwayZones();
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete site "${name}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Reset filters
  // const resetFilters = () => {
  //   setSearchTerm("");
  //   setStatusFilter("all");
  //   setZoneFilter("all");
  //   setCurrentPage(1);
  //   fetchSites();
  // };

  // Helper to get zone name 
  const getZoneName = (zoneId: string) => {
    return zoneMap[zoneId]?.name || zoneId;
  };

  // Filter sites based on current filters
  const filteredSites = useMemo(() => {
    if (!Array.isArray(sites)) return [];
    return sites;
  }, [sites]);

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / pageSize);


  // Table columns
  const columns: Column<Site>[] = [
    {
      header: "Site",
      accessor: (row: Site) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.code && (
            <div className="text-sm text-muted-foreground">Code: {row.code}</div>
          )}
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: (row: Site) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {loadingZones ? (
            <span className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </span>
          ) : (
            <span className="truncate">{getZoneName(row.zoneId)}</span>
          )}
        </div>
      ),
    },
    {
      header: "Location",
      accessor: (row: Site) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{row.location}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: Site) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: "Work Orders",
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
      header: "Actions",
      accessor: (row: Site) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/sites/${row.id}`)}>
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/sites/${row.id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Site
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDelete(row.id, row.name)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-6 text-red-600">
        <p>{error}</p>
        <Button 
          onClick={() => fetchSites()} 
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
      <Card>
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-[350px]">
              <Input
                placeholder="Search sites..."
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(SiteStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select 
                value={zoneFilter} 
                onValueChange={setZoneFilter}
                disabled={loadingZones}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingZones ? "Loading..." : "Filter by customer"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {loadingZones ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading customers...
                      </div>
                    </SelectItem>
                  ) : (
                    railwayZones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => navigate("/sites/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Site
          </Button>
        </div>
      </Card>

      {/* Data table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredSites}
            onRowClick={(row) => navigate(`/sites/${row.id}`)}
            loading={loading}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
                      isActive={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    // Show first page, last page, and pages around current page
                    if (
                      i === 0 || 
                      i === totalPages - 1 || 
                      (i >= currentPage - 2 && i <= currentPage + 2)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Add ellipsis
                    if (i === 1 && currentPage > 4) {
                      return <PaginationEllipsis key="ellipsis-start" />;
                    }
                    
                    if (i === totalPages - 2 && currentPage < totalPages - 3) {
                      return <PaginationEllipsis key="ellipsis-end" />;
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                      isActive={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}