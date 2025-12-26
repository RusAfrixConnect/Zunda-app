import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DiscoverScreen = () => {
  const [search, setSearch] = useState('');
  const [categories] = useState([
    { id: 1, name: 'Популярное', icon: 'flame' },
    { id: 2, name: 'Новое', icon: 'time' },
    { id: 3, name: 'Рядом', icon: 'location' },
    { id: 4, name: 'Игры', icon: 'game-controller' },
    { id: 5, name: 'Музыка', icon: 'musical-notes' },
  ]);

  const [discoverItems] = useState([
    { id: 1, title: 'Фитнес челлендж', users: '12K участников', icon: '🏃' },
    { id: 2, title: 'Кулинарный клуб', users: '8.5K участников', icon: '🍳' },
    { id: 3, title: 'Фотографы', users: '25K участников', icon: '📷' },
    { id: 4, title: 'Путешествия', users: '18K участников', icon: '✈️' },
    { id: 5, title: 'IT сообщество', users: '32K участников', icon: '💻' },
    { id: 6, title: 'Искусство', users: '9.3K участников', icon: '🎨' },
  ]);

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Icon name={item.icon} size={24} color="#FF3B30" />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDiscoverItem = ({ item }) => (
    <TouchableOpacity style={styles.discoverCard}>
      <View style={styles.discoverIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.discoverInfo}>
        <Text style={styles.discoverTitle}>{item.title}</Text>
        <Text style={styles.discoverUsers}>{item.users}</Text>
      </View>
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinText}>Присоединиться</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Поиск</Text>
      </View>

      {/* Поиск */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Найти людей, группы, темы..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Категории */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Категории</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        />
      </View>

      {/* Рекомендуем */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Рекомендуем</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Все</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={discoverItems}
          renderItem={renderDiscoverItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Популярные теги */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Популярные теги</Text>
        <View style={styles.tagsContainer}>
          {['#фитнес', '#рецепты', '#путешествия', '#технологии', '#искусство', '#музыка'].map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginVertical: 16, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA'
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, height: 44, fontSize: 16 },
  section: { backgroundColor: '#fff', marginTop: 8, paddingVertical: 16 },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginHorizontal: 16, marginBottom: 16 
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginHorizontal: 16 },
  seeAll: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  categoriesList: { paddingLeft: 16, marginTop: 8 },
  categoryCard: { 
    alignItems: 'center', marginRight: 20, paddingVertical: 12,
    paddingHorizontal: 16, backgroundColor: '#F8F8F8', borderRadius: 20 
  },
  categoryText: { fontSize: 14, color: '#000', marginTop: 8, fontWeight: '500' },
  discoverCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 12, padding: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA'
  },
  discoverIcon: { 
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center', marginRight: 16 
  },
  iconText: { fontSize: 24 },
  discoverInfo: { flex: 1 },
  discoverTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  discoverUsers: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  joinButton: { 
    backgroundColor: '#FF3B30', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8 
  },
  joinText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  tagsContainer: { 
    flexDirection: 'row', flexWrap: 'wrap', 
    paddingHorizontal: 16, marginTop: 8 
  },
  tag: { 
    backgroundColor: '#F2F2F7', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 16, marginRight: 8, marginBottom: 8 
  },
  tagText: { fontSize: 14, color: '#000' },
});

export default DiscoverScreen;
