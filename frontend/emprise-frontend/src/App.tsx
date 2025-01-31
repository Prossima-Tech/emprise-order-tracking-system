import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './routes/protected';
import { ThemeProvider } from './context/ThemeProvider';
import { AuthProvider } from './context/AuthProvider';
import './App.css';

// Page imports
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './features/dashboards/pages/DashboardPage';
import { OffersPage } from './features/budgetary-offers/pages/OffersPage';
import { EMDsPage } from './features/emds/pages/EMDsPage';
import { LOAsPage } from './features/loas/pages/LOAsPage';
import { PurchaseOrdersPage } from './features/purchase-orders/pages/PurchaseOrdersPage';
import { VendorsPage } from './features/vendors/pages/VendorsPage';
import { ItemsPage } from './features/items/pages/ItemsPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/budgetary-offers/*" 
              element={
                <ProtectedRoute>
                  <OffersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emds/*" 
              element={
                <ProtectedRoute>
                  <EMDsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loas/*" 
              element={
                <ProtectedRoute>
                  <LOAsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchase-orders/*" 
              element={
                <ProtectedRoute>
                  <PurchaseOrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/items/*" 
              element={
                <ProtectedRoute>
                  <ItemsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendors/*" 
              element={
                <ProtectedRoute>
                  <VendorsPage />
                </ProtectedRoute>
              } 
            />

            {/* Redirect root to dashboard if authenticated */}
            <Route 
              path="/" 
              element={
                <Navigate to="/dashboard" replace />
              } 
            />

            {/* Catch all route - 404 */}
            <Route 
              path="*" 
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-gray-600">Page not found</p>
                  </div>
                </div>
              } 
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;