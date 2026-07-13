import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { apiLogout, apiRequest } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAction: (user: User) => void;
  logoutAction: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const response = await apiRequest('/api/auth/profile', {
          skipUnauthorizedRedirect: true,
        });

        if (mounted) {
          setUser(response.user || null);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const loginAction = (user: User) => {
    setUser(user);
  };

  const logoutAction = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Failed during logout', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAction, logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
