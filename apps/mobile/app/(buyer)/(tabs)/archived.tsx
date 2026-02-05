// Buyer Archived Screen - View archived listings with Liquid Glass
import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSwipes } from '../../../lib/hooks/useSwipes';
import { ScreenBackground, LiquidGlassCard, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ArchivedListing {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    beds: number;
    baths: number;
    address_public?: string;
  };
  created_at: string;
}

export default function BuyerArchivedScreen() {
  const [archived, setArchived] = useState<ArchivedListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchArchived } = useSwipes();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadArchived();
  }, []);

  // Refresh archived when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadArchived();
    }, [])
  );

  const loadArchived = async () => {
    setLoading(true);
    try {
      const archivedList = await fetchArchived();
      
      // Transform to expected format
      // Only include items that have valid listings (filter out null listings)
      const transformedArchived = archivedList
        .filter((swipe: any) => swipe.listing !== null && swipe.listing !== undefined)
        .map((swipe: any) => ({
          id: swipe.id,
          listing: swipe.listing,
          created_at: swipe.created_at,
        }));
      
      setArchived(transformedArchived);
    } catch (error: any) {
      console.error('Failed to load archived:', error);
      setArchived([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const renderArchived = ({ item }: { item: ArchivedListing }) => {
    // Handle missing listing data gracefully
    if (!item.listing) {
      return (
        <LiquidGlassCard
          cornerRadius={20}
          padding={20}
          elasticity={0.25}
          blurAmount={0.1}
          style={[styles.archivedCard, { opacity: 0.7 }]}
        >
          <Text style={styles.archivedTitle}>Listing removed</Text>
          <Text style={styles.archivedDate}>
            Archived {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </LiquidGlassCard>
      );
    }

    return (
      <LiquidGlassCard
        cornerRadius={20}
        padding={20}
        elasticity={0.25}
        blurAmount={0.1}
        style={[styles.archivedCard, { opacity: 0.7 }]}
      >
        <View style={styles.archivedHeader}>
          <View style={styles.archivedInfo}>
            <Text style={styles.archivedTitle} numberOfLines={2}>{item.listing.title || 'Untitled Listing'}</Text>
            {item.listing.listing_number && (
              <Text style={styles.listingNumber}>ID: {item.listing.listing_number}</Text>
            )}
            <Text style={styles.archivedPrice}>
              ${item.listing.price?.toLocaleString() || 'N/A'}
            </Text>
          </View>
          <Ionicons
            name="archive"
            size={20}
            color={glassTokens.colors.text.tertiary}
          />
        </View>

        <View style={styles.archivedDetails}>
          {item.listing.beds && (
            <View style={styles.detailRow}>
              <Ionicons name="bed" size={16} color={glassTokens.colors.text.tertiary} />
              <Text style={styles.detailText}>{item.listing.beds} bed</Text>
            </View>
          )}
          {item.listing.baths && (
            <View style={styles.detailRow}>
              <Ionicons name="water" size={16} color={glassTokens.colors.text.tertiary} />
              <Text style={styles.detailText}>{item.listing.baths} bath</Text>
            </View>
          )}
        </View>

        {item.listing.address_public && (
          <View style={styles.addressRow}>
            <Ionicons
              name="location"
              size={14}
              color={glassTokens.colors.text.tertiary}
            />
            <Text style={styles.addressText} numberOfLines={1}>{item.listing.address_public}</Text>
          </View>
        )}

        <View style={styles.archivedFooter}>
          <Text style={styles.archivedDate}>
            Archived {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </LiquidGlassCard>
    );
  };

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {archived.length === 0 && !loading ? (
          <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
            <LiquidGlassCard 
              title="No archived listings"
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
            >
              <Text style={styles.emptyText}>
                Listings you click "ARCHIVE" will appear here.
              </Text>
            </LiquidGlassCard>
          </View>
        ) : (
          <FlatList
            data={archived}
            renderItem={renderArchived}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingTop: insets.top + glassTokens.componentSpacing.screenPadding,
                paddingBottom: insets.bottom + 100,
                paddingHorizontal: glassTokens.componentSpacing.screenPadding,
              }
            ]}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadArchived}
                tintColor={glassTokens.colors.accent.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    gap: glassTokens.spacing.md,
  },
  archivedCard: {
    marginBottom: glassTokens.spacing.md,
  },
  archivedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.md,
  },
  archivedInfo: {
    flex: 1,
    marginRight: glassTokens.spacing.sm,
  },
  archivedTitle: {
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.3,
  },
  listingNumber: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.tertiary,
    marginBottom: glassTokens.spacing.xs,
  },
  archivedPrice: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.tertiary,
  },
  archivedDetails: {
    flexDirection: 'row',
    gap: glassTokens.spacing.md,
    marginBottom: glassTokens.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
  },
  detailText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    marginBottom: glassTokens.spacing.md,
  },
  addressText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.tertiary,
    flex: 1,
  },
  archivedFooter: {
    paddingTop: glassTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  archivedDate: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
  },
  emptyText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
});
