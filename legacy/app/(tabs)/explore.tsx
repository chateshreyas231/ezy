// app/(tabs)/explore.tsx
import React from 'react';
import SafeScreen from '../../components/ui/SafeScreen';
import MyPostsScreen from '../screens/MyPostsScreen';

export default function ExploreScreen() {
  return (
    <SafeScreen>
      <MyPostsScreen />
    </SafeScreen>
  );
}
