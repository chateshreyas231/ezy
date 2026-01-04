// app/post/index.tsx
// Legacy post screen - redirecting to new post creation screens
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function PostIndex() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
        Create a Post
      </Text>
      <Text style={{ marginBottom: 20, color: '#666' }}>
        Choose the type of post you want to create:
      </Text>
      <Button
        title="Create Buyer Need Post"
        onPress={() => router.push('/screens/CreateBuyerNeedScreen')}
      />
      <Button
        title="Create Listing Post"
        onPress={() => router.push('/screens/CreateListingScreen')}
      />
    </View>
  );
}
