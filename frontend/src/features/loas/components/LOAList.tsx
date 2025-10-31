import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [hasEMD, setHasEMD] = useState<string>("all");
  const [hasSecurity, setHasSecurity] = useState<string>("all");
  const [hasPerformanceGuarantee, setHasPerformanceGuarantee] = useState<string>("all");

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const fetchLOAs = async () => {
      try {
        const data = await getLOAs({
          page: currentPage,
          limit: pageSize,
          search: searchQuery || undefined,
          status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
          minValue: minValue ? parseFloat(minValue) : undefined,
          maxValue: maxValue ? parseFloat(maxValue) : undefined,
          hasEMD: hasEMD === "true" ? true : hasEMD === "false" ? false : undefined,
          hasSecurity: hasSecurity === "true" ? true : hasSecurity === "false" ? false : undefined,
          hasPerformanceGuarantee: hasPerformanceGuarantee === "true" ? true : hasPerformanceGuarantee === "false" ? false : undefined,
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
  }, [currentPage, pageSize, searchQuery, statusFilter, minValue, maxValue, hasEMD, hasSecurity, hasPerformanceGuarantee, sortBy, sortOrder]);

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

  // Helper function to calculate days till due date
  const calculateDaysTillDueDate = (dueDate?: Date | string | null) => {
    if (!dueDate) return '-';
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-red-600 font-semibold">Overdue ({Math.abs(diffDays)} days)</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-semibold">Due Today</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600 font-semibold">{diffDays} days</span>;
    } else {
      return <span className="text-green-600">{diffDays} days</span>;
    }
  };

  const columns: Column<LOA>[] = [
    {
      header: "Sr. No.",
      accessor: (_row: LOA, index?: number) => {
        return (currentPage - 1) * pageSize + (index || 0) + 1;
      },
    },
    {
      header: "Order Status",
      accessor: (row: LOA) => (
        <Badge className={cn("px-2 py-1", getStatusBadgeStyle(row.status))}>
          {getStatusDisplayText(row.status)}
        </Badge>
      ),
    },
    {
      header: "Days to Due Date",
      accessor: (row: LOA) => calculateDaysTillDueDate(row.dueDate),
    },
    {
      header: "Delivery Date",
      accessor: (row: LOA) => format(new Date(row.deliveryPeriod.end), "PP"),
    },
    {
      header: "Order Due Date",
      accessor: (row: LOA) => row.dueDate ? format(new Date(row.dueDate), "PP") : "-",
    },
    {
      header: "Order Received Date",
      accessor: (row: LOA) => row.orderReceivedDate ? format(new Date(row.orderReceivedDate), "PP") : "-",
    },
    {
      header: "Order Value",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.loaValue),
    },
    {
      header: "PO/LOA Number",
      accessor: "loaNumber",
    },
    {
      header: "Site",
      accessor: (row: LOA) => row.site?.name || "-",
    },
    {
      header: "Description of Work",
      accessor: (row: LOA) => (
        <div className="max-w-xs truncate" title={row.workDescription}>
          {row.workDescription}
        </div>
      ),
    },
    {
      header: "EMD",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.emdAmount || 0),
    },
    {
      header: "Security Deposit",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.securityDepositAmount || 0),
    },
    {
      header: "Tender No.",
      accessor: (row: LOA) => (
        <div className="max-w-xs truncate" title={row.tenderNo || undefined}>
          {row.tenderNo || "-"}
        </div>
      ),
    },
    {
      header: "Order POC",
      accessor: (row: LOA) => (
        <div className="max-w-xs truncate" title={row.orderPOC || undefined}>
          {row.orderPOC || "-"}
        </div>
      ),
    },
    {
      header: "FD/BG Details",
      accessor: (row: LOA) => (
        <div className="max-w-xs truncate" title={row.fdBgDetails || undefined}>
          {row.fdBgDetails || "-"}
        </div>
      ),
    },
    {
      header: "Remarks",
      accessor: (row: LOA) => (
        <div className="max-w-xs truncate" title={row.remarks || undefined}>
          {row.remarks || "-"}
        </div>
      ),
    },
    {
      header: "Last Invoice No.",
      accessor: (row: LOA) => row.invoices?.[0]?.invoiceNumber || "-",
    },
    {
      header: "Last Invoice Amount",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.invoices?.[0]?.invoiceAmount || 0),
    },
    {
      header: "Total Receivables",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.invoices?.[0]?.totalReceivables || 0),
    },
    {
      header: "Actual Amount Received",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.invoices?.[0]?.actualAmountReceived || 0),
    },
    {
      header: "Amount Deducted",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.invoices?.[0]?.amountDeducted || 0),
    },
    {
      header: "Amount Pending",
      accessor: (row: LOA) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.invoices?.[0]?.amountPending || 0),
    },
    {
      header: "Reason for Deduction",
      accessor: (row: LOA) => (
        <div className="max-w-xs truncate" title={row.invoices?.[0]?.deductionReason || undefined}>
          {row.invoices?.[0]?.deductionReason || "-"}
        </div>
      ),
    },
    {
      header: "Bill Links",
      accessor: (row: LOA) => (
        <div className="max-w-xs truncate" title={row.invoices?.[0]?.billLinks || undefined}>
          {row.invoices?.[0]?.billLinks || "-"}
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
  ];

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setMinValue("");
    setMaxValue("");
    setHasEMD("all");
    setHasSecurity("all");
    setHasPerformanceGuarantee("all");
    setCurrentPage(1);
  };

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
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Input
                placeholder="Search LOA number, site, work..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.slice(1).map((option) => (
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
            <div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full"
              >
                {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button onClick={() => navigate("/loas/new")} className="flex-1">
                Create New
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-1 block">Min Value (₹)</label>
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Value (₹)</label>
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Has EMD</label>
                <Select value={hasEMD} onValueChange={setHasEMD}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Has Security Deposit</label>
                <Select value={hasSecurity} onValueChange={setHasSecurity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Has Performance Guarantee</label>
                <Select value={hasPerformanceGuarantee} onValueChange={setHasPerformanceGuarantee}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* LOA Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {loas.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No LOAs found
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={loas}
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
