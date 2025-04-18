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

export function CustomerList() {
  const navigate = useNavigate();
  const { getCustomers, deleteCustomer} = useCustomers();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <DataTable
          columns={columns}
          data={filteredCustomers}
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
          loading={loading}
        />
      )}
    </div>
  );
} 