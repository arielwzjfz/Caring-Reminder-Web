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
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await getCurrentUser();
          if (isMounted) {
            setUser(data.user);
          }
        } catch (error) {
          // Token invalid or API error, remove it
          console.error('Auth check failed:', error);
          if (isMounted) {
            removeToken();
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth check timed out, assuming not logged in');
        setLoading(false);
      }
    }, 3000);

    checkAuth().finally(() => {
      clearTimeout(timeout);
    });

    return () => {
      isMounted = false;
    };
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

