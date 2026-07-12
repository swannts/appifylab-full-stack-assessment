import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getAccessToken, getRefreshToken, getUser, setAuthData, clearAuthData, revokeRefreshToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAction: (accessToken: string, refreshToken: string, user: User) => void;
  logoutAction: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Perform initial state check from localStorage
    const token = getAccessToken();
    const storedUser = getUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const loginAction = (accessToken: string, refreshToken: string, user: User) => {
    setAuthData(accessToken, refreshToken, user);
    setUser(user);
  };

  const logoutAction = async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }
    } catch (error) {
      console.error('Failed to revoke refresh token during logout', error);
    } finally {
      clearAuthData();
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
