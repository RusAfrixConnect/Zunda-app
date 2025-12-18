import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Alert,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const WalletScreen = () => {
  const { user, updateBalance } = useAuth();
  const navigation = useNavigation();
  const [balance, setBalance] = useState(user?.zunda_coins || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Пакеты для покупки коинов
  const coinPackages = [
    { id: 'mini', rub: 99, coins: 100, bonus: 0, popular: false },
    { id: 'basic', rub: 299, coins: 320, bonus: 20, popular: false },
    { id: 'standard', rub: 599, coins: 700, bonus: 100, popular: true },
    { id: 'premium', rub: 1199, coins: 1500, bonus: 300, popular: false },
    { id: 'vip', rub: 2999, coins: 4000, bonus: 1000, popular: false },
  ];

  // Загружаем историю транзакций
  const loadTransactions = async () => {
    try {
      const response = await axios.get('https://api.zunda.ru/api/payment/transactions');
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить историю транзакций');
    }
  };

  // Обновление данных при фокусе
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
      setBalance(user?.zunda_coins || 0);
    });

    return unsubscribe;
  }, [navigation, user]);

  // Обновление при вытягивании
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // Покупка коинов
  const handleBuyCoins = async (pkg) => {
    try {
      setLoading(true);
      
      const response = await axios.post('https://api.zunda.ru/api/payment/create-payment', {
        packageId: pkg.id
      });

      if (response.data.success) {
        // Открываем браузер для оплаты через ЮKassa
        // Используем InAppBrowser или WebView
        Alert.alert(
          'Оплата',
          `Вы будете перенаправлены на страницу оплаты ${pkg.rub} руб.`,
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Продолжить', 
              onPress: () => {
                // TODO: Открыть InAppBrowser с confirmationUrl
                console.log('URL оплаты:', response.data.data.confirmationUrl);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Ошибка покупки коинов:', error);
      Alert.alert('Ошибка', 'Не удалось создать платеж');
    } finally {
      setLoading(false);
    }
  };

  // Форматирование суммы
  const formatAmount = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Рендер пакета коинов
  const renderPackage = ({ item }) => (
    <TouchableOpacity
      style={[styles.packageCard, item.popular && styles.popularPackage]}
      onPress={() => handleBuyCoins(item)}
      disabled={loading}
    >
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>ПОПУЛЯРНЫЙ</Text>
        </View>
      )}
      
      <View style={styles.packageContent}>
        <Text style={styles.coinAmount}>{formatAmount(item.coins)}</Text>
        <Text style={styles.coinText}>Zunda Coins</Text>
        
        {item.bonus > 0 && (
          <View style={styles.bonusContainer}>
            <Icon name="gift" size={14} color="#FF9500" />
            <Text style={styles.bonusText}>+{item.bonus} бонус</Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{item.rub} ₽</Text>
          <Text style={styles.priceSubtext}>
            ≈ {Math.round(item.rub / item.coins * 1000) / 1000} ₽ за коин
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.buyButton}
        onPress={() => handleBuyCoins(item)}
      >
        <Text style={styles.buyButtonText}>КУПИТЬ</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Рендер транзакции
  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Icon 
          name={item.type === 'coin_purchase' ? 'add-circle' : 'remove-circle'} 
          size={24} 
          color={item.type === 'coin_purchase' ? '#34C759' : '#FF3B30'} 
        />
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {item.type === 'coin_purchase' ? 'Пополнение коинов' : 'Вывод средств'}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(item.created_at).toLocaleDateString('ru-RU')}
        </Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: item.type === 'coin_purchase' ? '#34C759' : '#FF3B30' }
        ]}>
          {item.type === 'coin_purchase' ? '+' : '-'}{formatAmount(item.amount)} коинов
        </Text>
        <Text style={styles.statusText}>
          {item.status === 'completed' ? '✅ Выполнено' : 
           item.status === 'pending' ? '⏳ В обработке' : 
           item.status === 'failed' ? '❌ Ошибка' : '❓ Неизвестно'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Заголовок и баланс */}
      <View style={styles.header}>
        <Text style={styles.title}>Мой кошелек</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Withdrawal')}>
          <Icon name="arrow-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Карточка баланса */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Баланс Zunda Coins</Text>
          <Icon name="wallet" size={20} color="#8E8E93" />
        </View>
        
        <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
        <Text style={styles.balanceRub}>≈ {formatAmount(balance)} ₽</Text>
        
        <View style={styles.balanceActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Withdrawal')}
          >
            <Icon name="arrow-down" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Вывести</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.buyButton]}
            onPress={() => {/* Скролл к пакетам */}}
          >
            <Icon name="add" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Пополнить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Быстрые действия */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickIcon, { backgroundColor: '#5856D6' }]}>
            <Icon name="gift" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.quickText}>Подарки</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickIcon, { backgroundColor: '#FF9500' }]}>
            <Icon name="trending-up" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.quickText}>Статистика</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickIcon, { backgroundColor: '#34C759' }]}>
            <Icon name="people" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.quickText}>Рефералы</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickIcon, { backgroundColor: '#FF3B30' }]}>
            <Icon name="settings" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.quickText}>Настройки</Text>
        </TouchableOpacity>
      </View>

      {/* Пакеты коинов */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Пополнить баланс</Text>
        <Text style={styles.sectionSubtitle}>Выберите пакет Zunda Coins</Text>
        
        <FlatList
          data={coinPackages}
          renderItem={renderPackage}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.packagesList}
          contentContainerStyle={styles.packagesContainer}
        />
      </View>

      {/* История транзакций */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>История транзакций</Text>
          <TouchableOpacity onPress={loadTransactions}>
            <Text style={styles.seeAllText}>Все</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.length > 0 ? (
          <FlatList
            data={transactions.slice(0, 5)}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="receipt" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>Нет транзакций</Text>
            <Text style={styles.emptySubtext}>Здесь будет история ваших операций</Text>
          </View>
        )}
      </View>

      {/* Информация о выводе */}
      <View style={styles.infoCard}>
        <Icon name="information-circle" size={20} color="#007AFF" />
        <Text style={styles.infoText}>
          Минимальная сумма для вывода: 500 ₽{'\n'}
          Средства поступают в течение 24-48 часов
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  balanceRub: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buyButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  packagesList: {
    marginHorizontal: -16,
  },
  packagesContainer: {
    paddingHorizontal: 16,
  },
  packageCard: {
    width: 160,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  popularPackage: {
    borderColor: '#FF9500',
    backgroundColor: '#FFF4E5',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  packageContent: {
    marginBottom: 16,
  },
  coinAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  coinText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  bonusText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  priceContainer: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  priceSubtext: {
    fontSize: 10,
    color: '#8E8E93',
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
});

export default WalletScreen;
