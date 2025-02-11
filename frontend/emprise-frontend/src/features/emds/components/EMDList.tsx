import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import {
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  AlertTriangle,
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
import type { EMD } from "../types/emd";
// import { cn } from "../../../lib/utils";
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

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Returned", value: "RETURNED" },
];

const maturityOptions = [
  { label: "All", value: "all" },
  { label: "Next 30 Days", value: "30" },
  { label: "Next 60 Days", value: "60" },
  { label: "Next 90 Days", value: "90" },
];

export function EMDList() {
  const navigate = useNavigate();
  const [searchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [maturityFilter, setMaturityFilter] = useState("all");
  const [emds, setEMDs] = useState<EMD[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Number of items per page

  useEffect(() => {
    const fetchEMDs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/emds");
        console.log(response.data.data.data);
        setEMDs(response.data.data.data);
      } catch (error) {
        console.error("Failed to fetch EMDs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEMDs();
  }, []);

  const columns = [
    {
      header: "Bank Name",
      accessor: "bankName",
    },
    {
      header: ({ sortable }: { sortable: boolean }) => (
        <div className="flex items-center">
          Amount
          {sortable && (
            <Button variant="ghost" className="ml-2 h-8 w-8 p-0">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      accessor: (row: EMD) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(row.amount),
    },
    {
      header: "Submission Date",
      accessor: (row: EMD) => format(new Date(row.submissionDate), "PP"),
    },
    {
      header: "Maturity Date",
      accessor: (row: EMD) => {
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
      header: "Status",
      accessor: (row: EMD) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
        header: "Actions",
        accessor: (row: EMD) => (
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
                <DropdownMenuItem onClick={() => navigate(`/emds/${row.id}`)}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {/* {row.status === 'ACTIVE' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(row.id, 'EXPIRED')}
                      className="text-red-600"
                    >
                      Mark as Expired
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(row.id, 'RELEASED')}
                    >
                      Mark as Returned
                    </DropdownMenuItem>
                  </>
                )} */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ];
  
    // Filter EMDs based on search term, status, and maturity
    const filteredEMDs = Array.isArray(emds) 
      ? emds.filter((emd) => {
          const matchesSearch =
            searchTerm === "" ||
            emd.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
          const matchesStatus = statusFilter === "all" || emd.status === statusFilter;
    
          const matchesMaturity = () => {
            if (maturityFilter === "all") return true;
            const daysUntilMaturity = differenceInDays(
              new Date(emd.maturityDate),
              new Date()
            );
            return daysUntilMaturity <= parseInt(maturityFilter);
          };
    
          return matchesSearch && matchesStatus && matchesMaturity();
        })
      : [];
  
    // Calculate pagination values
    const totalItems = filteredEMDs.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = filteredEMDs.slice(startIndex, endIndex);

    // Handle page changes
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    return (
      <div className="space-y-6">
        {/* Filter Section */}
        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-3">
            {/* <div>
              <Input
                placeholder="Search by bank name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div> */}
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
            <div className="flex justify-end">
              <Button onClick={() => navigate("/emds/new")}>
                Create New EMD
              </Button>
            </div>
          </div>
        </Card>
  
        {/* Expiring EMDs Alert */}
        <ExpiryNotification emds={emds} />
  
        {/* EMDs Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns as Column<EMD>[]}
              data={currentItems}
              loading={loading}
              onRowClick={(row) => navigate(`/emds/${row.id}`)}
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