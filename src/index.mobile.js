import React from 'react';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';
import AppMobile from './AppMobile';

// Use the appropriate App component based on platform
const AppEntry = Platform.OS === 'web' ? App : AppMobile;

// Register the root component for Expo/React Native
registerRootComponent(AppEntry);

// Export for web usage with Vite
export default AppEntry;