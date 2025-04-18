import { Routes, Route, Navigate } from 'react-router-dom';
import { TendersListPage } from './TendersListPage';
import { CreateTenderPage } from './CreateTenderPage';
import { EditTenderPage } from './EditTenderPage';
import { TenderDetailsPage } from './TenderDetailsPage';

export function TendersPage() {
  return (
    <Routes>
      {/* Main listing route */}
      <Route index element={<TendersListPage />} />
      
      {/* Route for creating new tenders */}
      <Route path="new" element={<CreateTenderPage />} />
      
      {/* Route for editing tenders */}
      <Route path=":id/edit" element={<EditTenderPage />} />
      
      {/* Route for viewing tender details */}
      <Route path=":id" element={<TenderDetailsPage />} />
      
      {/* Catch any invalid routes and redirect to the main listing */}
      <Route path="*" element={<Navigate to="/tenders" />} />
    </Routes>
  );
} 