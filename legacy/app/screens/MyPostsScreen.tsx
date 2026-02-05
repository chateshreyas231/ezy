// app/screens/MyPostsScreen.tsx
// List user's buyer need and listing posts
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import { Theme } from '../../constants/Theme';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accent} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Posts</Text>
        <View style={styles.tabs}>
          <AnimatedButton
            title="All"
            onPress={() => setActiveTab('all')}
            variant={activeTab === 'all' ? 'primary' : 'ghost'}
            size="small"
            style={styles.tabButton}
          />
          <AnimatedButton
            title="Buyer Needs"
            onPress={() => setActiveTab('buyer_need')}
            variant={activeTab === 'buyer_need' ? 'primary' : 'ghost'}
            size="small"
            style={styles.tabButton}
          />
          <AnimatedButton
            title="Listings"
            onPress={() => setActiveTab('listing')}
            variant={activeTab === 'listing' ? 'primary' : 'ghost'}
            size="small"
            style={styles.tabButton}
          />
        </View>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <AnimatedCard delay={index * 50} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postType}>
                <Ionicons
                  name={item.type === 'buyer_need' ? 'search-outline' : 'home-outline'}
                  size={20}
                  color={Theme.colors.accent}
                />
                <Text style={styles.postTypeText}>
                  {item.type === 'buyer_need' ? 'Buyer Need' : 'Listing'}
                </Text>
              </View>
              {item.type === 'listing' && (item as ListingPost).verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Theme.colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.postDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={Theme.colors.textSecondary} />
                <Text style={styles.detailText}>State: {item.state}</Text>
              </View>
              {item.type === 'buyer_need' ? (
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={16} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>
                    Price: {item.price_min ? formatPrice(item.price_min) : 'N/A'} -{' '}
                    {item.price_max ? formatPrice(item.price_max) : 'N/A'}
                  </Text>
                </View>
              ) : (
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={16} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>Price: {formatPrice((item as ListingPost).list_price)}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={Theme.colors.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <AnimatedButton
              title="View Details"
              onPress={() => {
                if (item.type === 'buyer_need') {
                  router.push(`/matches?buyerNeedId=${item.id}`);
                } else {
                  router.push(`/matches?listingId=${item.id}`);
                }
              }}
              variant="outline"
              icon="arrow-forward-outline"
              size="small"
              style={styles.viewButton}
            />
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <AnimatedCard delay={100} style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={64} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>Create your first post to get started</Text>
            <View style={styles.emptyActions}>
              <AnimatedButton
                title="Create Buyer Need"
                onPress={() => router.push('/screens/CreateBuyerNeedScreen')}
                variant="primary"
                icon="search-outline"
                size="medium"
                style={styles.emptyButton}
              />
              <AnimatedButton
                title="Create Listing"
                onPress={() => router.push('/screens/CreateListingScreen')}
                variant="outline"
                icon="home-outline"
                size="medium"
                style={styles.emptyButton}
              />
            </View>
          </AnimatedCard>
        }
        refreshing={loading}
        onRefresh={loadPosts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  header: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
  },
  listContent: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  postCard: {
    marginBottom: Theme.spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  postType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  postTypeText: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    gap: Theme.spacing.xs,
  },
  verifiedText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    fontWeight: '600',
  },
  postDetails: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  detailText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  viewButton: {
    marginTop: Theme.spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    marginTop: Theme.spacing.xxl,
  },
  emptyTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  emptyActions: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  emptyButton: {
    width: '100%',
  },
});
