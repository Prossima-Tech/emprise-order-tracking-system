import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Plus,
  Building,
  Edit,
  Trash2,
  MapPin,
  FileText,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Card } from '../../../components/ui/card';
import { Column, DataTable } from '../../../components/data-display/DataTable';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { useCustomers, Customer } from '../hooks/use-customers';
import { toast } from '../../../hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '../../../components/ui/pagination';

export function CustomerList() {
  const navigate = useNavigate();
  const { getCustomers, deleteCustomer} = useCustomers();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      setLoading(true);
      deleteCustomer(id)
        .then(() => {
          loadCustomers();
          toast({
            title: "Success",
            description: "Customer deleted successfully",
          });
        })
        .catch((error) => {
          console.error('Error deleting customer:', error);
          toast({
            title: "Error",
            description: "Failed to delete customer",
            variant: "destructive",
          });
          setLoading(false);
        });
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) {
      console.warn('Customers is not an array:', customers);
      return [];
    }

    if (!searchTerm) return customers;

    const query = searchTerm.toLowerCase();
    return customers.filter((customer) => (
      customer.name.toLowerCase().includes(query) ||
      customer.id.toLowerCase().includes(query) ||
      customer.headquarters.toLowerCase().includes(query) ||
      (customer.region ? customer.region.toLowerCase().includes(query) : false)
    ));
  }, [customers, searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const columns: Column<Customer>[] = [
    {
      header: "Customer",
      accessor: (row: Customer) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">Code: {row.id}</div>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: (row: Customer) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <div>{row.headquarters}</div>
            {row.region && (
              <div className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{row.region}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Sites",
      accessor: (row: Customer) => (
        <div className="flex items-center space-x-2">
          <span>{row.siteCount || 0}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sites?customer=${row.id}`);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row: Customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate(`/customers/${row.id}`)}>
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/customers/${row.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteCustomer(row.id, row.name)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Customer
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
          onClick={() => loadCustomers()} 
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
      {/* Search and Filters */}
      <Card>
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-[350px]">
              <Input
                placeholder="Search by name, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => navigate('/customers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        </div>
      </Card>

      {/* Customers Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={currentCustomers}
            onRowClick={(row) => navigate(`/customers/${row.id}`)}
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
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    // Show first page, last page, and pages around current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Add ellipsis
                    if (pageNumber === 2 && currentPage > 3) {
                      return <PaginationEllipsis key="ellipsis-start" />;
                    }

                    if (pageNumber === totalPages - 1 && currentPage < totalPages - 2) {
                      return <PaginationEllipsis key="ellipsis-end" />;
                    }

                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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