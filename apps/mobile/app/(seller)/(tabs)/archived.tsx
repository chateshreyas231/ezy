// Seller Archived - View archived buyer intents
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSwipes } from '../../../lib/hooks/useSwipes';
import { ScreenBackground, LiquidGlassCard, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ArchivedIntent {
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
}

export default function SellerArchivedScreen() {
  const [archived, setArchived] = useState<ArchivedIntent[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchArchived } = useSwipes();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadArchived();
  }, []);

  const loadArchived = async () => {
    setLoading(true);
    try {
      const archivedList = await fetchArchived();
      setArchived(archivedList);
    } catch (error: any) {
      console.error('Failed to load archived:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderArchived = ({ item }: { item: ArchivedIntent }) => (
    <LiquidGlassCard
      cornerRadius={20}
      padding={20}
      elasticity={0.25}
      blurAmount={0.1}
      style={[styles.archivedCard, { opacity: 0.7 }]}
    >
      <View style={styles.archivedHeader}>
        <View style={styles.archivedInfo}>
          <Text style={styles.buyerName}>{item.buyer.display_name}</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget:</Text>
            <Text style={styles.budgetValue}>
              ${item.buyer_intent.budget_min.toLocaleString()} - ${item.buyer_intent.budget_max.toLocaleString()}
            </Text>
          </View>
        </View>
        <Ionicons
          name="archive"
          size={20}
          color={glassTokens.colors.text.tertiary}
        />
      </View>

      <View style={styles.archivedFooter}>
        <Text style={styles.archivedDate}>
          Archived {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </LiquidGlassCard>
  );

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {archived.length === 0 && !loading ? (
          <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
            <LiquidGlassCard 
              title="No archived intents"
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
            >
              <Text style={styles.emptyText}>
                Buyer intents you swipe right (archive) will appear here.
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
  buyerName: {
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.xs,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
  },
  budgetLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
  },
  budgetValue: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.tertiary,
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

