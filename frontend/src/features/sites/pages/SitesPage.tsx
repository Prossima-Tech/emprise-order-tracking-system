import { Routes, Route, Navigate } from 'react-router-dom';
import { SiteList } from '../components/SiteList';  
import { SiteForm } from '../components/SiteForm';
import { SiteDetail } from '../components/SiteDetail';

export function SitesPage() {
  return (
    <Routes>
      {/* Main listing route */}
      <Route index element={<SiteList />} />
      
      {/* Route for creating new sites */}
      <Route path="new" element={<SiteForm mode="create" />} />
      
      {/* Route for editing sites */}
      <Route path=":id/edit" element={<SiteForm mode="edit" />} />
      
      {/* Route for viewing site details */}
      <Route path=":id" element={<SiteDetail />} />
      
      {/* Catch any invalid routes and redirect to the main listing */}
      <Route path="*" element={<Navigate to="/sites" />} />
    </Routes>
  );
} 