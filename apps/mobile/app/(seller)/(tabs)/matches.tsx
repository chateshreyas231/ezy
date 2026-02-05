// Seller Matches Screen
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
  buyer_intent: {
    budget_min: number;
    budget_max: number;
    readiness_score: number;
  };
  buyer: {
    display_name: string;
  };
  created_at: string;
  deal_room_id?: string;
}

export default function SellerMatchesScreen() {
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
      setMatches(matchList);
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
    // Handle missing data gracefully
    if (!item.buyer || !item.buyer_intent) {
      return (
        <LiquidGlassCard
          cornerRadius={20}
          padding={20}
          elasticity={0.25}
          blurAmount={0.1}
          style={styles.matchCard}
        >
          <Text style={styles.buyerName}>Match data incomplete</Text>
          <Text style={styles.matchDate}>
            Matched {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
          </Text>
        </LiquidGlassCard>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleMatchPress(item)}
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
              <Text style={styles.buyerName}>{String(item.buyer?.display_name || 'Buyer')}</Text>
              {item.buyer_intent?.readiness_score != null && item.buyer_intent.readiness_score > 0 && (
                <View style={styles.readinessBadge}>
                  <Text style={styles.readinessText}>{String(item.buyer_intent.readiness_score)}% Ready</Text>
                </View>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={glassTokens.colors.text.secondary}
            />
          </View>

        {item.buyer_intent?.budget_min && item.buyer_intent?.budget_max && (
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget:</Text>
            <Text style={styles.budgetValue}>
              ${Number(item.buyer_intent.budget_min).toLocaleString()} - ${Number(item.buyer_intent.budget_max).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.matchFooter}>
          <Text style={styles.matchDate}>
            Matched {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
          </Text>
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
                Start swiping on buyer intents to find matches!
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
                paddingBottom: insets.bottom + 100,
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
  matchCard: {
    marginBottom: glassTokens.spacing.md,
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
  buyerName: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.3,
  },
  readinessBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${glassTokens.colors.accent.success}20`,
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.success,
  },
  readinessText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.accent.success,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: glassTokens.spacing.md,
    gap: glassTokens.spacing.sm,
  },
  budgetLabel: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
  },
  budgetValue: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: glassTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: glassTokens.spacing.sm,
  },
  matchDate: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.tertiary,
    flex: 1,
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

