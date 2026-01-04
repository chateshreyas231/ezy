// app/offers/[id].tsx
// Legacy offer detail screen - redirecting to match detail screen
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function OfferDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
        Offer Detail
      </Text>
      <Text style={{ marginBottom: 20, color: '#666' }}>
        This legacy screen has been replaced. Please use the match detail screen to view offer details.
      </Text>
      <Button
        title="Go to My Posts"
        onPress={() => router.push('/screens/MyPostsScreen')}
      />
    </View>
  );
}
