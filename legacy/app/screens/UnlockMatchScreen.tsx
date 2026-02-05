// app/screens/UnlockMatchScreen.tsx
// Payment flow UI for match unlock
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, Text, View } from 'react-native';
import { getMatchWithPosts } from '../../services/matchesService';
import { isMatchUnlocked, unlockMatch, getUnlockFee } from '../../services/paymentsService';
import type { Match, BuyerNeedPost, ListingPost } from '../../src/types/types';

export default function UnlockMatchScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);
  const [buyerNeed, setBuyerNeed] = useState<BuyerNeedPost | null>(null);
  const [listing, setListing] = useState<ListingPost | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const loadData = async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getMatchWithPosts(matchId);
      if (data) {
        setMatch(data.match);
        setBuyerNeed(data.buyerNeed);
        setListing(data.listing);

        const isUnlocked = await isMatchUnlocked(
          data.match.buyer_need_post_id,
          data.match.listing_post_id
        );
        setUnlocked(isUnlocked);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!match) return;

    try {
      setUnlocking(true);
      await unlockMatch(match.buyer_need_post_id, match.listing_post_id);
      setUnlocked(true);
      Alert.alert('Success', `Match unlocked for $${getUnlockFee()}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to unlock match');
    } finally {
      setUnlocking(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [matchId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!match || !buyerNeed) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Match not found</Text>
      </View>
    );
  }

  if (unlocked) {
    return (
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
          Match Already Unlocked
        </Text>
        <Text style={{ marginBottom: 20 }}>
          This match has already been unlocked. You can view full details and open an offer room.
        </Text>
        <Button
          title="View Match Details"
          onPress={() => router.push(`/screens/MatchDetailScreen?matchId=${matchId}`)}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
        Unlock Match
      </Text>

      <View style={{ marginBottom: 20, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Match Score: {match.score}
        </Text>
        <Text style={{ color: '#666' }}>
          Unlock this match to view full listing details and contact information.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Buyer Need
        </Text>
        <Text>State: {buyerNeed.state}</Text>
        {buyerNeed.city && <Text>City: {buyerNeed.city}</Text>}
        {buyerNeed.price_min && buyerNeed.price_max && (
          <Text>Price Range: ${buyerNeed.price_min.toLocaleString()} - ${buyerNeed.price_max.toLocaleString()}</Text>
        )}
      </View>

      <View style={{ marginBottom: 20, padding: 16, backgroundColor: '#fff3cd', borderRadius: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
          Unlock Fee: ${getUnlockFee()}
        </Text>
        <Text style={{ color: '#666' }}>
          This is a one-time flat fee to unlock this match. You'll have access to full listing details and can open an offer room.
        </Text>
      </View>

      <Button
        title={unlocking ? 'Processing...' : `Unlock Match ($${getUnlockFee()})`}
        onPress={handleUnlock}
        disabled={unlocking}
      />

      <Text style={{ marginTop: 20, fontSize: 12, color: '#666', textAlign: 'center' }}>
        Note: This is a stub payment for MVP. In production, this would integrate with Stripe or another payment provider.
      </Text>
    </ScrollView>
  );
}

