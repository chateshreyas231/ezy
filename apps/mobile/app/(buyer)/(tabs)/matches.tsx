// Buyer Matches Screen - View all matches with Liquid Glass
import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useMatches } from '../../../lib/hooks/useMatches';
import { ScreenBackground, LiquidGlassCard, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Match {
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
  deal_room_id?: string;
  match_score?: number;
}

export default function BuyerMatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchMatches } = useMatches();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadMatches();
  }, []);

  // Refresh matches when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
  );

  const loadMatches = async () => {
    setLoading(true);
    try {
      const matchList = await fetchMatches();
      // Transform to expected format
      const transformedMatches = matchList.map((match: any) => ({
        id: match.id,
        listing: match.listing || {
          id: match.listing_id,
          title: 'Unknown Listing',
          price: 0,
          beds: 0,
          baths: 0,
        },
        created_at: match.created_at,
        deal_room_id: match.deal_room_id,
        match_score: match.match_score,
      }));
      setMatches(transformedMatches);
    } catch (error: any) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchPress = (match: Match) => {
    if (match.deal_room_id) {
      router.push(`/deal/${match.deal_room_id}`);
    } else {
      router.push(`/deal/${match.id}`);
    }
  };

  const renderMatch = ({ item }: { item: Match }) => {
    // Handle missing listing data gracefully
    if (!item.listing) {
      return (
        <LiquidGlassCard
          cornerRadius={20}
          padding={20}
          elasticity={0.25}
          blurAmount={0.1}
          style={styles.matchCard}
        >
          <Text style={styles.matchTitle}>Listing removed</Text>
          <Text style={styles.matchDate}>
            Matched {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </LiquidGlassCard>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleMatchPress(item)}
        style={styles.matchCardWrapper}
      >
        <LiquidGlassCard
          cornerRadius={20}
          padding={20}
          elasticity={0.25}
          blurAmount={0.1}
          style={styles.matchCard}
        >
          <View style={styles.matchHeader}>
            <View style={styles.matchInfo}>
              <Text style={styles.matchTitle} numberOfLines={2}>{item.listing.title || 'Untitled Listing'}</Text>
              {item.listing.listing_number && (
                <Text style={styles.listingNumber}>ID: {item.listing.listing_number}</Text>
              )}
              <Text style={styles.matchPrice}>
                ${item.listing.price?.toLocaleString() || 'N/A'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={glassTokens.colors.text.secondary}
            />
          </View>

          <View style={styles.matchDetails}>
            {item.listing.beds && (
              <View style={styles.detailRow}>
                <Ionicons name="bed" size={16} color={glassTokens.colors.text.secondary} />
                <Text style={styles.detailText}>{item.listing.beds} bed</Text>
              </View>
            )}
            {item.listing.baths && (
              <View style={styles.detailRow}>
                <Ionicons name="water" size={16} color={glassTokens.colors.text.secondary} />
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

          <View style={styles.matchFooter}>
            <Text style={styles.matchDate}>
              Matched {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {item.match_score && (
              <View style={styles.matchScoreBadge}>
                <Text style={styles.matchScoreText}>{item.match_score}% match</Text>
              </View>
            )}
            {item.deal_room_id && (
              <View style={styles.dealRoomBadge}>
                <Ionicons name="chatbubbles" size={12} color={glassTokens.colors.accent.primary} />
                <Text style={styles.dealRoomText}>Deal Room</Text>
              </View>
            )}
          </View>
        </LiquidGlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {matches.length === 0 && !loading ? (
          <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
            <LiquidGlassCard 
              title="No matches yet"
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
            >
              <Text style={styles.emptyText}>
                Click "MATCH" on properties you like. When the seller also matches with you, it will appear here.
              </Text>
            </LiquidGlassCard>
          </View>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatch}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingTop: insets.top + glassTokens.componentSpacing.screenPadding,
                paddingBottom: insets.bottom + 100, // Space for tab bar
                paddingHorizontal: glassTokens.componentSpacing.screenPadding,
              }
            ]}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadMatches}
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
  matchCardWrapper: {
    marginBottom: glassTokens.spacing.md,
  },
  matchCard: {
    width: '100%',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.md,
  },
  matchInfo: {
    flex: 1,
    marginRight: glassTokens.spacing.sm,
  },
  matchTitle: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.3,
    lineHeight: glassTokens.typography.fontSize.xl * 1.3,
  },
  listingNumber: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.xs,
  },
  matchPrice: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  matchDetails: {
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
    color: glassTokens.colors.text.secondary,
    fontWeight: glassTokens.typography.fontWeight.medium,
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
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: glassTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    gap: glassTokens.spacing.sm,
  },
  matchDate: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.tertiary,
    flex: 1,
  },
  matchScoreBadge: {
    backgroundColor: `${glassTokens.colors.accent.success}20`,
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.success,
  },
  matchScoreText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.accent.success,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  dealRoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${glassTokens.colors.accent.primary}20`,
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.primary,
    gap: glassTokens.spacing.xs,
  },
  dealRoomText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.accent.primary,
    fontWeight: glassTokens.typography.fontWeight.semibold,
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
