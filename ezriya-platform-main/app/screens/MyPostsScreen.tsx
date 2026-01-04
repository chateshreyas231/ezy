// app/screens/MyPostsScreen.tsx
// List user's buyer need and listing posts
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getMyBuyerNeedPosts, getMyListingPosts } from '../../services/postsService';
import type { BuyerNeedPost, ListingPost } from '../../src/types/types';

type PostItem = (BuyerNeedPost & { type: 'buyer_need' }) | (ListingPost & { type: 'listing' });

export default function MyPostsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'buyer_need' | 'listing'>('all');

  const loadPosts = async () => {
    try {
      setLoading(true);
      const [buyerNeeds, listings] = await Promise.all([
        getMyBuyerNeedPosts(),
        getMyListingPosts(),
      ]);

      const buyerNeedItems: PostItem[] = buyerNeeds.map((p) => ({ ...p, type: 'buyer_need' }));
      const listingItems: PostItem[] = listings.map((p) => ({ ...p, type: 'listing' }));

      const allPosts = [...buyerNeedItems, ...listingItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(allPosts);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'all') return true;
    return p.type === activeTab;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
        <Button
          title="All"
          onPress={() => setActiveTab('all')}
          color={activeTab === 'all' ? '#007AFF' : '#ccc'}
        />
        <Button
          title="Buyer Needs"
          onPress={() => setActiveTab('buyer_need')}
          color={activeTab === 'buyer_need' ? '#007AFF' : '#ccc'}
        />
        <Button
          title="Listings"
          onPress={() => setActiveTab('listing')}
          color={activeTab === 'listing' ? '#007AFF' : '#ccc'}
        />
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}
            onPress={() => {
              if (item.type === 'buyer_need') {
                router.push(`/matches?buyerNeedId=${item.id}`);
              } else {
                router.push(`/matches?listingId=${item.id}`);
              }
            }}
          >
            <Text style={{ fontWeight: '600', fontSize: 16 }}>
              {item.type === 'buyer_need' ? 'Buyer Need' : 'Listing'}
            </Text>
            <Text style={{ marginTop: 4, color: '#666' }}>
              {item.type === 'buyer_need'
                ? `State: ${item.state} | Price: $${item.price_min?.toLocaleString()} - $${item.price_max?.toLocaleString()}`
                : `State: ${item.state} | Price: $${item.list_price.toLocaleString()}`}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No posts yet</Text>
            <Button
              title="Create Buyer Need"
              onPress={() => router.push('/screens/CreateBuyerNeedScreen')}
            />
            <Button
              title="Create Listing"
              onPress={() => router.push('/screens/CreateListingScreen')}
            />
          </View>
        }
        refreshing={loading}
        onRefresh={loadPosts}
      />
    </View>
  );
}

