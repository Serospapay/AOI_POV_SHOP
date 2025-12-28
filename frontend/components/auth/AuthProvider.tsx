/**
 * Context Provider для автентифікації
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { post } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { decodeJWT, isTokenExpired } from '@/lib/jwt';
import type { User, LoginRequest, RegisterRequest, TokenResponse, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'access_token';
const USER_STORAGE_KEY = 'user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Завантажуємо дані з LocalStorage при монтуванні
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedToken) {
          // Перевіряємо чи токен не прострочений
          if (isTokenExpired(storedToken)) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            setIsLoading(false);
            return;
          }

          // Декодуємо токен для отримання даних користувача
          const decoded = decodeJWT(storedToken);
          if (decoded) {
            setToken(storedToken);
            const userData: User = {
              id: decoded.sub,
              email: decoded.email,
              full_name: '',
              is_admin: decoded.is_admin || false,
              created_at: new Date().toISOString(),
            };
            setUser(userData);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження автентифікації:', error);
        // Очищаємо пошкоджені дані
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await post<TokenResponse>(API_ENDPOINTS.auth.login, {
        email,
        password,
      });

      // Зберігаємо токен
      localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
      setToken(response.access_token);

      // Декодуємо токен для отримання даних користувача
      const decoded = decodeJWT(response.access_token);
      if (decoded) {
        const userData: User = {
          id: decoded.sub,
          email: decoded.email,
          full_name: '',
          is_admin: decoded.is_admin || false,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, full_name: string) => {
    try {
      await post(API_ENDPOINTS.auth.register, {
        email,
        password,
        full_name,
      });

      // Після реєстрації автоматично входимо
      await login(email, password);
    } catch (error) {
      throw error;
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.is_admin || false,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

