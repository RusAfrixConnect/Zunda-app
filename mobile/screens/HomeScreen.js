import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [feed, setFeed] = useState([
    { id: 1, user: 'Анна', avatar: '👩', text: 'Отличный день в парке!', likes: 245, comments: 32, time: '2 ч' },
    { id: 2, user: 'Максим', avatar: '👨', text: 'Новый рекорд в беге 🏃', likes: 189, comments: 18, time: '4 ч' },
    { id: 3, user: 'Zunda Team', avatar: '⚡', text: 'Запускаем новые функции на следующей неделе!', likes: 890, comments: 89, time: '1 д' },
  ]);

  const stories = [
    { id: 1, user: 'Ты', avatar: '👤', hasNew: true },
    { id: 2, user: 'Катя', avatar: '👩', hasNew: true },
    { id: 3, user: 'Денис', avatar: '👨', hasNew: false },
    { id: 4, user: 'Оля', avatar: '👱‍♀️', hasNew: true },
    { id: 5, user: 'Артем', avatar: '🧑', hasNew: false },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity style={styles.storyCard}>
      <View style={[styles.storyAvatar, item.hasNew && styles.newStory]}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{item.user}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.postUserInfo}>
          <Text style={styles.postUserName}>{item.user}</Text>
          <Text style={styles.postTime}>{item.time} назад</Text>
        </View>
        <TouchableOpacity>
          <Icon name="ellipsis-horizontal" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postText}>{item.text}</Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="heart-outline" size={22} color="#8E8E93" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chatbubble-outline" size={20} color="#8E8E93" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-social-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Zunda</Text>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Истории */}
      <View style={styles.storiesSection}>
        <Text style={styles.sectionTitle}>Истории</Text>
        <FlatList
          data={stories}
          renderItem={renderStory}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesList}
        />
      </View>

      {/* Лента */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Лента</Text>
        <FlatList
          data={feed}
          renderItem={renderPost}
          keyExtractor={item => item.id.toString()}
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF3B30' },
  storiesSection: { backgroundColor: '#fff', paddingVertical: 16 },
  sectionTitle: { 
    fontSize: 18, fontWeight: 'bold', color: '#000', 
    marginHorizontal: 16, marginBottom: 12 
  },
  storiesList: { paddingLeft: 16 },
  storyCard: { alignItems: 'center', marginRight: 16, width: 70 },
  storyAvatar: { 
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    borderWidth: 2, borderColor: '#E5E5EA'
  },
  newStory: { borderColor: '#FF3B30' },
  avatarText: { fontSize: 28 },
  storyName: { fontSize: 12, color: '#8E8E93', width: 70, textAlign: 'center' },
  feedSection: { backgroundColor: '#fff', marginTop: 8, paddingVertical: 16 },
  postCard: { 
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16,
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA'
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  postAvatarText: { fontSize: 20 },
  postUserInfo: { flex: 1 },
  postUserName: { fontSize: 16, fontWeight: '600', color: '#000' },
  postTime: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  postText: { fontSize: 15, color: '#000', lineHeight: 22, marginBottom: 16 },
  postActions: { 
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7'
  },
  actionButton: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 14, color: '#8E8E93', marginLeft: 6 },
});

export default HomeScreen;
