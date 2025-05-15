import React from 'react';
import { AppRegistry, View, Text, StyleSheet } from 'react-native';
import AppMobile from './src/AppMobile';

// Simple wrapper component for testing
const AppTester = () => {
  return (
    <View style={styles.container}>
      <AppMobile />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Register the app
AppRegistry.registerComponent('NCAAMobileTest', () => AppTester);

export default AppTester;