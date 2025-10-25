import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getMe } from '../utils/api';

/**
 * Authentication Context
 * Manages user authentication state globally across the app
 */

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
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (err) {
          console.error('Error parsing user:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Register new user
   */
  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);

      const data = await registerAPI(name, email, password);

      // Save token and user to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setLoading(false);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(false);

      const data = await loginAPI(email, password);

      // Save token and user to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setLoading(false);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('studySessionStart');
    localStorage.removeItem('isStudySessionActive');
    setUser(null);
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await getMe();
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
