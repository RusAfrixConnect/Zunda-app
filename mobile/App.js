import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Экранные компоненты
import HomeScreen from './screens/HomeScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import LiveScreen from './screens/LiveScreen';
import WalletScreen from './screens/WalletScreen'; // Contient les corrections
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import GiftStoreScreen from './screens/GiftStoreScreen';
import WithdrawalScreen from './screens/WithdrawalScreen';

// Контекст авторизации (import gardé pour la structure)
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
        options={{ tabBarBadge: 3 }}
      />
      <Tab.Screen name="Поиск" component={DiscoverScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Кошелек" component={WalletScreen} />
      <Tab.Screen name="Профиль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Компонент загрузки (sans ActivityIndicator problématique)
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 18, color: '#FF3B30', fontWeight: 'bold' }}>●</Text>
      <Text style={{ marginTop: 20, fontSize: 16, color: '#8E8E93' }}>Загрузка Zunda...</Text>
    </View>
  );
}

// Главный компонент приложения
function AppContent() {
  // ✅ Valeurs fixes pour tester TOUTE l'application (onglets + écrans)
  const isAuthenticated = true;   // Voir les onglets
  const isLoading = false;        // Pas d'écran de chargement
  const checkAuth = () => { console.log('checkAuth called'); };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Si non authentifié : écran de connexion
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          // Si authentifié : onglets + écrans modaux
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
}

// Экспорт основного компонента
export default function App() {
  // ✅ Version sans AuthProvider (pour éviter tout conflit)
  return (
    <View style={{ flex: 1 }}>
      <AppContent />
    </View>
  );
  
  // ❌ Ancienne version (à garder commentée pour l'instant)
  // return (
  //   <AuthProvider>
  //     <AppContent />
  //   </AuthProvider>
  // );
}
