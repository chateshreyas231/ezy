// app/seller/listing/[id].tsx
// Seller listing detail screen
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../../../components/ui/AnimatedButton';
import AnimatedCard from '../../../components/ui/AnimatedCard';
import SafeScreen from '../../../components/ui/SafeScreen';
import { Theme } from '../../../constants/Theme';
import { supabase } from '../../../services/supabaseClient';
import type { ListingPost } from '../../../src/types/types';

export default function SellerListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listing_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error: any) {
      console.error('Failed to load listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
        </View>
      </SafeScreen>
    );
  }

  if (!listing) {
    return (
      <SafeScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </SafeScreen>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <AnimatedCard delay={0}>
          <View style={styles.header}>
            <Ionicons name="home" size={48} color={Theme.colors.accent} />
            <Text style={styles.title}>Listing Details</Text>
            <Text style={styles.price}>{formatPrice(listing.list_price)}</Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color={Theme.colors.accent} />
              <Text style={styles.detailText}>
                {[listing.address, listing.city, listing.state].filter(Boolean).join(', ')}
              </Text>
            </View>

            <View style={styles.specs}>
              {listing.beds && (
                <View style={styles.spec}>
                  <Ionicons name="bed-outline" size={18} color={Theme.colors.textSecondary} />
                  <Text style={styles.specText}>{listing.beds} Beds</Text>
                </View>
              )}
              {listing.baths && (
                <View style={styles.spec}>
                  <Ionicons name="water-outline" size={18} color={Theme.colors.textSecondary} />
                  <Text style={styles.specText}>{listing.baths} Baths</Text>
                </View>
              )}
              {listing.property_type && (
                <View style={styles.spec}>
                  <Ionicons name="home-outline" size={18} color={Theme.colors.textSecondary} />
                  <Text style={styles.specText}>{listing.property_type}</Text>
                </View>
              )}
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: Theme.colors.accent + '20' }]}>
                <Text style={[styles.statusText, { color: Theme.colors.accent }]}>
                  {listing.listing_status || 'draft'}
                </Text>
              </View>
            </View>

            {listing.verified && (
              <View style={styles.verifiedRow}>
                <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
                <Text style={styles.verifiedText}>This listing is verified</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <AnimatedButton
              title="Edit Listing"
              onPress={() => router.push(`/screens/CreateListingScreen?id=${listing.id}`)}
              variant="primary"
              icon="create-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="View Leads"
              onPress={() => router.push(`/seller/leads?listingId=${listing.id}`)}
              variant="outline"
              icon="people-outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </AnimatedCard>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorText: {
    ...Theme.typography.body,
    color: Theme.colors.error,
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
  price: {
    ...Theme.typography.h2,
    color: Theme.colors.accent,
  },
  details: {
    gap: Theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  detailText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  specs: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  specText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  statusLabel: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  statusText: {
    ...Theme.typography.bodySmall,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  verifiedText: {
    ...Theme.typography.body,
    color: Theme.colors.success,
  },
  actions: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

