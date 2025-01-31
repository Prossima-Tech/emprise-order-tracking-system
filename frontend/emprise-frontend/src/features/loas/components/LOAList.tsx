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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useLOAs } from "../hooks/use-loas";
const statusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function LOAList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loas, setLOAs] = useState<LOA[]>([]);
  const { loading, getLOAs, deleteLOA } = useLOAs();
  const [error, setError] = useState<string | null>(null);
  const [loaToDelete, setLoaToDelete] = useState<LOA | null>(null);

  useEffect(() => {
    const fetchLOAs = async () => {
      try {
        const data = await getLOAs();
        if (Array.isArray(data)) {
          setLOAs(data);
        } else {
          setError('Invalid data format received');
          setLOAs([]);
        }
      } catch (error) {
        console.error("Failed to fetch LOAs:", error);
        setError('Failed to fetch LOAs. Please try again.');
        setLOAs([]);
      }
    };

    fetchLOAs();
  }, []);

  const handleDeleteClick = async (loa: LOA) => {
    try {
      await deleteLOA(loa.id);
      const updatedData = await getLOAs();
      setLOAs(updatedData);
    } catch (error) {
      console.error('Error deleting LOA:', error);
    }
  };

  const columns = useMemo<Column<LOA>[]>(() => [
    {
      header: "LOA Number",
      accessor: "loaNumber",
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
  ], [navigate]);

  const filteredData = useMemo(() => {
    const loasArray = Array.isArray(loas) ? loas : [];
    
    return loasArray.filter((loa) => {
      const matchesSearch =
        searchTerm === "" ||
        loa.loaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loa.workDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || loa.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loas, searchTerm, statusFilter]);

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
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Input
              placeholder="Search by LOA number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <>
          {filteredData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No LOAs found
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              onRowClick={(row) => navigate(`/loas/${row.id}`)}
            />
          )}
        </>
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
