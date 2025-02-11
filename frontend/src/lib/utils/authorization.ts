import { ROUTES } from '../config/routes';
import type { UserRole } from './auth';

const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  [ROUTES.PURCHASE_ORDERS]: ['ADMIN', 'PO_SPECIALIST'],
  [ROUTES.ITEMS]: ['ADMIN', 'PO_SPECIALIST'],
  [ROUTES.VENDORS]: ['ADMIN', 'PO_SPECIALIST'],
  [ROUTES.OFFERS]: ['ADMIN', 'BO_SPECIALIST'],
  // Routes accessible by all authenticated users
  [ROUTES.DASHBOARD]: ['ADMIN', 'PO_SPECIALIST', 'BO_SPECIALIST'],
  [ROUTES.EMDS]: ['ADMIN', 'PO_SPECIALIST', 'BO_SPECIALIST'],
  [ROUTES.LOAS]: ['ADMIN', 'PO_SPECIALIST', 'BO_SPECIALIST'],
  [ROUTES.SITES]: ['ADMIN', 'PO_SPECIALIST', 'BO_SPECIALIST'],
};

export const hasPermission = (path: string, role?: UserRole | null): boolean => {
  if (!role) return false;
  
  // Find the matching route (including wildcard routes)
  const route = Object.keys(ROUTE_PERMISSIONS).find(r => 
    path.startsWith(r) || path === r
  );
  
  if (!route) return true; // If route is not defined in permissions, allow access
  return ROUTE_PERMISSIONS[route].includes(role);
}; 