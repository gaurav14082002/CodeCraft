'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetcher } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('codecraft_token');
    if (storedToken) {
      setToken(storedToken);
      fetcher('/auth/me')
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetcher('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.token) {
      localStorage.setItem('codecraft_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, role = 'student') => {
    const res = await fetcher('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    if (res.success && res.token) {
      localStorage.setItem('codecraft_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const demoLogin = async (role = 'student') => {
    const res = await fetcher('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });

    if (res.success && res.token) {
      localStorage.setItem('codecraft_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Demo login failed');
  };

  const logout = () => {
    localStorage.removeItem('codecraft_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await fetcher('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isInstructor: user?.role === 'instructor' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
