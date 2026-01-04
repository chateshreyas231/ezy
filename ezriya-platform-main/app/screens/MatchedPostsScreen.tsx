// app/screens/MatchedPostsScreen.tsx
// This screen is now replaced by MatchesScreen.tsx
// Keeping for backward compatibility but redirecting to MyPostsScreen
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';
import MyPostsScreen from './MyPostsScreen';

export default function MatchedPostsScreen() {
  return <MyPostsScreen />;
}
