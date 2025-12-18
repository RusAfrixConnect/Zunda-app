import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  LogBox,
  Platform,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';

// Ignorer certains warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

// Garder le splash screen visible pendant le chargement
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// Screens
import HomeScreen from './screens/HomeScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import LiveScreen from './screens/LiveScreen';
import WalletScreen from './screens/WalletScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import GiftStoreScreen from './screens/GiftStoreScreen';
import WithdrawalScreen from './screens/WithdrawalScreen';
import LiveStreamScreen from './screens/LiveStreamScreen';
import StoryViewerScreen from './screens/StoryViewerScreen';
import ChatScreen from './screens/ChatScreen';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Config
const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5000';
console.log('🔧 API URL configurée:', API_URL);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Thème personnalisé
const ZundaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF3B30', // Rouge Zunda
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    notification: '#FF3B30',
  },
};

// Tab Navigator principal
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Главная':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Поиск':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Live':
              iconName = focused ? 'radio' : 'radio-outline';
              break;
            case 'Кошелек':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Профиль':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Главная" 
        component={HomeScreen}
        options={{
          tabBarBadge: undefined, // Tu peux ajouter un badge plus tard
        }}
      />
      <Tab.Screen name="Поиск" component={DiscoverScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Кошелек" component={WalletScreen} />
      <Tab.Screen name="Профиль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Écran de chargement
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="#FF3B30" />
      <Text style={{ marginTop: 20, fontSize: 16, color: '#8E8E93' }}>Загрузка Zunda...</Text>
      <Text style={{ marginTop: 10, fontSize: 12, color: '#C7C7CC' }}>
        API: {API_URL.replace('https://', '').replace('http://', '').split('/')[0]}
      </Text>
    </View>
  );
}

// Écran de test de connexion
function ConnectionTestScreen() {
  const [status, setStatus] = useState('Проверка подключения...');
  const [apiStatus, setApiStatus] = useState('⏳');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Проверка API сервера...');
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      
      if (data.status === 'работает') {
        setApiStatus('✅');
        setStatus('API сервер работает нормально!');
      } else {
        setApiStatus('❌');
        setStatus('API сервер не отвечает правильно');
      }
    } catch (error) {
      setApiStatus('❌');
      setStatus(`Ошибка подключения: ${error.message}`);
      console.error('Ошибка подключения к API:', error);
    }
  };

  const openApiUrl = () => {
    Linking.openURL(API_URL).catch(err => 
      console.error('Не удалось открыть URL:', err)
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
      <Icon name="wifi" size={60} color="#FF3B30" />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#000000' }}>
        Zunda Connection Test
      </Text>
      
      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000000' }}>
          Статус API: {apiStatus}
        </Text>
        <Text style={{ fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 10 }}>
          {status}
        </Text>
        
        <Text style={{ fontSize: 12, color: '#C7C7CC', marginTop: 30 }}>
          API URL: {API_URL}
        </Text>
        
        <View style={{ marginTop: 40, gap: 10 }}>
          <Text style={{ fontSize: 14, color: '#8E8E93', textAlign: 'center' }}>
            Если API не работает:
          </Text>
          <Text style={{ fontSize: 12, color: '#C7C7CC', textAlign: 'center' }}>
            1. Убедитесь, что бэкенд запущен
          </Text>
          <Text style={{ fontSize: 12, color: '#C7C7CC', textAlign: 'center' }}>
            2. Проверьте настройки Codespaces
          </Text>
          <Text style={{ fontSize: 12, color: '#C7C7CC', textAlign: 'center' }}>
            3. Проверьте конфигурацию портов
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 30 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#FF3B30',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
            onPress={testConnection}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Проверить снова</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
            onPress={openApiUrl}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Открыть API</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Contenu principal de l'app
function AppContent() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Vérifier la connexion API
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
          throw new Error('API не отвечает');
        }
        
        // Vérifier l'authentification
        await checkAuth();
        
        // Cacher le splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Ошибка при запуске:', error);
        setConnectionError(true);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  // Si erreur de connexion, montrer l'écran de test
  if (connectionError) {
    return <ConnectionTestScreen />;
  }

  return (
    <NavigationContainer theme={ZundaTheme}>
      <Stack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5EA',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          headerBackTitleVisible: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {!isAuthenticated ? (
          // Écrans non authentifiés
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          // Écrans authentifiés
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }}
            />
            
            {/* Modals et écrans supplémentaires */}
            <Stack.Screen 
              name="GiftStore" 
              component={GiftStoreScreen} 
              options={{ 
                title: 'Магазин подарков',
                presentation: 'modal'
              }} 
            />
            
            <Stack.Screen 
              name="Withdrawal" 
              component={WithdrawalScreen} 
              options={{ 
                title: 'Вывод средств',
                presentation: 'modal'
              }} 
            />
            
            <Stack.Screen 
              name="LiveStream" 
              component={LiveStreamScreen} 
              options={{ 
                title: 'Прямой эфир',
                headerShown: true
              }} 
            />
            
            <Stack.Screen 
              name="StoryViewer" 
              component={StoryViewerScreen} 
              options={{ 
                headerShown: false,
                presentation: 'transparentModal'
              }} 
            />
            
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen} 
              options={{ 
                title: 'Чат',
                headerShown: true
              }} 
            />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

// Composant principal
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadResources() {
      try {
        // Charger les fonts si besoin
        // await Font.loadAsync({ ... });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Ошибка загрузки ресурсов:', error);
        setFontsLoaded(true); // Continuer même en cas d'erreur
      }
    }

    loadResources();
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

// TouchableOpacity manquant dans ConnectionTestScreen
const TouchableOpacity = ({ style, onPress, children }) => (
  <View style={style} onStartShouldSetResponder={() => true} onResponderRelease={onPress}>
    {children}
  </View>
);
