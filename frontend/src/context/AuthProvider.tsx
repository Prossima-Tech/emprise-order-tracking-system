import { createContext, useEffect, useState } from 'react';
import { useAuthStore } from '../lib/stores/auth-store';
import { getUser, isAuthenticated as checkAuth } from '../lib/utils/auth';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser, setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    const initializeAuth = () => {
      const user = getUser();
      const isAuthenticated = checkAuth();

      if (user && isAuthenticated) {
        setUser(user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsInitialized(true);
    };

    initializeAuth();
  }, [setUser, setIsAuthenticated]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}
