import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { useCustomers, Customer } from '../hooks/use-customers';
import { useToast } from '../../../hooks/use-toast-app';

export function CustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCustomer, deleteCustomer } = useCustomers();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (id) {
      loadCustomer(id);
    }
  }, [id]);

  const loadCustomer = async (customerId: string) => {
    try {
      setIsLoading(true);
      const data = await getCustomer(customerId);
      setCustomer(data);
    } catch (error) {
      console.error('Error loading customer:', error);
      showError('Error loading customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !customer) return;

    try {
      await deleteCustomer(id);
      showSuccess('Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showError('Error deleting customer');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!customer) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Customer not found</h2>
        <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  // Extract region from headquarters or use a default value
  const region = customer.region || 
    (customer.headquarters.includes(',') 
      ? customer.headquarters.split(',')[1].trim() 
      : 'India');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/customers')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/customers/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-1">Customer Code</h3>
            <p className="text-lg">{customer.id}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-1">Name</h3>
            <p className="text-lg">{customer.name}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-1">Headquarters</h3>
            <p className="text-lg">{customer.headquarters}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-1">Region</h3>
            <p className="text-lg">{region}</p>
          </div>

          {customer.createdAt && (
            <div className="col-span-2">
              <h3 className="font-semibold text-sm text-gray-500 mb-1">Created At</h3>
              <p className="text-lg">{new Date(customer.createdAt).toLocaleString()}</p>
            </div>
          )}

          {customer.updatedAt && (
            <div className="col-span-2">
              <h3 className="font-semibold text-sm text-gray-500 mb-1">Updated At</h3>
              <p className="text-lg">{new Date(customer.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 