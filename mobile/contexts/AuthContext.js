import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Конфигурация API
  const API_URL = 'https://api.zunda.ru'; // Твой бэкенд URL

  // Проверка авторизации при загрузке
  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@zunda_token');
      const storedUser = await AsyncStorage.getItem('@zunda_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        
        // Устанавливаем заголовок для всех запросов
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Регистрация
  const register = async (phone, password, name) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        phone,
        password,
        name
      });

      const { token: newToken, user: newUser } = response.data.data;
      
      // Сохраняем данные
      await AsyncStorage.setItem('@zunda_token', newToken);
      await AsyncStorage.setItem('@zunda_user', JSON.stringify(newUser));
      
      // Обновляем состояние
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Устанавливаем заголовок для всех запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Ошибка регистрации' 
      };
    }
  };

  // Вход
  const login = async (phone, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        phone,
        password
      });

      const { token: newToken, user: newUser } = response.data.data;
      
      // Сохраняем данные
      await AsyncStorage.setItem('@zunda_token', newToken);
      await AsyncStorage.setItem('@zunda_user', JSON.stringify(newUser));
      
      // Обновляем состояние
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Устанавливаем заголовок для всех запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Ошибка входа' 
      };
    }
  };

  // Вход через VK
  const loginWithVK = async (vkToken, vkUserId) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/vk`, {
        vk_token: vkToken,
        vk_user_id: vkUserId
      });

      const { token: newToken, user: newUser } = response.data.data;
      
      // Сохраняем данные
      await AsyncStorage.setItem('@zunda_token', newToken);
      await AsyncStorage.setItem('@zunda_user', JSON.stringify(newUser));
      
      // Обновляем состояние
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Устанавливаем заголовок для всех запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Ошибка входа через VK:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Ошибка входа через VK' 
      };
    }
  };

  // Выход
  const logout = async () => {
    try {
      // Очищаем AsyncStorage
      await AsyncStorage.removeItem('@zunda_token');
      await AsyncStorage.removeItem('@zunda_user');
      
      // Сбрасываем состояние
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Удаляем заголовок авторизации
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка выхода:', error);
      return { success: false, error: 'Ошибка выхода' };
    }
  };

  // Обновление данных пользователя
  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('@zunda_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      return { success: false, error: 'Ошибка обновления данных' };
    }
  };

  // Обновление баланса коинов
  const updateBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, zunda_coins: newBalance };
      AsyncStorage.setItem('@zunda_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        checkAuth,
        register,
        login,
        loginWithVK,
        logout,
        updateUser,
        updateBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
