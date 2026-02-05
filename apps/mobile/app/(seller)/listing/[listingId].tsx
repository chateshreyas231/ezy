// Listing Detail / Manager (Seller View)
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../lib/hooks/useAuth';
import { getAssetUri } from '../../../lib/utils/assetLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 48; // Account for padding
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75; // 4:3 aspect ratio

interface ListingMedia {
  id: string;
  storage_path: string;
  media_type: 'image' | 'video';
  order_index: number;
}

export default function SellerListingDetailScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [media, setMedia] = useState<ListingMedia[]>([]);
  const [matchedBuyersCount, setMatchedBuyersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadListingDetails();
    }
  }, [listingId]);

  const loadListingDetails = async () => {
    if (!listingId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('seller_id', user.id)
        .single();

      if (listingError) {
        console.error('Error fetching listing:', listingError);
        if (listingError.code === 'PGRST116') {
          Alert.alert('Error', 'Listing not found');
          router.back();
        }
        return;
      }

      setListing(listingData);

      // Fetch listing media
      const { data: mediaData, error: mediaError } = await supabase
        .from('listing_media')
        .select('*')
        .eq('listing_id', listingId)
        .order('order_index', { ascending: true });

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
      } else {
        setMedia(mediaData || []);
      }

      // Fetch matched buyers count
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId);

      if (matchesError) {
        console.error('Error fetching matches count:', matchesError);
      } else {
        setMatchedBuyersCount(matchesData?.length || 0);
      }
    } catch (error: any) {
      console.error('Failed to load listing details:', error);
      Alert.alert('Error', error.message || 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListingDetails();
    setRefreshing(false);
  };

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color={glassTokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listing Manager</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading listing details...</Text>
          </View>
        ) : !listing ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Listing not found</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + 40,
                paddingHorizontal: glassTokens.componentSpacing.screenPadding,
              }
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={glassTokens.colors.accent.primary}
              />
            }
          >
            {/* Media Gallery */}
            {media.length > 0 && (
              <LiquidGlassCard
                cornerRadius={24}
                padding={0}
                elasticity={0.25}
                blurAmount={0.1}
                style={styles.card}
              >
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaScroll}
                >
                  {media.map((item) => (
                    <View key={item.id} style={styles.mediaItem}>
                      <Image
                        source={{ uri: getAssetUri(item.storage_path) }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                      />
                      {item.media_type === 'video' && (
                        <View style={styles.videoBadge}>
                          <Ionicons name="play-circle" size={24} color="#fff" />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
                {media.length > 1 && (
                  <View style={styles.mediaIndicator}>
                    <Text style={styles.mediaIndicatorText}>
                      {media.length} {media.some(m => m.media_type === 'video') ? 'media' : 'photos'}
                    </Text>
                  </View>
                )}
              </LiquidGlassCard>
            )}

            {/* Basic Info */}
            <LiquidGlassCard
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
              blurAmount={0.1}
              style={styles.card}
            >
              <View style={styles.headerRow}>
                <View style={styles.titleSection}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  {listing.listing_number && (
                    <Text style={styles.listingNumber}>ID: {listing.listing_number}</Text>
                  )}
                </View>
                <View style={[
                  styles.statusBadge,
                  listing.status === 'active' && styles.statusBadgeActive,
                  listing.status === 'draft' && styles.statusBadgeDraft,
                  listing.status === 'pending' && styles.statusBadgePending,
                ]}>
                  <Text style={[
                    styles.statusText,
                    listing.status === 'active' && styles.statusTextActive,
                  ]}>
                    {listing.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.price}>${listing.price.toLocaleString()}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="bed" size={20} color={glassTokens.colors.text.secondary} />
                  <Text style={styles.detailLabel}>{listing.beds} bed</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water" size={20} color={glassTokens.colors.text.secondary} />
                  <Text style={styles.detailLabel}>{listing.baths} bath</Text>
                </View>
                {listing.sqft && (
                  <View style={styles.detailItem}>
                    <Ionicons name="square" size={20} color={glassTokens.colors.text.secondary} />
                    <Text style={styles.detailLabel}>{listing.sqft.toLocaleString()} sqft</Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Ionicons name="home" size={20} color={glassTokens.colors.text.secondary} />
                  <Text style={styles.detailLabel}>{listing.property_type}</Text>
                </View>
              </View>

              {listing.address_public && (
                <View style={styles.addressRow}>
                  <Ionicons name="location" size={16} color={glassTokens.colors.text.secondary} />
                  <Text style={styles.addressText}>{listing.address_public}</Text>
                </View>
              )}
            </LiquidGlassCard>

            {/* Description */}
            {listing.description && (
              <LiquidGlassCard
                title="Description"
                cornerRadius={24}
                padding={24}
                elasticity={0.25}
                blurAmount={0.1}
                style={styles.card}
              >
                <Text style={styles.description}>{listing.description}</Text>
              </LiquidGlassCard>
            )}

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <LiquidGlassCard
                title="Features"
                cornerRadius={24}
                padding={24}
                elasticity={0.25}
                blurAmount={0.1}
                style={styles.card}
              >
                <View style={styles.featuresGrid}>
                  {listing.features.map((feature: string, idx: number) => (
                    <View key={idx} style={styles.featureTag}>
                      <Ionicons name="checkmark-circle" size={16} color={glassTokens.colors.accent.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </LiquidGlassCard>
            )}

            {/* Verification & Stats */}
            <LiquidGlassCard
              title="Status & Statistics"
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
              blurAmount={0.1}
              style={styles.card}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons 
                    name={listing.listing_verified ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={listing.listing_verified ? glassTokens.colors.accent.success : glassTokens.colors.accent.error} 
                  />
                  <Text style={styles.statLabel}>Verification</Text>
                  <Text style={styles.statValue}>
                    {listing.listing_verified ? 'Verified' : 'Not Verified'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={24} color={glassTokens.colors.accent.primary} />
                  <Text style={styles.statLabel}>Matched Buyers</Text>
                  <Text style={styles.statValue}>{matchedBuyersCount}</Text>
                </View>
              </View>
              {listing.freshness_verified_at && (
                <View style={styles.freshnessRow}>
                  <Ionicons name="time" size={16} color={glassTokens.colors.text.secondary} />
                  <Text style={styles.freshnessText}>
                    Last verified: {new Date(listing.freshness_verified_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </LiquidGlassCard>

            {/* Actions */}
            <LiquidGlassCard
              title="Actions"
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
              blurAmount={0.1}
              style={styles.card}
            >
              <LiquidGlassButton
                label="Edit Listing"
                onPress={() => {
                  router.push(`/(seller)/create-listing?listingId=${listingId}`);
                }}
                variant="primary"
                size="md"
                fullWidth
                style={styles.actionButton}
              />
              <LiquidGlassButton
                label="View Matches"
                onPress={() => {
                  router.push('/(seller)/(tabs)/matches');
                }}
                variant="secondary"
                size="md"
                fullWidth
                style={styles.actionButton}
              />
              {listing.status === 'active' ? (
                <LiquidGlassButton
                  label="Pause Listing"
                  onPress={async () => {
                    // TODO: Implement pause functionality
                    Alert.alert('Coming Soon', 'Pause functionality will be available soon');
                  }}
                  variant="secondary"
                  size="md"
                  fullWidth
                  style={styles.actionButton}
                />
              ) : listing.status === 'draft' ? (
                <LiquidGlassButton
                  label="Activate Listing"
                  onPress={async () => {
                    // TODO: Implement activate functionality
                    Alert.alert('Coming Soon', 'Activate functionality will be available soon');
                  }}
                  variant="success"
                  size="md"
                  fullWidth
                  style={styles.actionButton}
                />
              ) : null}
            </LiquidGlassCard>
          </ScrollView>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    gap: glassTokens.spacing.md,
  },
  backButton: {
    padding: glassTokens.spacing.xs,
    marginLeft: -glassTokens.spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
  },
  loadingText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
  },
  scrollContent: {
    paddingTop: glassTokens.spacing.md,
    gap: glassTokens.spacing.md,
  },
  card: {
    width: '100%',
    marginBottom: glassTokens.spacing.md,
  },
  mediaScroll: {
    height: IMAGE_HEIGHT,
  },
  mediaItem: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  mediaIndicator: {
    padding: glassTokens.spacing.sm,
    alignItems: 'center',
  },
  mediaIndicatorText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.md,
  },
  titleSection: {
    flex: 1,
    marginRight: glassTokens.spacing.md,
  },
  listingTitle: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.5,
  },
  listingNumber: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusBadgeActive: {
    backgroundColor: `${glassTokens.colors.accent.success}20`,
    borderColor: glassTokens.colors.accent.success,
  },
  statusBadgeDraft: {
    backgroundColor: `${glassTokens.colors.accent.warning}20`,
    borderColor: glassTokens.colors.accent.warning,
  },
  statusBadgePending: {
    backgroundColor: `${glassTokens.colors.accent.primary}20`,
    borderColor: glassTokens.colors.accent.primary,
  },
  statusText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.secondary,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  statusTextActive: {
    color: glassTokens.colors.accent.success,
  },
  price: {
    fontSize: glassTokens.typography.fontSize['4xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.md,
    letterSpacing: -1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: glassTokens.spacing.md,
    marginBottom: glassTokens.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
  },
  detailLabel: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    marginTop: glassTokens.spacing.sm,
  },
  addressText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    flex: 1,
  },
  description: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: glassTokens.spacing.sm,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.sm,
    borderRadius: glassTokens.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: glassTokens.spacing.lg,
    marginBottom: glassTokens.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
  },
  statLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
  },
  statValue: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    textAlign: 'center',
  },
  freshnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    marginTop: glassTokens.spacing.md,
    paddingTop: glassTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  freshnessText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
  },
  actionButton: {
    marginBottom: glassTokens.spacing.md,
  },
});

