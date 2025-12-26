import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const LiveScreen = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [liveStreams] = useState([
    { id: 1, user: 'DJ Макс', title: 'Танцевальный микс', viewers: '1.2K', category: 'Музыка' },
    { id: 2, user: 'Аня Фитнес', title: 'Утренняя тренировка', viewers: '850', category: 'Фитнес' },
    { id: 3, user: 'Путешественник', title: 'Горы Алтая', viewers: '2.4K', category: 'Путешествия' },
    { id: 4, user: 'Шеф Повар', title: 'Готовим ужин', viewers: '560', category: 'Кулинария' },
    { id: 5, user: 'GamerPro', title: 'Турнир по Dota 2', viewers: '5.7K', category: 'Игры' },
  ]);

  const [upcoming] = useState([
    { id: 1, user: 'Йога с Аней', time: '18:00', title: 'Вечерняя йога' },
    { id: 2, user: 'IT Конференция', time: '20:00', title: 'Новые технологии' },
    { id: 3, user: 'Музыкальный вечер', time: '22:00', title: 'Акустический концерт' },
  ]);

  const renderLiveStream = ({ item }) => (
    <TouchableOpacity style={styles.liveCard}>
      <View style={styles.liveThumbnail}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewersBadge}>
          <Icon name="people" size={12} color="#fff" />
          <Text style={styles.viewersText}>{item.viewers}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.liveInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
        </View>
        <View style={styles.liveDetails}>
          <Text style={styles.liveTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.liveUser}>{item.user}</Text>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Icon name="add" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderUpcoming = ({ item }) => (
    <TouchableOpacity style={styles.upcomingCard}>
      <View style={styles.upcomingTime}>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <View style={styles.upcomingInfo}>
        <Text style={styles.upcomingTitle}>{item.title}</Text>
        <Text style={styles.upcomingUser}>{item.user}</Text>
      </View>
      <TouchableOpacity style={styles.reminderButton}>
        <Text style={styles.reminderText}>Напомнить</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live</Text>
        <TouchableOpacity style={styles.goLiveButton}>
          <Icon name="videocam" size={20} color="#fff" />
          <Text style={styles.goLiveText}>Начать эфир</Text>
        </TouchableOpacity>
      </View>

      {/* Табы */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
            Сейчас в эфире
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Скоро начнется
          </Text>
        </TouchableOpacity>
      </View>

      {/* Список стримов */}
      {activeTab === 'live' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Популярные трансляции</Text>
          <FlatList
            data={liveStreams}
            renderItem={renderLiveStream}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Предстоящие эфиры</Text>
          <FlatList
            data={upcoming}
            renderItem={renderUpcoming}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Категории */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>По категориям</Text>
        <View style={styles.categoriesGrid}>
          {[
            { icon: '🎵', name: 'Музыка' },
            { icon: '🎮', name: 'Игры' },
            { icon: '💪', name: 'Фитнес' },
            { icon: '🍳', name: 'Кулинария' },
            { icon: '🎨', name: 'Творчество' },
            { icon: '📚', name: 'Образование' },
          ].map((cat, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryIconText}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  goLiveButton: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 
  },
  goLiveText: { color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 },
  tabsContainer: { 
    flexDirection: 'row', backgroundColor: '#fff', marginTop: 8,
    paddingHorizontal: 16, paddingVertical: 4 
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#FF3B30' },
  tabText: { fontSize: 16, color: '#8E8E93', fontWeight: '500' },
  activeTabText: { color: '#FF3B30', fontWeight: '600' },
  section: { backgroundColor: '#fff', marginTop: 8, paddingVertical: 16 },
  sectionTitle: { 
    fontSize: 18, fontWeight: 'bold', color: '#000',
    marginHorizontal: 16, marginBottom: 16 
  },
  liveCard: { marginHorizontal: 16, marginBottom: 16 },
  liveThumbnail: { 
    height: 200, backgroundColor: '#000', borderRadius: 12,
    justifyContent: 'space-between', padding: 12 
  },
  liveBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30',
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 
  },
  liveDot: { width: 8, height: 8, backgroundColor: '#fff', borderRadius: 4, marginRight: 6 },
  liveText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  viewersBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
    alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 
  },
  viewersText: { color: '#fff', fontSize: 12, marginLeft: 4 },
  categoryBadge: { 
    backgroundColor: 'rgba(0,0,0,0.6)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 
  },
  categoryText: { color: '#fff', fontSize: 12 },
  liveInfo: { 
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    paddingHorizontal: 4 
  },
  userAvatar: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  liveDetails: { flex: 1 },
  liveTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  liveUser: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  followButton: { 
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    borderColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' 
  },
  upcomingCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8',
    marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 
  },
  upcomingTime: { 
    backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, marginRight: 16 
  },
  timeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  upcomingUser: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  reminderButton: { 
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E5EA',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 
  },
  reminderText: { fontSize: 14, color: '#000', fontWeight: '500' },
  categoriesGrid: { 
    flexDirection: 'row', flexWrap: 'wrap', 
    paddingHorizontal: 16, justifyContent: 'space-between' 
  },
  categoryItem: { width: '30%', alignItems: 'center', marginBottom: 20 },
  categoryIcon: { 
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8 
  },
  categoryIconText: { fontSize: 24 },
  categoryName: { fontSize: 14, color: '#000', textAlign: 'center' },
});

export default LiveScreen;
