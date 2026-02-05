// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthProvider from './context/AuthContext';
import UserProvider from './context/UserContext';
import { Theme } from '../constants/Theme';

// Suppress network errors in console to prevent spam
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filter out Supabase network errors, timeouts, and connection test failures
    if (
      message.includes('Network request failed') ||
      message.includes('AuthRetryableFetchError') ||
      message.includes('Session check timeout') ||
      message.includes('timeout') ||
      message.includes('Supabase connection test failed') ||
      message.includes('This usually means') ||
      message.includes('Supabase project is paused') ||
      message.includes('URL is incorrect') ||
      message.includes('Network/DNS issue') ||
      (message.includes('TypeError') && message.includes('fetch'))
    ) {
      // Suppress these errors in development - they're expected when offline or Supabase is paused
      return;
    }
    originalError.apply(console, args);
  };
}

export default function RootLayout() {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" />
      <AuthProvider>
        <UserProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Theme.colors.background },
            }}
          />
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});
