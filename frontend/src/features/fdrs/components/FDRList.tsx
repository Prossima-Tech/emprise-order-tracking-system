import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import {
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
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
import { Column, DataTable } from "../../../components/data-display/DataTable";
import { Card } from "../../../components/ui/card";
import type { FDR } from "../types/fdr";
import apiClient from "../../../lib/utils/api-client";
import { ExpiryNotification } from "./ExpiryNotification";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import { StatusBadge } from "../../../components/data-display/StatusBadge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../../../components/ui/pagination";
import { BulkImportFDR } from "./BulkImportFDR";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Running", value: "RUNNING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returned", value: "RETURNED" },
];

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "FD", value: "FD" },
  { label: "BG", value: "BG" },
];

const maturityOptions = [
  { label: "All", value: "all" },
  { label: "Next 30 Days", value: "30" },
  { label: "Next 60 Days", value: "60" },
  { label: "Next 90 Days", value: "90" },
];

export function FDRList() {
  const navigate = useNavigate();
  const [searchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [maturityFilter, setMaturityFilter] = useState("all");
  const [fdrs, setFDRs] = useState<FDR[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const fetchFDRs = async () => {
    try {
      setLoading(true);
      // Request all FDRs by setting a high limit for client-side pagination
      const response = await apiClient.get("/fdrs", {
        params: {
          limit: 10000, // High limit to get all FDRs for client-side pagination
          page: 1,
        },
      });
      setFDRs(response.data.data.data);
    } catch (error) {
      console.error("Failed to fetch FDRs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFDRs();
  }, []);

  const columns = [
    {
      header: "S.No.",
      accessor: (_row: FDR, index?: number) => {
        const serialNumber = (currentPage - 1) * pageSize + (index || 0) + 1;
        return <span className="font-medium">{serialNumber}</span>;
      },
    },
    {
      header: "Category",
      accessor: (row: FDR) => (
        <span className="font-medium">{row.category}</span>
      ),
    },
    {
      header: "Bank Name",
      accessor: "bankName",
    },
    {
      header: "FDR Number",
      accessor: (row: FDR) => row.fdrNumber || "-",
    },
    {
      header: "Account Name",
      accessor: (row: FDR) => row.accountName || "-",
    },
    {
      header: ({ sortable }: { sortable: boolean }) => (
        <div className="flex items-center">
          Deposit Amount
          {sortable && (
            <Button variant="ghost" className="ml-2 h-8 w-8 p-0">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      accessor: (row: FDR) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.depositAmount),
    },
    {
      header: "Date of Deposit",
      accessor: (row: FDR) => format(new Date(row.dateOfDeposit), "PP"),
    },
    {
      header: "Maturity Date",
      accessor: (row: FDR) => {
        if (!row.maturityDate) return "-";
        const maturityDate = new Date(row.maturityDate);
        const daysUntilMaturity = differenceInDays(maturityDate, new Date());
        return (
          <div className="flex items-center">
            <span>{format(maturityDate, "PP")}</span>
            {daysUntilMaturity <= 30 && daysUntilMaturity > 0 && (
              <AlertTriangle className="ml-2 h-4 w-4 text-yellow-500" />
            )}
          </div>
        );
      },
    },
    {
      header: "POC",
      accessor: (row: FDR) => row.poc || "-",
    },
    {
      header: "Location",
      accessor: (row: FDR) => row.location || "-",
    },
    {
      header: "Status",
      accessor: (row: FDR) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: "Actions",
      accessor: (row: FDR) => (
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/fdrs/${row.id}`)}>
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Filter FDRs based on search term, status, category, and maturity
  const filteredFDRs = Array.isArray(fdrs)
    ? fdrs.filter((fdr) => {
        const matchesSearch =
          searchTerm === "" ||
          fdr.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (fdr.fdrNumber && fdr.fdrNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (fdr.location && fdr.location.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "all" || fdr.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || fdr.category === categoryFilter;

        const matchesMaturity = () => {
          if (maturityFilter === "all") return true;
          if (!fdr.maturityDate) return false;
          const daysUntilMaturity = differenceInDays(
            new Date(fdr.maturityDate),
            new Date()
          );
          return daysUntilMaturity <= parseInt(maturityFilter);
        };

        return matchesSearch && matchesStatus && matchesCategory && matchesMaturity();
      })
    : [];

  // Calculate pagination values
  const totalItems = filteredFDRs.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = filteredFDRs.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBulkImportSuccess = () => {
    setBulkImportOpen(false);
    fetchFDRs(); // Refresh the list
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Select value={maturityFilter} onValueChange={setMaturityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by maturity" />
              </SelectTrigger>
              <SelectContent>
                {maturityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bulk Import FDRs</DialogTitle>
                </DialogHeader>
                <BulkImportFDR onSuccess={handleBulkImportSuccess} />
              </DialogContent>
            </Dialog>
            <Button onClick={() => navigate("/fdrs/new")}>
              Create New FDR
            </Button>
          </div>
        </div>
      </Card>

      {/* Expiring FDRs Alert */}
      <ExpiryNotification fdrs={fdrs} />

      {/* FDRs Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {/* Results Info */}
          {totalItems > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} FDR{totalItems !== 1 ? 's' : ''}
            </div>
          )}

          <DataTable
            columns={columns as Column<FDR>[]}
            data={currentItems}
            loading={loading}
            onRowClick={(row) => navigate(`/fdrs/${row.id}`)}
          />

          {/* Pagination */}
          {totalItems > pageSize && (
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
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

                {/* Ellipsis after first page */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Pages around current page */}
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNumber = currentPage - 1 + i;
                  if (pageNumber > 1 && pageNumber < totalPages) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNumber);
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                {/* Ellipsis before last page */}
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

                {/* Next Button */}
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
        </div>
      )}
    </div>
  );
}
