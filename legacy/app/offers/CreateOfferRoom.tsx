// app/offers/CreateOfferRoom.tsx
// Legacy offer room creation - now handled through MatchDetailScreen
// This component is kept for backward compatibility
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function CreateOfferRoom() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
        Create Offer Room
      </Text>
      <Text style={{ marginBottom: 20, color: '#666' }}>
        Offer rooms are now created automatically when you unlock a match.
        To create an offer room, first unlock a match from the match details screen.
      </Text>
      <Button
        title="Go to My Posts"
        onPress={() => router.push('/screens/MyPostsScreen')}
      />
    </View>
  );
}
