// app/buyer/matches.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { getMatchesForBuyerNeed } from '../../services/matchesService';
import { supabase } from '../../services/supabaseClient';
import type { ListingPost, Match } from '../../src/types/types';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Array<Match & { listing: ListingPost }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const { data: buyerNeeds } = await supabase
        .from('buyer_need_posts')
        .select('id')
        .eq('agent_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!buyerNeeds || buyerNeeds.length === 0) {
        setMatches([]);
        return;
      }

      const buyerNeedId = buyerNeeds[0].id;
      const matchList = await getMatchesForBuyerNeed(buyerNeedId);

      const matchesWithListings = await Promise.all(
        matchList.map(async (match) => {
          const { data: listing } = await supabase
            .from('listing_posts')
            .select('*')
            .eq('id', match.listing_post_id)
            .single();

          return { ...match, listing: listing as ListingPost };
        })
      );

      setMatches(matchesWithListings);
    } catch (error: any) {
      console.error('Failed to load matches:', error);
      Alert.alert('Error', error.message || 'Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return Theme.colors.success;
    if (score >= 60) return Theme.colors.warning;
    return Theme.colors.error;
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="flash" size={32} color={Theme.colors.accent} />
          <Text style={styles.title}>Your Matches</Text>
          <Text style={styles.subtitle}>AI-powered property recommendations</Text>
        </View>

        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadMatches();
              }}
              tintColor={Theme.colors.accent}
            />
          }
          renderItem={({ item, index }) => (
            <AnimatedCard delay={index * 100} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <View style={styles.scoreContainer}>
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.score) + '20' }]}>
                    <Ionicons name="star" size={16} color={getScoreColor(item.score)} />
                    <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
                      {item.score.toFixed(0)}%
                    </Text>
                  </View>
                </View>
                {item.listing.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Theme.colors.success} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>

              <Text style={styles.price}>{formatPrice(item.listing.list_price)}</Text>
              
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={Theme.colors.accent} />
                <Text style={styles.location}>
                  {[item.listing.city, item.listing.state].filter(Boolean).join(', ') || item.listing.state}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="bed-outline" size={16} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>{item.listing.beds || 'N/A'} Beds</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={16} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>{item.listing.baths || 'N/A'} Baths</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="home-outline" size={16} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>{item.listing.property_type || 'N/A'}</Text>
                </View>
              </View>

              {item.explanation && (
                <View style={styles.explanationContainer}>
                  <Ionicons name="bulb-outline" size={16} color={Theme.colors.warning} />
                  <Text style={styles.explanation}>{item.explanation}</Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                <AnimatedButton
                  title="View Details"
                  onPress={() => router.push(`/offers/${item.listing.id}`)}
                  variant="primary"
                  icon="eye-outline"
                  size="medium"
                  style={styles.actionButton}
                />
                <AnimatedButton
                  title="Message"
                  onPress={() => router.push(`/chat/conversation?listingId=${item.listing.id}`)}
                  variant="outline"
                  icon="chatbubble-outline"
                  size="medium"
                  style={styles.actionButton}
                />
              </View>
            </AnimatedCard>
          )}
          ListEmptyComponent={
            <AnimatedCard delay={100} style={styles.emptyCard}>
              <Ionicons name="search-outline" size={64} color={Theme.colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Matches Yet</Text>
              <Text style={styles.emptySubtitle}>
                Submit your property intent to find matching listings
              </Text>
              <AnimatedButton
                title="Submit Intent"
                onPress={() => router.push('/buyer/submit-intent')}
                variant="primary"
                icon="add-circle-outline"
                size="large"
                style={styles.emptyButton}
              />
            </AnimatedCard>
          }
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    gap: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  matchCard: {
    marginBottom: Theme.spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    gap: Theme.spacing.xs,
  },
  scoreText: {
    ...Theme.typography.bodySmall,
    fontWeight: '700',
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
  price: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.xs,
  },
  location: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  detailText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  explanation: {
    flex: 1,
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  actionButton: {
    flex: 1,
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
  emptyButton: {
    width: '100%',
  },
});
