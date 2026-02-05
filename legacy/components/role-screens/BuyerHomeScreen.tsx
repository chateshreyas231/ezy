// components/role-screens/BuyerHomeScreen.tsx
// Buyer-specific home screen with listings, intent, verification, agent connections
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedButton from '../ui/AnimatedButton';
import AnimatedCard from '../ui/AnimatedCard';
import IconButton from '../ui/IconButton';
import { Theme } from '../../constants/Theme';
import { getAllListingPosts } from '../../services/postsService';
import type { ListingPost } from '../../src/types/types';
import { useUser } from '../../app/context/UserContext';

const { width } = Dimensions.get('window');

export default function BuyerHomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<ListingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await getAllListingPosts();
      setListings(data.filter(l => l.verified));
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

  const toggleLike = (propertyId: string) => {
    setLikedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const verificationLevel = user?.verification_level || 0;
  const needsVerification = verificationLevel < 2;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
          <Text style={styles.loadingText}>Loading properties...</Text>
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
            <View style={styles.headerContent}>
              <View style={styles.greetingRow}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={24} color={Theme.colors.accent} />
                </View>
                <View>
                  <Text style={styles.greeting}>Welcome back!</Text>
                  <View style={styles.roleBadge}>
                    <Ionicons name="search-outline" size={14} color={Theme.colors.accent} />
                    <Text style={styles.roleText}>Buyer</Text>
                  </View>
                </View>
              </View>
              <IconButton
                icon="notifications-outline"
                onPress={() => router.push('/buyer/taskboard')}
                size={22}
                backgroundColor={Theme.colors.surfaceElevated}
              />
            </View>
          </View>
        </AnimatedCard>

        {/* Verification Status */}
        {needsVerification && (
          <AnimatedCard delay={100} style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <View style={styles.verificationIconContainer}>
                <Ionicons name="shield-outline" size={28} color={Theme.colors.warning} />
              </View>
              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>Verify Your Eligibility</Text>
                <Text style={styles.verificationText}>
                  Verify your identity and upload pre-approval to unlock all features and connect with agents.
                </Text>
              </View>
            </View>
            <View style={styles.verificationActions}>
              <AnimatedButton
                title="Verify Identity"
                onPress={() => router.push('/onboarding/verify-identity')}
                variant="primary"
                icon="id-card-outline"
                size="medium"
                style={styles.verificationButton}
              />
              <AnimatedButton
                title="Upload Pre-Approval"
                onPress={() => router.push('/onboarding/upload-preapproval')}
                variant="outline"
                icon="document-text-outline"
                size="medium"
                style={styles.verificationButton}
              />
            </View>
            <View style={styles.verificationProgress}>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${(verificationLevel / 2) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {verificationLevel === 0
                  ? 'Not Started'
                  : verificationLevel === 1
                  ? 'In Progress'
                  : 'Complete'}
              </Text>
            </View>
          </AnimatedCard>
        )}

        {/* Quick Actions */}
        <AnimatedCard delay={200} style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <AnimatedButton
              title="Submit Intent"
              onPress={() => router.push('/buyer/submit-intent')}
              variant="primary"
              icon="search-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="My Matches"
              onPress={() => router.push('/buyer/matches')}
              variant="secondary"
              icon="flash-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="My Tasks"
              onPress={() => router.push('/buyer/taskboard')}
              variant="outline"
              icon="checkmark-done-outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </AnimatedCard>

        {/* Listings */}
        <View style={styles.listingsSection}>
          <View style={styles.listingsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Verified Properties</Text>
              <Text style={styles.listingsSubtitle}>
                {listings.length} premium listings available
              </Text>
            </View>
          </View>

          {listings.length === 0 ? (
            <AnimatedCard delay={300} style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="home-outline" size={72} color={Theme.colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No Properties Available</Text>
              <Text style={styles.emptySubtitle}>
                New verified listings will appear here
              </Text>
            </AnimatedCard>
          ) : (
            <FlatList
              data={listings}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsList}
              renderItem={({ item, index }) => (
                <PropertyCard
                  item={item}
                  index={index}
                  isLiked={likedProperties.has(item.id)}
                  onLike={() => toggleLike(item.id)}
                  onPress={() => router.push(`/offers/${item.id}`)}
                  onMessage={() => router.push(`/chat/conversation?listingId=${item.id}`)}
                />
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PropertyCard({
  item,
  index,
  isLiked,
  onLike,
  onPress,
  onMessage,
}: {
  item: ListingPost;
  index: number;
  isLiked: boolean;
  onLike: () => void;
  onPress: () => void;
  onMessage: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const location = [item.city, item.state].filter(Boolean).join(', ') || item.state || 'Location TBD';

  const handleLike = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onLike();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatedCard delay={index * 50} style={[styles.propertyCard, { width: width * 0.88 }]}>
      <View style={styles.propertyImage}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="home" size={56} color={Theme.colors.textTertiary} />
        </View>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
        <View style={[styles.likeButton, { transform: [{ scale: pressed ? 0.9 : 1 }] }]}>
          <IconButton
            icon={isLiked ? 'heart' : 'heart-outline'}
            onPress={handleLike}
            size={22}
            color={isLiked ? Theme.colors.error : Theme.colors.textPrimary}
            backgroundColor={Theme.colors.surfaceElevated + 'CC'}
          />
        </View>
      </View>

      <View style={styles.propertyDetails}>
        <Text style={styles.propertyPrice}>{formatPrice(item.list_price)}</Text>
        <View style={styles.propertyLocation}>
          <Ionicons name="location" size={16} color={Theme.colors.accent} />
          <Text style={styles.propertyLocationText} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <View style={styles.propertySpecs}>
          {item.beds && (
            <View style={styles.spec}>
              <Ionicons name="bed-outline" size={16} color={Theme.colors.textSecondary} />
              <Text style={styles.specText}>{item.beds} Beds</Text>
            </View>
          )}
          {item.baths && (
            <View style={styles.spec}>
              <Ionicons name="water-outline" size={16} color={Theme.colors.textSecondary} />
              <Text style={styles.specText}>{item.baths} Baths</Text>
            </View>
          )}
        </View>

        <View style={styles.propertyActions}>
          <AnimatedButton
            title="View Details"
            onPress={onPress}
            variant="primary"
            icon="eye-outline"
            size="small"
            style={styles.propertyActionButton}
          />
          <AnimatedButton
            title="Connect"
            onPress={onMessage}
            variant="outline"
            icon="chatbubble-ellipses-outline"
            size="small"
            style={styles.propertyActionButton}
          />
        </View>
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
    padding: Theme.spacing.xxl,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  headerCard: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  header: {
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.accent + '40',
  },
  greeting: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    backgroundColor: Theme.colors.accent + '15',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  roleText: {
    ...Theme.typography.caption,
    color: Theme.colors.accent,
    fontWeight: '600',
    fontSize: 11,
  },
  verificationCard: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.warning + '30',
  },
  verificationHeader: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  verificationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  verificationText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
  verificationActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  verificationButton: {
    flex: 1,
  },
  verificationProgress: {
    gap: Theme.spacing.xs,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.full,
  },
  progressText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontWeight: '500',
  },
  actionsCard: {
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    fontWeight: '700',
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
    marginTop: Theme.spacing.md,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  listingsSubtitle: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  listingsList: {
    paddingRight: Theme.spacing.lg,
  },
  propertyCard: {
    marginRight: Theme.spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 240,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated + 'CC',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    gap: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.success + '40',
  },
  verifiedText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    fontWeight: '700',
    fontSize: 11,
  },
  likeButton: {
    position: 'absolute',
    top: Theme.spacing.md,
    left: Theme.spacing.md,
  },
  propertyDetails: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  propertyPrice: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    fontWeight: '700',
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  propertyLocationText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  propertySpecs: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    flexWrap: 'wrap',
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
  propertyActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  propertyActionButton: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Theme.spacing.xxl,
    marginTop: Theme.spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    fontWeight: '700',
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});
