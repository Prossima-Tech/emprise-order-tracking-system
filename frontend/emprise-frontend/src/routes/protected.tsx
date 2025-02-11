import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/stores/auth-store';
import { hasPermission } from '../lib/utils/authorization';
import { ROUTES } from '../lib/config/routes';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!hasPermission(location.pathname, user?.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
