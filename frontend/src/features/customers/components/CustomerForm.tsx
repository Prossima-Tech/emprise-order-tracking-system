import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { useCustomers } from '../hooks/use-customers';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

// Form schema - matching railway zone fields but displayed as customer
const customerSchema = z.object({
  id: z.string()
    .min(2, 'Code is required')
    .max(10, 'Code must be at most 10 characters')
    .transform(val => val.toUpperCase())
    .refine(val => /^[A-Z0-9]+$/.test(val), {
      message: 'Code must contain only uppercase letters and numbers',
    }),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  headquarters: z.string().min(1, 'Headquarters is required'),
});

type FormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  mode: 'create' | 'edit';
}

export function CustomerForm({ mode }: CustomerFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCustomer, createCustomer, updateCustomer, loading } = useCustomers();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      id: '',
      name: '',
      headquarters: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadCustomer(id);
    }
  }, [mode, id]);

  const loadCustomer = async (customerId: string) => {
    try {
      setIsLoading(true);
      const customer = await getCustomer(customerId);
      
      form.reset({
        id: customer.id,
        name: customer.name,
        headquarters: customer.headquarters,
      });
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'create') {
        await createCustomer(data);
      } else if (id) {
        await updateCustomer(id, data);
      }
      navigate('/customers');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customers')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
        </h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'create' ? 'New Customer Information' : 'Update Customer Information'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Code</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={mode === 'edit'}
                            placeholder="e.g. CR, WR, NCR"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Central Railway"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="headquarters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headquarters</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Mumbai, Maharashtra"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/customers')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading && (
                      <span className="mr-2">
                        <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                    {mode === 'create' ? 'Create Customer' : 'Update Customer'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 