// components/role-screens/SellerHomeScreen.tsx
// Seller-specific home screen - using working components
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedButton from '../ui/AnimatedButton';
import AnimatedCard from '../ui/AnimatedCard';
import { Theme } from '../../constants/Theme';
import { getMyListingPosts } from '../../services/postsService';
import { createMockListings } from '../../services/mockListingsService';
import type { ListingPost } from '../../src/types/types';
import { useUser } from '../../app/context/UserContext';

export default function SellerHomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<ListingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await getMyListingPosts();
      setListings(data);
    } catch (error: any) {
      console.warn('Failed to load listings:', error.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const activeListings = listings.filter(l => l.listing_status === 'active' || l.listing_status === 'live');
  const pendingListings = listings.filter(l => l.listing_status === 'draft');
  const underContract = listings.filter(l => l.listing_status === 'under_contract');

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Theme.spacing.md },
        ]}
      >
        {/* Header */}
        <AnimatedCard delay={0} style={styles.headerCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Your Listings</Text>
              <Text style={styles.roleBadge}>
                <Ionicons name="home-outline" size={16} color={Theme.colors.accent} /> Seller
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <AnimatedButton
                title="Create"
                onPress={() => router.push('/screens/CreateListingScreen')}
                variant="primary"
                icon="add-circle-outline"
                size="small"
                style={styles.headerButton}
              />
              <AnimatedButton
                title="Mock"
                onPress={async () => {
                  try {
                    await createMockListings(3);
                    await loadListings();
                  } catch (error: any) {
                    console.error('Failed to create mock listings:', error);
                  }
                }}
                variant="outline"
                icon="sparkles"
                size="small"
                style={styles.headerButton}
              />
            </View>
          </View>
        </AnimatedCard>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <AnimatedCard delay={100} style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={Theme.colors.success} />
            <Text style={styles.statNumber}>{activeListings.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </AnimatedCard>
          <AnimatedCard delay={150} style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={Theme.colors.warning} />
            <Text style={styles.statNumber}>{pendingListings.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </AnimatedCard>
          <AnimatedCard delay={200} style={styles.statCard}>
            <Ionicons name="document-text" size={24} color={Theme.colors.accent} />
            <Text style={styles.statNumber}>{underContract.length}</Text>
            <Text style={styles.statLabel}>Under Contract</Text>
          </AnimatedCard>
        </View>

        {/* Quick Actions */}
        <AnimatedCard delay={250} style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <AnimatedButton
              title="Create Listing"
              onPress={() => router.push('/screens/CreateListingScreen')}
              variant="primary"
              icon="add-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="View Leads"
              onPress={() => router.push('/seller/leads')}
              variant="secondary"
              icon="people-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="My Tasks"
              onPress={() => router.push('/seller/tasks')}
              variant="outline"
              icon="checkmark-done-outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </AnimatedCard>

        {/* Listings */}
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>My Listings</Text>

          {listings.length === 0 ? (
            <AnimatedCard delay={300} style={styles.emptyCard}>
              <Ionicons name="home-outline" size={64} color={Theme.colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Listings Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first listing to start selling
              </Text>
              <AnimatedButton
                title="Create Listing"
                onPress={() => router.push('/screens/CreateListingScreen')}
                variant="primary"
                icon="add-circle-outline"
                size="large"
                style={styles.emptyButton}
              />
            </AnimatedCard>
          ) : (
            <FlatList
              data={listings}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <ListingCard
                  item={item}
                  index={index}
                  onPress={() => router.push(`/seller/listing/${item.id}`)}
                />
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ListingCard({
  item,
  index,
  onPress,
}: {
  item: ListingPost;
  index: number;
  onPress: () => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const location = [item.city, item.state].filter(Boolean).join(', ') || item.state || 'Location TBD';

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
      case 'live':
        return Theme.colors.success;
      case 'under_contract':
        return Theme.colors.warning;
      case 'draft':
        return Theme.colors.textTertiary;
      default:
        return Theme.colors.textTertiary;
    }
  };

  return (
    <AnimatedCard delay={index * 50} style={styles.listingCard} onPress={onPress}>
      <View style={styles.listingHeader}>
        <View style={styles.listingInfo}>
          <Text style={styles.listingPrice}>{formatPrice(item.list_price)}</Text>
          <View style={styles.listingLocation}>
            <Ionicons name="location" size={14} color={Theme.colors.accent} />
            <Text style={styles.listingLocationText}>{location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.listing_status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.listing_status) }]}>
            {item.listing_status || 'draft'}
          </Text>
        </View>
      </View>

      <View style={styles.listingSpecs}>
        {item.beds && (
          <View style={styles.spec}>
            <Ionicons name="bed-outline" size={14} color={Theme.colors.textSecondary} />
            <Text style={styles.specText}>{item.beds} Beds</Text>
          </View>
        )}
        {item.baths && (
          <View style={styles.spec}>
            <Ionicons name="water-outline" size={14} color={Theme.colors.textSecondary} />
            <Text style={styles.specText}>{item.baths} Baths</Text>
          </View>
        )}
        {item.verified && (
          <View style={styles.spec}>
            <Ionicons name="checkmark-circle" size={14} color={Theme.colors.success} />
            <Text style={[styles.specText, { color: Theme.colors.success }]}>Verified</Text>
          </View>
        )}
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  headerCard: {
    marginBottom: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  headerButton: {
    minWidth: 80,
  },
  greeting: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  roleBadge: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  statNumber: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  actionsCard: {
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
  },
  listingsSection: {
    marginTop: Theme.spacing.lg,
  },
  listingCard: {
    marginBottom: Theme.spacing.md,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  listingInfo: {
    flex: 1,
  },
  listingPrice: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  listingLocationText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  statusText: {
    ...Theme.typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  listingSpecs: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  specText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
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
  emptyButton: {
    width: '100%',
  },
});
