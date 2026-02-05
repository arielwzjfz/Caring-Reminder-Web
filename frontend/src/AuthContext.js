import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from './api';
import { getToken, removeToken } from './auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await getCurrentUser();
          setUser(data.user);
        } catch (error) {
          // Token invalid or API error, remove it
          console.error('Auth check failed:', error);
          removeToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timed out');
        setLoading(false);
      }
    }, 5000);

    checkAuth().finally(() => {
      clearTimeout(timeout);
    });
  }, []);

  const login = (userData, token) => {
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

