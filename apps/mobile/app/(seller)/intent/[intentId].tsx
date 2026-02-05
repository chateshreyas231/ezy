// Buyer Intent Details (Seller View)
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IntentDetailScreen() {
  const { intentId } = useLocalSearchParams<{ intentId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [intent, setIntent] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch buyer intent by ID
  }, [intentId]);

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
          <Text style={styles.headerTitle}>Buyer Intent</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 40,
              paddingHorizontal: glassTokens.componentSpacing.screenPadding,
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <LiquidGlassCard
            title="Intent Details"
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
            blurAmount={0.1}
            style={styles.card}
          >
            <Text style={styles.placeholderText}>TODO: Implement buyer intent detail view</Text>
            <Text style={styles.placeholderSubtext}>
              Show buyer readiness score, budget, property preferences, location preferences, timeline
            </Text>
          </LiquidGlassCard>

          <LiquidGlassButton
            label="Match with Buyer"
            onPress={() => {
              // TODO: Create swipe(yes) on this intent
            }}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.matchButton}
          />
        </ScrollView>
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
  scrollContent: {
    paddingTop: glassTokens.spacing.md,
    gap: glassTokens.spacing.md,
  },
  card: {
    width: '100%',
    marginBottom: glassTokens.spacing.md,
  },
  placeholderText: {
    fontSize: glassTokens.typography.fontSize.base,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.sm,
  },
  placeholderSubtext: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    lineHeight: glassTokens.typography.fontSize.sm * glassTokens.typography.lineHeight.relaxed,
  },
  matchButton: {
    marginTop: glassTokens.spacing.md,
  },
});

