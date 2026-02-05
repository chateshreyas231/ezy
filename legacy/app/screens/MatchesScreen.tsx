// app/screens/MatchesScreen.tsx
// Display matches per buyer need post
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getMatchesForBuyerNeed, getMatchCountForBuyerNeed, generateMatchesForBuyerNeed } from '../../services/matchesService';
import { getBuyerNeedPostById } from '../../services/postsService';
import type { Match, BuyerNeedPost } from '../../src/types/types';

export default function MatchesScreen() {
  const router = useRouter();
  const { buyerNeedId } = useLocalSearchParams<{ buyerNeedId?: string }>();
  const [loading, setLoading] = useState(true);
  const [buyerNeed, setBuyerNeed] = useState<BuyerNeedPost | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    if (!buyerNeedId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [buyerNeedData, matchesData, count] = await Promise.all([
        getBuyerNeedPostById(buyerNeedId),
        getMatchesForBuyerNeed(buyerNeedId),
        getMatchCountForBuyerNeed(buyerNeedId),
      ]);

      setBuyerNeed(buyerNeedData);
      setMatches(matchesData);
      setMatchCount(count);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = async () => {
    if (!buyerNeedId) return;

    try {
      setGenerating(true);
      await generateMatchesForBuyerNeed(buyerNeedId);
      await loadData();
      Alert.alert('Success', 'Matches generated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate matches');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [buyerNeedId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!buyerNeed) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Buyer need post not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Buyer Need Post</Text>
        <Text style={{ marginTop: 4, color: '#666' }}>
          State: {buyerNeed.state} | Price: ${buyerNeed.price_min?.toLocaleString()} - ${buyerNeed.price_max?.toLocaleString()}
        </Text>
        <Text style={{ marginTop: 8, fontWeight: '600' }}>
          Matches: {matchCount}
        </Text>
        <Button
          title={generating ? 'Generating...' : 'Generate Matches'}
          onPress={handleGenerateMatches}
          disabled={generating}
        />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}
            onPress={() => router.push(`/screens/MatchDetailScreen?matchId=${item.id}`)}
          >
            <Text style={{ fontWeight: '600' }}>Match Score: {item.score}</Text>
            <Text style={{ marginTop: 4, color: '#666' }}>
              Listing ID: {item.listing_post_id}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No matches yet</Text>
            <Text style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              Click "Generate Matches" to find matching listings
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadData}
      />
    </View>
  );
}

