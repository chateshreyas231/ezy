// Listing Detail Screen (Buyer View)
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch listing by ID
    // const loadListing = async () => {
    //   const { data } = await supabase.from('listings').select('*').eq('id', listingId).single();
    //   setListing(data);
    // };
    // loadListing();
  }, [listingId]);

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color={glassTokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
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
          {/* Image Gallery Placeholder */}
          <LiquidGlassCard
            cornerRadius={20}
            padding={0}
            elasticity={0.25}
            blurAmount={0.1}
            style={styles.imageCard}
          >
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image" size={64} color={glassTokens.colors.text.tertiary} />
              <Text style={styles.placeholderText}>Image Gallery</Text>
              <Text style={styles.placeholderSubtext}>TODO: Implement image gallery with tap to open full-screen</Text>
            </View>
          </LiquidGlassCard>

          {/* Listing Info */}
          <LiquidGlassCard
            cornerRadius={20}
            padding={24}
            elasticity={0.25}
            blurAmount={0.1}
            style={styles.infoCard}
          >
            <Text style={styles.title}>Beautiful 3BR House</Text>
            {listing?.listing_number && (
              <Text style={styles.listingNumber}>ID: {listing.listing_number}</Text>
            )}
            <Text style={styles.price}>$850,000</Text>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="bed" size={20} color={glassTokens.colors.text.secondary} />
                <Text style={styles.detailText}>3 bed</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={20} color={glassTokens.colors.text.secondary} />
                <Text style={styles.detailText}>2 bath</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="square" size={20} color={glassTokens.colors.text.secondary} />
                <Text style={styles.detailText}>1,800 sqft</Text>
              </View>
            </View>

            <View style={styles.addressRow}>
              <Ionicons name="location" size={16} color={glassTokens.colors.text.tertiary} />
              <Text style={styles.addressText}>Downtown Area, San Francisco</Text>
            </View>

            <Text style={styles.description}>
              Stunning modern home with updated kitchen, hardwood floors, and large backyard. Perfect for families.
            </Text>
          </LiquidGlassCard>

          {/* Match Explanation */}
          <LiquidGlassCard
            title="Why Matched"
            cornerRadius={20}
            padding={24}
            elasticity={0.25}
            blurAmount={0.1}
            style={styles.matchCard}
          >
            <Text style={styles.matchExplanation}>
              Great match on budget and property type preferences. Strong alignment on location and must-have features.
            </Text>
          </LiquidGlassCard>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <LiquidGlassButton
              label="Request Tour"
              onPress={() => {
                // TODO: Create tour request
                router.push(`/(shared)/deal/some-deal-id`);
              }}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.actionButton}
            />
            <LiquidGlassButton
              label="Message Seller"
              onPress={() => {
                // TODO: Navigate to deal room or create message
                router.push(`/(shared)/deal/some-deal-id`);
              }}
              variant="secondary"
              size="lg"
              fullWidth
              style={styles.actionButton}
            />
          </View>
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
  imageCard: {
    width: '100%',
    height: 300,
    marginBottom: glassTokens.spacing.md,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: glassTokens.spacing.md,
  },
  placeholderText: {
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
  },
  placeholderSubtext: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: glassTokens.spacing.lg,
  },
  infoCard: {
    width: '100%',
    marginBottom: glassTokens.spacing.md,
  },
  title: {
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
    marginBottom: glassTokens.spacing.sm,
  },
  price: {
    fontSize: glassTokens.typography.fontSize['3xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.md,
    letterSpacing: -1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: glassTokens.spacing.lg,
    marginBottom: glassTokens.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
  },
  detailText: {
    fontSize: glassTokens.typography.fontSize.base,
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
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    flex: 1,
  },
  description: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
  matchCard: {
    width: '100%',
    marginBottom: glassTokens.spacing.md,
  },
  matchExplanation: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
  actionsContainer: {
    gap: glassTokens.spacing.md,
    marginTop: glassTokens.spacing.md,
  },
  actionButton: {
    marginBottom: 0,
  },
});

