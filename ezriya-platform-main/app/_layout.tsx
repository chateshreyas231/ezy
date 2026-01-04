// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AuthProvider from './context/AuthContext';
import UserProvider from './context/UserContext';

// Suppress network errors in console to prevent spam
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filter out Supabase network errors
    if (
      message.includes('Network request failed') ||
      message.includes('AuthRetryableFetchError') ||
      (message.includes('TypeError') && message.includes('fetch'))
    ) {
      // Suppress these errors in development
      return;
    }
    originalError.apply(console, args);
  };
}

export default function RootLayout() {
  const cs = useColorScheme();
  const theme: Theme = cs === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider value={theme}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}
