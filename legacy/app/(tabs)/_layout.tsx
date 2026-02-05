// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accent} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href={'/auth/sign-in' as const} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme.colors.surfaceElevated,
          borderTopColor: Theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 75,
          ...Theme.shadows.lg,
        },
        tabBarActiveTintColor: Theme.colors.accent,
        tabBarInactiveTintColor: Theme.colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: focused ? Theme.colors.accent : Theme.colors.surfaceElevated2,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
              borderWidth: 2,
              borderColor: focused ? Theme.colors.accent : Theme.colors.border,
              ...Theme.shadows.glowAccent,
            }}>
              <Ionicons name="search" size={30} color={focused ? Theme.colors.textPrimary : Theme.colors.accent} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="archived"
        options={{
          title: 'Agent',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
});
