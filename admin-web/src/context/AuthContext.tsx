import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../api/client';

export interface StaffUser {
  staffId: number;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: StaffUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string, user: StaffUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          removeStoredToken();
          setUser(null);
        }
      })
      .catch(() => {
        removeStoredToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (token: string, staffUser: StaffUser) => {
    setStoredToken(token);
    setUser(staffUser);
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
