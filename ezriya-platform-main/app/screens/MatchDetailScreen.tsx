// app/screens/MatchDetailScreen.tsx
// Show match details (locked/unlocked)
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, Text, View } from 'react-native';
import { getMatchWithPosts } from '../../services/matchesService';
import { isMatchUnlocked, unlockMatch, getUnlockFee } from '../../services/paymentsService';
import { createOfferRoom } from '../../services/offerRoomsService';
import type { Match, BuyerNeedPost, ListingPost } from '../../src/types/types';

export default function MatchDetailScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);
  const [buyerNeed, setBuyerNeed] = useState<BuyerNeedPost | null>(null);
  const [listing, setListing] = useState<ListingPost | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);

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

        // Check if unlocked
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
      Alert.alert('Success', `Match unlocked for $${getUnlockFee()}`);
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to unlock match');
    } finally {
      setUnlocking(false);
    }
  };

  const handleOpenOfferRoom = async () => {
    if (!matchId) return;

    try {
      setCreatingRoom(true);
      const offerRoom = await createOfferRoom(matchId);
      router.push(`/offer-room/${matchId}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open offer room');
    } finally {
      setCreatingRoom(false);
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

  if (!match || !buyerNeed || !listing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Match not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
        Match Details
      </Text>

      <View style={{ marginBottom: 20, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Match Score: {match.score}
        </Text>
        <Text style={{ color: '#666' }}>
          Created: {new Date(match.created_at).toLocaleString()}
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Buyer Need
        </Text>
        <Text>State: {buyerNeed.state}</Text>
        {buyerNeed.city && <Text>City: {buyerNeed.city}</Text>}
        {buyerNeed.zip && <Text>ZIP: {buyerNeed.zip}</Text>}
        {buyerNeed.price_min && buyerNeed.price_max && (
          <Text>Price Range: ${buyerNeed.price_min.toLocaleString()} - ${buyerNeed.price_max.toLocaleString()}</Text>
        )}
        {buyerNeed.property_type && <Text>Property Type: {buyerNeed.property_type}</Text>}
        {buyerNeed.beds && <Text>Beds: {buyerNeed.beds}</Text>}
        {buyerNeed.baths && <Text>Baths: {buyerNeed.baths}</Text>}
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Listing {unlocked ? '' : '(Locked)'}
        </Text>
        {unlocked ? (
          <>
            <Text>State: {listing.state}</Text>
            {listing.address && <Text>Address: {listing.address}</Text>}
            {listing.city && <Text>City: {listing.city}</Text>}
            {listing.zip && <Text>ZIP: {listing.zip}</Text>}
            <Text>List Price: ${listing.list_price.toLocaleString()}</Text>
            {listing.property_type && <Text>Property Type: {listing.property_type}</Text>}
            {listing.beds && <Text>Beds: {listing.beds}</Text>}
            {listing.baths && <Text>Baths: {listing.baths}</Text>}
          </>
        ) : (
          <Text style={{ color: '#666' }}>
            Unlock this match to see full listing details
          </Text>
        )}
      </View>

      {!unlocked && (
        <View style={{ marginBottom: 20 }}>
          <Button
            title={unlocking ? 'Unlocking...' : `Unlock Match ($${getUnlockFee()})`}
            onPress={handleUnlock}
            disabled={unlocking}
          />
        </View>
      )}

      {unlocked && (
        <View style={{ marginBottom: 20 }}>
          <Button
            title={creatingRoom ? 'Opening...' : 'Open Offer Room'}
            onPress={handleOpenOfferRoom}
            disabled={creatingRoom}
          />
        </View>
      )}
    </ScrollView>
  );
}

