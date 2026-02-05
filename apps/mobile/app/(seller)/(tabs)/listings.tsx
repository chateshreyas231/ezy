// Seller Listings Manager
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../lib/hooks/useAuth';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  listing_verified: boolean;
  created_at: string;
}

export default function SellerListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadListings();
  }, []);

  // Refresh listings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadListings();
    }, [user])
  );

  const loadListings = async () => {
    if (!user) {
      console.log('No user found');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Loading listings for seller:', user.id);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }

      console.log('Fetched listings:', data?.length || 0);
      setListings(data || []);
    } catch (error: any) {
      console.error('Failed to load listings:', error);
      // Don't show alert, just log the error
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const renderListing = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(seller)/listing/${item.id}`)}
    >
      <LiquidGlassCard
        cornerRadius={20}
        padding={20}
        elasticity={0.25}
        blurAmount={0.1}
        style={styles.listingCard}
      >
        <View style={styles.listingHeader}>
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
            {item.listing_number && (
              <Text style={styles.listingNumber}>ID: {item.listing_number}</Text>
            )}
            <Text style={styles.listingPrice}>${item.price.toLocaleString()}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={glassTokens.colors.text.secondary}
          />
        </View>

        <View style={styles.listingFooter}>
          <View style={[
            styles.statusBadge,
            item.status === 'active' && styles.statusBadgeActive,
            item.status === 'draft' && styles.statusBadgeDraft,
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'active' && styles.statusTextActive,
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          {item.listing_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={glassTokens.colors.accent.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      </LiquidGlassCard>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {loading ? (
          <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
            <LiquidGlassCard 
              title="Loading..."
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
            >
              <Text style={styles.emptyText}>
                Loading your listings...
              </Text>
            </LiquidGlassCard>
          </View>
        ) : listings.length === 0 ? (
          <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
            <LiquidGlassCard 
              title="No listings yet"
              cornerRadius={24}
              padding={24}
              elasticity={0.25}
            >
              <Text style={styles.emptyText}>
                Create your first listing to start connecting with buyers
              </Text>
              <LiquidGlassButton
                label="Create Listing"
                onPress={() => router.push('/(seller)/create-listing')}
                variant="primary"
                size="md"
                style={styles.createButton}
              />
            </LiquidGlassCard>
          </View>
        ) : (
          <>
            <View style={[styles.header, { paddingTop: insets.top + 20, paddingBottom: 16 }]}>
              <Text style={styles.headerTitle}>My Listings</Text>
              <LiquidGlassButton
                label="+ New"
                onPress={() => router.push('/(seller)/create-listing')}
                variant="primary"
                size="sm"
              />
            </View>

            <FlatList
              data={listings}
              renderItem={renderListing}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.listContent,
                {
                  paddingBottom: insets.bottom + 100,
                  paddingHorizontal: glassTokens.componentSpacing.screenPadding,
                }
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={loadListings}
                  tintColor={glassTokens.colors.accent.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          </>
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
  listContent: {
    gap: glassTokens.spacing.md,
    paddingTop: glassTokens.spacing.md,
  },
  listingCard: {
    marginBottom: glassTokens.spacing.md,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.md,
  },
  listingInfo: {
    flex: 1,
    marginRight: glassTokens.spacing.sm,
  },
  listingTitle: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.3,
  },
  listingNumber: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.xs,
  },
  listingPrice: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: glassTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: glassTokens.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: glassTokens.spacing.sm,
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
  statusText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.secondary,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  statusTextActive: {
    color: glassTokens.colors.accent.success,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    backgroundColor: `${glassTokens.colors.accent.success}20`,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.success,
  },
  verifiedText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.accent.success,
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
    marginBottom: glassTokens.spacing.lg,
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
  createButton: {
    marginTop: glassTokens.spacing.md,
  },
});

