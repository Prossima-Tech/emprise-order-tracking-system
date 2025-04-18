import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "../../../components/ui/select";
import { Column, DataTable } from "../../../components/data-display/DataTable";
import { StatusBadge } from "../../../components/data-display/StatusBadge";
import { EmailModal } from "./EmailModal";
import { Card } from "../../../components/ui/card";
import { useOffers } from "../hooks/use-offers";
import type { Offer } from "../types/Offer";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
// import { RAILWAY_ZONES } from '../../../lib/constants/railway-zones';

// const statusOptions = [
//   { label: "All Status", value: "" },
//   { label: "Draft", value: "DRAFT" },
//   { label: "Pending Approval", value: "PENDING_APPROVAL" },
//   { label: "Approved", value: "APPROVED" },
//   { label: "Rejected", value: "REJECTED" },
// ];

export function OfferList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const { loading, getOffers } = useOffers();
  // const [zoneFilter, setZoneFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getOffers();
        setOffers(data || []);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      }
    };

    fetchOffers();
  }, [getOffers]);

  const calculateTotal = (workItems: any[]) => {
    return workItems.reduce((total, item) => {
      const itemTotal = item.quantity * item.baseRate * (1 + item.taxRate / 100);
      return total + itemTotal;
    }, 0);
  };

  const columns = [
    {
      header: "Offer Date",
      accessor: (row: Offer) => format(new Date(row.offerDate), "PP"),
    },
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Authority",
      accessor: "toAuthority",
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
      accessor: (row: Offer) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(calculateTotal(row.workItems)),
    },
    {
      header: "Status",
      accessor: (row: Offer) => <StatusBadge status={row.status} />,
    },
    // {
    //   header: "Railway Zone",
    //   accessor: (row: Offer) => {
    //     const zone = RAILWAY_ZONES.find(z => z.code === row.customerId);
    //     return zone ? `${zone.name} (${zone.code})` : row.customerId;
    //   },
    // },
    {
      header: "Actions",
      accessor: (row: Offer) => (
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
              <DropdownMenuItem
                onClick={() => navigate(`/budgetary-offers/${row.id}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {/* {row.status === "DRAFT" && (
                <DropdownMenuItem
                  onClick={() => {
                    submitForApproval(row.id);
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Approval
                </DropdownMenuItem>
              )}
              {row.status === "APPROVED" && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedOfferId(row.id);
                    setEmailModalOpen(true);
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
              )} */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filteredData = (data: Offer[]) => {
    if (!Array.isArray(data)) return [];
    
    return data.filter((offer) => {
      const matchesSearch =
        searchTerm === "" ||
        offer.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.toAuthority.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || offer.status === statusFilter;

      // const matchesZone =
      //   zoneFilter === "ALL" || offer.customerId === zoneFilter;

      return matchesSearch && matchesStatus;
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-[350px]">
              <Input
                placeholder="Search by subject or authority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => navigate('new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Offer
          </Button>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns as Column<Offer>[]}
          data={filteredData(offers)}
          loading={loading}
          onRowClick={(row) => navigate(`/budgetary-offers/${row.id}`)}
        />
      )}

      {emailModalOpen && selectedOfferId && (
        <EmailModal
          offerId={selectedOfferId}
          open={emailModalOpen}
          onClose={() => {
            setEmailModalOpen(false);
            setSelectedOfferId(null);
          }}
        />
      )}
    </div>
  );
}
