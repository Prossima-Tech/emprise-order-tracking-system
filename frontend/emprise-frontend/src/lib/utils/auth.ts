import { jwtDecode } from 'jwt-decode';
import { TOKEN_KEY, USER_KEY } from '../config/constants';
import { ROUTES } from '../config/routes';

export type UserRole = 'ADMIN' | 'PO_SPECIALIST' | 'BO_SPECIALIST';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 > Date.now() : false;
  } catch {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getDefaultRouteForRole = (role: UserRole): string => {
  switch (role) {
    case 'PO_SPECIALIST':
      return ROUTES.PURCHASE_ORDERS;
    case 'BO_SPECIALIST':
      return ROUTES.OFFERS;
    case 'ADMIN':
      return ROUTES.DASHBOARD;
    default:
      return ROUTES.DASHBOARD;
  }
};
