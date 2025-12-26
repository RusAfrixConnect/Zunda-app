import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Экранные компоненты
import HomeScreen from './screens/HomeScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import LiveScreen from './screens/LiveScreen';
import WalletScreen from './screens/WalletScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import GiftStoreScreen from './screens/GiftStoreScreen';
import WithdrawalScreen from './screens/WithdrawalScreen';

// Контекст авторизации
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Главный таб-навигатор
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Главная') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Поиск') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Live') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'Кошелек') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Профиль') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Главная" 
        component={HomeScreen}
        options={{ tabBarBadge: 3 }} // Уведомления
      />
      <Tab.Screen name="Поиск" component={DiscoverScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Кошелек" component={WalletScreen} />
      <Tab.Screen name="Профиль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Компонент загрузки
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      {/* On remplace ActivityIndicator par un simple текст */}
      <Text style={{ fontSize: 18, color: '#FF3B30', fontWeight: 'bold' }}>●</Text>
      <Text style={{ marginTop: 20, fontSize: 16, color: '#8E8E93' }}>Загрузка Zunda...</Text>
    </View>
  );
}

// Главный компонент приложения - ВЕРСИЯ МИНИМАЛЬНАЯ ДЛЯ ТЕСТА
function AppContent() {
  // 🟢 ВРЕМЕННЫЕ ФИКСИРОВАННЫЕ ЗНАЧЕНИЯ (имитация загрузки)
  const isAuthenticated = false;  // Поменяй на true чтобы проверить главный экран
  const isLoading = false;
  const checkAuth = () => { console.log('checkAuth called'); };
  // 🛑 ЗАКОММЕНТИРУЙ оригинальный вызов useAuth:
  // const { isAuthenticated, isLoading, checkAuth } = useAuth();

  // 🟢 Простейшая заглушка для теста
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Test" 
          component={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>✅ Тест: AppContent работает (без экранов)</Text>
            </View>
          )} 
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
  
  // 🛑 ЗАКОММЕНТИРУЙ весь старый код AppContent (ниже не выполнится)
  /*
  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="GiftStore" 
              component={GiftStoreScreen} 
              options={{ 
                headerShown: true, 
                title: 'Магазин подарков',
                headerBackTitle: 'Назад'
              }} 
            />
            <Stack.Screen 
              name="Withdrawal" 
              component={WithdrawalScreen} 
              options={{ 
                headerShown: true, 
                title: 'Вывод средств',
                headerBackTitle: 'Назад'
              }} 
            />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
  */
}

// Экспорт основного компонента - ВЕРСИЯ ТЕСТ (без AuthProvider)
export default function App() {
  // 🟢 ВРЕМЕННАЯ ВЕРСИЯ: сразу показываем AppContent
  return (
    <View style={{ flex: 1 }}>
      <AppContent />
    </View>
  );
  
  // 🛑 ЗАКОММЕНТИРУЙ старую версию:
  // return (
  //   <AuthProvider>
  //     <AppContent />
  //   </AuthProvider>
  // );
}
