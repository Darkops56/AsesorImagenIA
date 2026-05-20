import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NODE_API_URL } from '../../config/config';

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  silueta_detectada?: string;
  medidas_morfometricas?: {
    S: number;
    W: number;
    H: number;
  };
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (data: any) => Promise<boolean>;
  registerUser: (data: any) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  updateUserContext: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      const storedToken = await AsyncStorage.getItem('@token');

      if (storedUser && storedToken) {
        // Fallback rápido
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);

        // Fetch latest data from backend to ensure silueta_detectada is present
        try {
          const response = await fetch(`${NODE_API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (response.ok) {
            const latestUser = await response.json();
            setUser(latestUser);
            await AsyncStorage.setItem('@user', JSON.stringify(latestUser));
          }
        } catch (fetchError) {
          console.log('No se pudo verificar el usuario con el backend, usando caché local');
        }
      }
    } catch (error) {
      console.error('Error loading auth data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (data: any) => {
    try {
      const response = await fetch(`${NODE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (response.ok) {
        const { token, ...userData } = resData;
        await AsyncStorage.setItem('@token', token);
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error(resData.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const registerUser = async (data: any) => {
    try {
      const response = await fetch(`${NODE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (response.ok) {
        const { token, ...userData } = resData;
        await AsyncStorage.setItem('@token', token);
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error(resData.message || 'Error al registrarse');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserContext = async (updatedUser: User) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      loginUser,
      registerUser,
      logoutUser,
      updateUserContext
    }}>
      {children}
    </AuthContext.Provider>
  );
};
