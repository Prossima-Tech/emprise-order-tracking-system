import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, isAfter } from "date-fns";
import {
  MoreHorizontal,
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
  DropdownMenuTrigger,
  // DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";
import {
  Card
} from "../../../components/ui/card";
import { Column, DataTable } from "../../../components/data-display/DataTable";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import type { LOA } from "../types/loa";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../../../components/ui/pagination";
import { useLOAs } from "../hooks/use-loas";
const statusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "1. Not Started", value: "NOT_STARTED" },
  { label: "2. In Progress", value: "IN_PROGRESS" },
  { label: "4. Supply/Work Completed", value: "SUPPLY_WORK_COMPLETED" },
  { label: "7. Chase Payment", value: "CHASE_PAYMENT" },
  { label: "9. Closed", value: "CLOSED" },
];

export function LOAList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState({
    loaNumber: "",
    siteName: "",
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loas, setLOAs] = useState<LOA[]>([]);
  const { loading, getLOAs, deleteLOA } = useLOAs();
  const [error, setError] = useState<string | null>(null);
  const [loaToDelete, setLoaToDelete] = useState<LOA | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  // @ts-expect-error - totalItems is used for tracking, will be displayed in future updates
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchLOAs = async () => {
      try {
        const data = await getLOAs({
          page: currentPage,
          limit: pageSize,
          sortBy,
          sortOrder
        });

        setLOAs(data.loas || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 0);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch LOAs:", error);
        setError('Failed to fetch LOAs. Please try again.');
        setLOAs([]);
      }
    };

    fetchLOAs();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  const handleDeleteClick = async (loa: LOA) => {
    try {
      await deleteLOA(loa.id);
      const data = await getLOAs({
        page: currentPage,
        limit: pageSize
      });
      setLOAs(data.loas || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error deleting LOA:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper function to get status badge style
  const getStatusBadgeStyle = (status: LOA['status']) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'SUPPLY_WORK_COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CHASE_PAYMENT':
        return 'bg-amber-100 text-amber-800';
      case 'CLOSED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to display readable status text
  const getStatusDisplayText = (status: LOA['status']) => {
    switch (status) {
      case 'NOT_STARTED':
        return '1. Not Started';
      case 'IN_PROGRESS':
        return '2. In Progress';
      case 'SUPPLY_WORK_COMPLETED':
        return '4. Supply/Work Completed';
      case 'CHASE_PAYMENT':
        return '7. Chase Payment';
      case 'CLOSED':
        return '9. Closed';
      default:
        return status;
    }
  };

  const columns = useMemo<Column<LOA>[]>(() => [
    {
      header: "Sr. No.",
      accessor: (_row: LOA, index?: number) => {
        // Calculate serial number based on current page and position
        return (currentPage - 1) * pageSize + (index || 0) + 1;
      },
    },
    {
      header: "LOA Number",
      accessor: "loaNumber",
    },
    {
      header: "Site",
      accessor: (row: LOA) => (
        <div className="flex flex-col">
          <span>{row.site?.name}</span>
          <span className="text-sm text-muted-foreground">
            {row.site?.location}
          </span>
        </div>
      ),
    },
    {
      header: "Value",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.loaValue),
    },
    {
      header: "Status",
      accessor: (row: LOA) => (
        <Badge className={cn("px-2 py-1", getStatusBadgeStyle(row.status))}>
          {getStatusDisplayText(row.status)}
        </Badge>
      ),
    },
    {
      header: "Delivery Period",
      accessor: (row: LOA) => (
        <div className="flex flex-col">
          <span>{format(new Date(row.deliveryPeriod.start), "PP")}</span>
          <span className="text-muted-foreground">
            to {format(new Date(row.deliveryPeriod.end), "PP")}
          </span>
          {isAfter(new Date(), new Date(row.deliveryPeriod.end)) && (
            <span className="text-red-500 text-sm">Overdue</span>
          )}
        </div>
      ),
    },
    {
      header: "Due Date",
      accessor: (row: LOA) => (
        <div className="flex flex-col">
          {row.dueDate ? (
            <>
              <span>{format(new Date(row.dueDate), "PP")}</span>
              {isAfter(new Date(), new Date(row.dueDate)) && (
                <span className="text-red-500 text-sm">Overdue</span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      header: "Amendments",
      accessor: (row: LOA) => (
        <div className="flex items-center space-x-2">
          <span>{row.amendments.length}</span>
        </div>
      ),
    },
    {
      header: "Purchase Orders",
      accessor: (row: LOA) => (
        <div className="flex items-center space-x-2">
          <span>{row.purchaseOrders.length}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row: LOA) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/loas/${row.id}`)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [navigate, currentPage, pageSize]);

  const filteredData = useMemo(() => {
    const loasArray = Array.isArray(loas) ? loas : [];
    
    return loasArray.filter((loa) => {
      const matchesLOANumber = searchQuery.loaNumber === "" ||
        loa.loaNumber.toLowerCase().includes(searchQuery.loaNumber.toLowerCase());

      const matchesSiteName = searchQuery.siteName === "" ||
        loa.site?.name.toLowerCase().includes(searchQuery.siteName.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || loa.status === statusFilter;

      return matchesLOANumber && matchesSiteName && matchesStatus;
    });
  }, [loas, searchQuery, statusFilter]);

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
    <div className="space-y-6">
      {/* Filter Section */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <Input
              placeholder="Search by LOA number..."
              value={searchQuery.loaNumber}
              onChange={(e) => setSearchQuery(prev => ({
                ...prev,
                loaNumber: e.target.value
              }))}
              className="w-full"
            />
          </div>
          <div>
            <Input
              placeholder="Search by site name..."
              value={searchQuery.siteName}
              onChange={(e) => setSearchQuery(prev => ({
                ...prev,
                siteName: e.target.value
              }))}
              className="w-full"
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Date (Newest)</SelectItem>
                <SelectItem value="createdAt-asc">Date (Oldest)</SelectItem>
                <SelectItem value="loaValue-desc">Value (High to Low)</SelectItem>
                <SelectItem value="loaValue-asc">Value (Low to High)</SelectItem>
                <SelectItem value="deliveryStartDate-asc">Start Date (Early)</SelectItem>
                <SelectItem value="deliveryStartDate-desc">Start Date (Late)</SelectItem>
                <SelectItem value="deliveryEndDate-asc">End Date (Early)</SelectItem>
                <SelectItem value="deliveryEndDate-desc">End Date (Late)</SelectItem>
                <SelectItem value="dueDate-asc">Due Date (Early)</SelectItem>
                <SelectItem value="dueDate-desc">Due Date (Late)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => navigate("/loas/new")}>
              Create New LOA
            </Button>
          </div>
        </div>
      </Card>

      {/* LOA Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No LOAs found
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={filteredData}
                onRowClick={(row) => navigate(`/loas/${row.id}`)}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                      />
                    </PaginationItem>

                    {/* First Page */}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
                        isActive={currentPage === 1}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>

                    {/* Show ellipsis if there are many pages before current */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Pages around current page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page !== 1 && page !== totalPages && Math.abs(currentPage - page) <= 1)
                      .map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {/* Show ellipsis if there are many pages after current */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {/* Last Page */}
                    {totalPages > 1 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                          }}
                          isActive={currentPage === totalPages}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!loaToDelete} onOpenChange={() => setLoaToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete LOA</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete LOA {loaToDelete?.loaNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoaToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (loaToDelete) {
                  handleDeleteClick(loaToDelete);
                  setLoaToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
