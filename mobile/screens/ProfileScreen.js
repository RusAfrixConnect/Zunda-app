import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const [user] = useState({
    name: 'Александр',
    username: '@alex_zunda',
    bio: 'Люблю путешествия, фотографию и фитнес',
    followers: '2.4K',
    following: '356',
    posts: '128'
  });

  const [stats] = useState([
    { label: 'Зунда коины', value: '1,250', icon: '💎' },
    { label: 'Уровень', value: '12', icon: '⭐' },
    { label: 'Дней в Zunda', value: '45', icon: '📅' },
  ]);

  const [posts] = useState([
    { id: 1, type: 'photo', content: 'Новые горы', likes: 124, comments: 18 },
    { id: 2, type: 'text', content: 'Достиг новой цели в беге!', likes: 89, comments: 12 },
    { id: 3, type: 'live', content: 'Прямой эфир из путешествия', likes: 567, comments: 45 },
    { id: 4, type: 'photo', content: 'Закат на море', likes: 234, comments: 32 },
  ]);

  const [menuItems] = useState([
    { icon: 'settings', title: 'Настройки' },
    { icon: 'shield-checkmark', title: 'Безопасность' },
    { icon: 'wallet', title: 'Платежи' },
    { icon: 'notifications', title: 'Уведомления' },
    { icon: 'help-circle', title: 'Помощь' },
    { icon: 'log-out', title: 'Выйти', color: '#FF3B30' },
  ]);

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={[styles.postType, item.type === 'photo' && styles.photoType,
                     item.type === 'live' && styles.liveType]}>
          <Icon 
            name={item.type === 'photo' ? 'image' : item.type === 'live' ? 'videocam' : 'text'} 
            size={16} 
            color="#fff" 
          />
        </View>
        <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      </View>
      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Icon name="heart" size={16} color="#FF3B30" />
          <Text style={styles.statText}>{item.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="chatbubble" size={16} color="#007AFF" />
          <Text style={styles.statText}>{item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <Icon name={item.icon} size={22} color={item.color || '#000'} />
        <Text style={[styles.menuTitle, item.color && { color: item.color }]}>{item.title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#8E8E93" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Профиль</Text>
        <TouchableOpacity>
          <Icon name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Информация пользователя */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>А</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileUsername}>{user.username}</Text>
            <Text style={styles.profileBio}>{user.bio}</Text>
          </View>
        </View>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>{user.posts}</Text>
            <Text style={styles.statLabel}>Публикаций</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>{user.followers}</Text>
            <Text style={styles.statLabel}>Подписчиков</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>Подписок</Text>
          </View>
        </View>

        {/* Действия */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Редактировать профиль</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Статистика в карточках */}
      <View style={styles.statsCards}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statCardValue}>{stat.value}</Text>
            <Text style={styles.statCardLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Мои публикации */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Мои публикации</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Все</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.postsList}
        />
      </View>

      {/* Меню настроек */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки</Text>
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  profileCard: { 
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8,
    padding: 20, borderRadius: 16 
  },
  profileHeader: { flexDirection: 'row', marginBottom: 20 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF3B30',
    justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  editAvatarButton: { 
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' 
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  profileUsername: { fontSize: 16, color: '#8E8E93', marginTop: 2 },
  profileBio: { fontSize: 14, color: '#000', marginTop: 8, lineHeight: 20 },
  statsRow: { 
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F2F2F7',
    borderBottomWidth: 1, borderBottomColor: '#F2F2F7' 
  },
  statColumn: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  actionButtons: { 
    flexDirection: 'row', marginTop: 20,
    justifyContent: 'space-between', alignItems: 'center' 
  },
  editButton: { 
    flex: 1, backgroundColor: '#F2F2F7', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center', marginRight: 12 
  },
  editButtonText: { fontSize: 16, fontWeight: '600', color: '#000' },
  shareButton: { 
    width: 44, height: 44, borderRadius: 10, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center' 
  },
  statsCards: { 
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 16 
  },
  statCard: { 
    flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12,
    alignItems: 'center', marginHorizontal: 4 
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statCardValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  statCardLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  section: { backgroundColor: '#fff', marginTop: 8, paddingVertical: 16 },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginHorizontal: 16, marginBottom: 16 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginHorizontal: 16 },
  seeAll: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  postsList: { paddingLeft: 16 },
  postCard: { 
    width: 160, backgroundColor: '#F8F8F8', marginRight: 12,
    padding: 12, borderRadius: 12 
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postType: { 
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center', marginRight: 8 
  },
  photoType: { backgroundColor: '#34C759' },
  liveType: { backgroundColor: '#FF3B30' },
  postContent: { flex: 1, fontSize: 14, color: '#000' },
  postStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  menuItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7' 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuTitle: { fontSize: 16, color: '#000', marginLeft: 12 },
});

export default ProfileScreen;
