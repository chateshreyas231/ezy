// Pro Dashboard - Pipeline Overview (Kanban)
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const stages = [
  { id: 'matched', label: 'New Matches', color: glassTokens.colors.accent.primary },
  { id: 'touring', label: 'Touring', color: glassTokens.colors.accent.success },
  { id: 'offer_made', label: 'Offer Made', color: glassTokens.colors.accent.warning },
  { id: 'under_contract', label: 'Under Contract', color: glassTokens.colors.accent.secondary },
  { id: 'closed', label: 'Closed', color: glassTokens.colors.text.tertiary },
];

export default function ProDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [deals, setDeals] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    // TODO: Fetch deals grouped by stage
    // const { data } = await supabase.from('deal_rooms').select('*, match:matches(*, listing:listings(*), buyer:profiles(*))').eq('participants.profile_id', user.id);
    // Group by stage
    // setDeals(grouped);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeals();
    setRefreshing(false);
  };

  return (
    <ScreenBackground gradient>
      {/* Explore Button */}
      <View style={[styles.exploreHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.push('/explore?mode=agents')}
          style={styles.exploreButton}
        >
          <Ionicons name="map" size={20} color={glassTokens.colors.accent.primary} />
          <Text style={styles.exploreButtonText}>Explore</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { paddingTop: insets.top + 20, paddingBottom: 16 }]}>
          <Text style={styles.headerTitle}>Pipeline</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color={glassTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.kanbanContainer}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={glassTokens.colors.accent.primary}
            />
          }
        >
          {stages.map((stage) => (
            <View key={stage.id} style={styles.column}>
              <LiquidGlassCard
                title={stage.label}
                cornerRadius={20}
                padding={16}
                elasticity={0.25}
                blurAmount={0.1}
                style={styles.columnCard}
              >
                <View style={[styles.stageHeader, { borderLeftColor: stage.color }]}>
                  <Text style={styles.stageCount}>0</Text>
                </View>

                {/* Deal cards would go here */}
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>No deals in {stage.label}</Text>
                </View>
              </LiquidGlassCard>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exploreHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'flex-end',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    paddingBottom: glassTokens.spacing.sm,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    backgroundColor: glassTokens.colors.background.glassMedium,
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.sm,
    borderRadius: glassTokens.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(106, 27, 154, 0.2)',
  },
  exploreButtonText: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.accent.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    marginBottom: glassTokens.spacing.md,
  },
  headerTitle: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  filterButton: {
    padding: glassTokens.spacing.xs,
  },
  kanbanContainer: {
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    paddingBottom: 100,
    gap: glassTokens.spacing.md,
  },
  column: {
    width: 280,
    marginRight: glassTokens.spacing.md,
  },
  columnCard: {
    width: '100%',
    minHeight: 400,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: glassTokens.spacing.md,
    borderLeftWidth: 3,
    marginBottom: glassTokens.spacing.md,
  },
  stageCount: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
  },
  placeholderBox: {
    padding: glassTokens.spacing.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    textAlign: 'center',
  },
});

