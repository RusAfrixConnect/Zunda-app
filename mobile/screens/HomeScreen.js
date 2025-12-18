import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Главная страница Zunda</Text>
      <Text style={styles.subtext}>Здесь будут истории и лента</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtext: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 10,
  },
});

export default HomeScreen;
