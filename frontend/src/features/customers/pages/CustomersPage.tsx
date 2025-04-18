import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerList } from '../components/CustomerList';  
import { CustomerForm } from '../components/CustomerForm';
import { CustomerDetail } from '../components/CustomerDetail';

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>
      <Routes>
        {/* Main listing route */}
        <Route index element={<CustomerList />} />
        
        {/* Route for creating new customers */}
        <Route path="new" element={<CustomerForm mode="create" />} />
        
        {/* Route for editing customers */}
        <Route path=":id/edit" element={<CustomerForm mode="edit" />} />
        
        {/* Route for viewing customer details */}
        <Route path=":id" element={<CustomerDetail />} />
        
        {/* Catch any invalid routes and redirect to the main listing */}
        <Route path="*" element={<Navigate to="/customers" />} />
      </Routes>
    </div>
  );
} 