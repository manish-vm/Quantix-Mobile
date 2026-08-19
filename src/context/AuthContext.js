import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

const isMobileRole = (user) => (
  user?.role === 'admin' ||
  user?.role === 'employee' ||
  user?.role === 'vendor' ||
  user?.employeeType === 'vendor'
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await authApi.me();
          if (!mounted) return;
          if (isMobileRole(res.data)) {
            setUser(res.data);
          } else {
            await AsyncStorage.multiRemove(['token', 'user']);
          }
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['token', 'user']);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    init();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (token, userData) => {
    if (!isMobileRole(userData)) {
      throw new Error('This account role is not available in Quantix Mobile.');
    }
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await authApi.me();
    if (!isMobileRole(res.data)) {
      await logout();
      throw new Error('This account role is not available in Quantix Mobile.');
    }
    await AsyncStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    refreshUser,
    isVendor: user?.role === 'vendor' || user?.employeeType === 'vendor'
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
