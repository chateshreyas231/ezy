// Seller Leads Feed - Swipe buyer intents with Liquid Glass
import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, PanResponder, Animated, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useSwipe } from '../../../lib/hooks/useSwipe';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT - 280;

interface BuyerIntentCard {
  intent: {
    id: string;
    budget_min: number;
    budget_max: number;
    beds_min: number;
    baths_min: number;
    property_types: string[];
    readiness_score: number;
  };
  buyer: {
    display_name: string;
    id: string;
  };
  isRequest?: boolean; // True if buyer swiped yes on seller's listing
  listingId?: string; // The listing the buyer swiped on
}

export default function SellerLeadsScreen() {
  const [intents, setIntents] = useState<BuyerIntentCard[]>([]);
  const [requests, setRequests] = useState<BuyerIntentCard[]>([]); // Buyers who swiped yes on seller's listings
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRequests, setShowRequests] = useState(true); // Toggle between requests and general leads
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { createSwipe } = useSwipe();

  useEffect(() => {
    loadLeads();
  }, []);

  // Refresh leads when screen comes into focus (so seller sees new requests)
  useFocusEffect(
    useCallback(() => {
      loadLeads();
    }, [user])
  );

  const loadLeads = async () => {
    if (!user) {
      console.log('No user found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading seller leads for user:', user.id);
      console.log('Seller profile:', {
        id: profile?.id,
        role: profile?.role,
        seller_verified: profile?.seller_verified,
        verification_level: profile?.verification_level,
      });

      // STEP 1: Get buyers who have swiped "yes" on seller's listings (REQUESTS)
      // First, get seller's active listings
      const { data: sellerListings, error: listingsError } = await supabase
        .from('listings')
        .select('id, status')
        .eq('seller_id', user.id)
        .eq('status', 'active');

      if (listingsError) {
        console.error('Error fetching seller listings:', listingsError);
      }

      const listingIds = (sellerListings || []).map(l => l.id);
      console.log(`Seller has ${listingIds.length} active listings`);
      if (listingIds.length > 0) {
        console.log('Sample listing IDs:', listingIds.slice(0, 3));
      }
      let buyerRequests: BuyerIntentCard[] = [];
      let buyerSwipes: any[] = []; // Initialize outside the if block

      if (listingIds.length > 0) {
        // Get all "yes" swipes on seller's listings
        const { data: swipesData, error: swipesError } = await supabase
          .from('swipes')
          .select('target_id, actor_id, created_at')
          .eq('target_type', 'listing')
          .eq('direction', 'yes')
          .in('target_id', listingIds);
        
        console.log(`Found ${swipesData?.length || 0} YES swipes on seller's ${listingIds.length} listings`);
        
        // Debug: Check if the specific listing from the buyer swipe exists
        const { data: checkListing } = await supabase
          .from('listings')
          .select('id, seller_id, status')
          .eq('id', 'c135329b-ad35-4c1d-938c-e76aafadc735')
          .single();
        console.log('Buyer swiped listing check:', checkListing);
        
        // Debug: Check all YES swipes on listings (not filtered by seller)
        const { data: allListingSwipes } = await supabase
          .from('swipes')
          .select('target_id, actor_id, created_at')
          .eq('target_type', 'listing')
          .eq('direction', 'yes')
          .order('created_at', { ascending: false })
          .limit(5);
        console.log('Recent YES swipes on listings:', allListingSwipes);

        if (swipesError) {
          console.error('Error fetching buyer swipes:', swipesError);
        } else if (swipesData && swipesData.length > 0) {
          buyerSwipes = swipesData; // Assign to outer variable
          // Get buyer IDs who swiped yes
          const buyerIds = [...new Set(buyerSwipes.map(s => s.actor_id))];
          
          // Get buyer intents for these buyers
          const { data: requestIntents, error: requestIntentsError } = await supabase
            .from('buyer_intents')
            .select(`
              id,
              budget_min,
              budget_max,
              beds_min,
              baths_min,
              property_types,
              active,
              buyer_id,
              verified,
              readiness_score
            `)
            .in('buyer_id', buyerIds)
            .eq('active', true);

          if (requestIntentsError) {
            console.error('Error fetching request intents:', requestIntentsError);
          } else if (requestIntents && requestIntents.length > 0) {
            // Fetch buyer profiles separately
            const { data: requestBuyerProfiles } = await supabase
              .from('profiles')
              .select('id, display_name, buyer_verified, readiness_score')
              .in('id', buyerIds)
              .eq('role', 'buyer');

            const requestBuyerProfileMap = new Map(
              (requestBuyerProfiles || []).map(profile => [profile.id, profile])
            );

            // Attach buyer profiles to request intents
            const requestIntentsWithProfiles = requestIntents.map(intent => ({
              ...intent,
              buyer: requestBuyerProfileMap.get(intent.buyer_id) || null,
            }));

            // Create a map of listing_id -> buyer_id from swipes
            const listingToBuyerMap = new Map(
              buyerSwipes.map(s => [s.target_id, s.actor_id])
            );

            // Filter and transform request intents
            buyerRequests = requestIntentsWithProfiles
              .filter(intent => {
                const buyer = intent.buyer as any;
                if (!buyer || !buyer.buyer_verified) {
                  return false;
                }
                if ((intent as any).verified === false) {
                  return false;
                }
                return true;
              })
              .map(intent => {
                const buyer = intent.buyer as any;
                // Find which listing this buyer swiped on
                const listingId = Array.from(listingToBuyerMap.entries())
                  .find(([_, buyerId]) => buyerId === intent.buyer_id)?.[0];
                
                return {
                  intent: {
                    id: intent.id,
                    budget_min: intent.budget_min || 0,
                    budget_max: intent.budget_max || 0,
                    beds_min: intent.beds_min || 0,
                    baths_min: intent.baths_min || 0,
                    property_types: intent.property_types || [],
                    readiness_score: (intent as any).readiness_score ?? buyer?.readiness_score ?? 0,
                  },
                  buyer: {
                    id: buyer?.id || intent.buyer_id,
                    display_name: buyer?.display_name || 'Buyer',
                  },
                  isRequest: true,
                  listingId: listingId,
                } as BuyerIntentCard;
              });

            // Found valid buyer requests
          }
        }
      }

      setRequests(buyerRequests);

      // STEP 2: Get all other buyer intents (general leads)
      // RLS will filter to only show verified intents if seller is verified
      const { data: buyerIntents, error: intentsError } = await supabase
        .from('buyer_intents')
        .select(`
          id,
          budget_min,
          budget_max,
          beds_min,
          baths_min,
          property_types,
          active,
          buyer_id,
          verified,
          readiness_score,
          buyer:profiles!buyer_intents_buyer_id_fkey(
            id,
            display_name,
            buyer_verified,
            readiness_score
          )
        `)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (intentsError) {
        console.error('Error fetching buyer intents:', intentsError);
        throw intentsError;
      }

      console.log('Fetched buyer intents:', buyerIntents?.length || 0);
      
      if (!buyerIntents || buyerIntents.length === 0) {
        console.log('No buyer intents found');
        setIntents([]);
        setLoading(false);
        return;
      }

      // Fetch buyer profiles separately (RLS might block the join)
      const buyerIds = [...new Set(buyerIntents.map(i => i.buyer_id))];
      console.log(`Fetching profiles for ${buyerIds.length} buyers...`);
      console.log(`Buyer IDs:`, buyerIds);
      
      const { data: buyerProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, buyer_verified, readiness_score, role')
        .in('id', buyerIds)
        .eq('role', 'buyer');

      if (profilesError) {
        console.error('Error fetching buyer profiles:', profilesError);
        console.error('Profile error details:', JSON.stringify(profilesError, null, 2));
      } else {
        console.log(`Fetched ${buyerProfiles?.length || 0} buyer profiles`);
        if (buyerProfiles && buyerProfiles.length > 0) {
          console.log('Sample buyer profile:', {
            id: buyerProfiles[0].id,
            display_name: buyerProfiles[0].display_name,
            buyer_verified: buyerProfiles[0].buyer_verified,
            role: buyerProfiles[0].role,
          });
        }
      }

      // Create a map of buyer_id -> profile
      const buyerProfileMap = new Map(
        (buyerProfiles || []).map(profile => [profile.id, profile])
      );

      // Attach buyer profiles to intents
      const buyerIntentsWithProfiles = buyerIntents.map(intent => ({
        ...intent,
        buyer: buyerProfileMap.get(intent.buyer_id) || null,
      }));

      // Debug: Log intent details
      if (buyerIntentsWithProfiles && buyerIntentsWithProfiles.length > 0) {
        console.log('Sample buyer intent:', {
          id: buyerIntentsWithProfiles[0].id,
          verified: (buyerIntentsWithProfiles[0] as any).verified,
          buyer_verified: buyerIntentsWithProfiles[0].buyer?.buyer_verified,
          buyer_id: buyerIntentsWithProfiles[0].buyer_id,
          buyer_profile_exists: !!buyerIntentsWithProfiles[0].buyer,
        });
      }

      // Get buyer intents that the seller has already swiped on
      const intentIds = buyerIntentsWithProfiles.map(i => i.id);
      const requestIntentIds = buyerRequests.map(r => r.intent.id);
      const allIntentIds = [...intentIds, ...requestIntentIds];
      
      const { data: existingSwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('actor_id', user.id)
        .eq('target_type', 'buyer_intent')
        .in('target_id', allIntentIds);

      if (swipesError) {
        console.error('Error fetching swipes:', swipesError);
      }

      const swipedIntentIds = new Set((existingSwipes || []).map(s => s.target_id));
      console.log(`Seller has swiped on ${swipedIntentIds.size} buyer intents`);

      // Filter and transform the data (exclude requests and already swiped)
      let excludedRequests = 0;
      let excludedUnverifiedBuyer = 0;
      let excludedUnverifiedIntent = 0;
      let excludedAlreadySwiped = 0;
      
      const filteredIntents = buyerIntentsWithProfiles
        .filter(intent => {
          // Exclude requests (they're shown separately)
          if (requestIntentIds.includes(intent.id)) {
            excludedRequests++;
            return false;
          }

          // Only show intents from verified buyers
          const buyer = intent.buyer as any;
          if (!buyer) {
            excludedUnverifiedBuyer++;
            console.log(`  ⚠️ Filtering out intent ${intent.id}: buyer profile not found (buyer_id: ${intent.buyer_id})`);
            return false;
          }
          
          if (!buyer.buyer_verified) {
            excludedUnverifiedBuyer++;
            console.log(`  ⚠️ Filtering out intent ${intent.id}: buyer not verified (buyer: ${buyer.id}, buyer_verified: ${buyer.buyer_verified})`);
            return false;
          }

          // If verified field exists on intent, check it
          if ((intent as any).verified === false) {
            excludedUnverifiedIntent++;
            console.log(`  ⚠️ Filtering out intent ${intent.id}: intent not verified`);
            return false;
          }

          // Filter out intents the seller has already swiped on
          if (swipedIntentIds.has(intent.id)) {
            excludedAlreadySwiped++;
            return false;
          }

          return true;
        })
        .map(intent => {
          const buyer = intent.buyer as any;
          const readinessScore = (intent as any).readiness_score ?? buyer?.readiness_score ?? 0;
          
          return {
            intent: {
              id: intent.id,
              budget_min: intent.budget_min || 0,
              budget_max: intent.budget_max || 0,
              beds_min: intent.beds_min || 0,
              baths_min: intent.baths_min || 0,
              property_types: intent.property_types || [],
              readiness_score: readinessScore,
            },
            buyer: {
              id: buyer?.id || intent.buyer_id,
              display_name: buyer?.display_name || 'Buyer',
            },
            isRequest: false,
          } as BuyerIntentCard;
        });

      // Filter out requests that seller has already swiped on
      const filteredRequests = buyerRequests.filter(req => {
        const alreadySwiped = swipedIntentIds.has(req.intent.id);
        if (alreadySwiped) {
          console.log(`Filtering out request ${req.intent.id}: seller already swiped on it`);
        }
        return !alreadySwiped;
      });

      // Summary: requests first, then general leads
      console.log('=== FILTERING SUMMARY ===');
      console.log(`Total buyer intents fetched: ${buyerIntents.length}`);
      console.log(`Excluded (requests): ${excludedRequests}`);
      console.log(`Excluded (unverified buyer): ${excludedUnverifiedBuyer}`);
      console.log(`Excluded (unverified intent): ${excludedUnverifiedIntent}`);
      console.log(`Excluded (already swiped): ${excludedAlreadySwiped}`);
      console.log(`Filtered intents to show: ${filteredIntents.length}`);
      console.log(`Requests to show: ${filteredRequests.length}`);
      console.log(`Total cards: ${filteredIntents.length + filteredRequests.length}`);
      
      // Combine: requests first, then general leads
      const allIntents = [...filteredRequests, ...filteredIntents];
      setIntents(allIntents);
      setRequests(filteredRequests);
      setCurrentIndex(0);
    } catch (error: any) {
      console.error('Error loading leads:', error);
      Alert.alert('Error', error.message || 'Failed to load buyer intents');
      setIntents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  const handleSwipe = async (direction: 'yes' | 'no') => {
    if (currentIndex >= intents.length) return;

    const currentIntent = intents[currentIndex];
    if (!currentIntent || !user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log('Creating swipe:', {
        direction,
        buyerIntentId: currentIntent.intent.id,
        target_type: 'buyer_intent',
        isRequest: currentIntent.isRequest,
      });

      // Use the edge function to create swipe
      const result = await createSwipe({
        target_type: 'buyer_intent',
        target_id: currentIntent.intent.id,
        direction: direction === 'yes' ? 'yes' : 'no',
      });

      console.log('Swipe result:', result);

      // Move to next card
      setCurrentIndex((prev) => prev + 1);

      // If seller accepted a request and it created a match
      if (direction === 'yes' && result?.matched) {
        console.log('🎉 Match created! Deal room ID:', result.deal_room_id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Match! 🎉',
          currentIntent.isRequest 
            ? 'You accepted the buyer\'s request! Check your Matches tab.'
            : 'You matched with this buyer! Check your Matches tab.',
          [
            {
              text: 'View Matches',
              onPress: () => router.push('/(seller)/(tabs)/matches'),
            },
            { text: 'Continue', style: 'cancel' },
          ]
        );
      } else if (direction === 'yes' && currentIntent.isRequest) {
        // Request accepted but buyer hasn't swiped yes yet (shouldn't happen, but handle gracefully)
        console.log('Request accepted, waiting for buyer to swipe');
      }
    } catch (error: any) {
      console.error('Error handling swipe:', error);
      Alert.alert('Error', error.message || 'Failed to swipe');
    }
  };

  const currentIntent = intents[currentIndex];

  if (loading) {
    return (
      <ScreenBackground gradient>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
          <LiquidGlassCard 
            title="Loading..."
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
          >
            <Text style={styles.emptyText}>
              Fetching buyer intents...
            </Text>
          </LiquidGlassCard>
        </View>
      </ScreenBackground>
    );
  }

  if (intents.length === 0) {
    return (
      <ScreenBackground gradient>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
          <LiquidGlassCard 
            title="No buyer intents available"
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
          >
            <Text style={styles.emptyText}>
              Check back later for new buyer leads
            </Text>
          </LiquidGlassCard>
        </View>
      </ScreenBackground>
    );
  }

  if (!currentIntent) {
    return (
      <ScreenBackground gradient>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
          <LiquidGlassCard 
            title="You're all caught up!"
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
          >
            <Text style={styles.emptyText}>
              You've seen all available buyer intents. Check back later for more.
            </Text>
          </LiquidGlassCard>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground gradient>
      {/* Explore Button */}
      <View style={[styles.exploreHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.push('/explore?mode=sellers')}
          style={styles.exploreButton}
        >
          <Ionicons name="map" size={20} color={glassTokens.colors.accent.primary} />
          <Text style={styles.exploreButtonText}>Explore</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={[styles.container]}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={glassTokens.colors.accent.primary}
          />
        }
        scrollEnabled={true}
        bounces={true}
      >
        <View style={{ flex: 1 }}>
          {/* Header showing request count */}
          {requests.length > 0 && (
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
              <LiquidGlassCard cornerRadius={16} padding={12} elasticity={0.2}>
                <View style={styles.headerRow}>
                  <Ionicons name="notifications" size={20} color={glassTokens.colors.accent.primary} />
                  <Text style={styles.headerText}>
                    {requests.length} pending request{requests.length !== 1 ? 's' : ''} from buyers
                  </Text>
                </View>
                <Text style={styles.headerSubtext}>
                  Swipe MATCH to accept, ARCHIVE to decline
                </Text>
              </LiquidGlassCard>
            </View>
          )}
          <View style={[styles.cardContainer, { paddingTop: requests.length > 0 ? 10 : insets.top + 20 }]}>
            <LiquidGlassCard
              cornerRadius={24}
              padding={24}
              elasticity={0.3}
              blurAmount={0.1}
              style={styles.card}
            >
            <View style={styles.header}>
              <View style={styles.readinessBadge}>
                <Text style={styles.readinessScore}>{currentIntent.intent.readiness_score}% Ready</Text>
              </View>
            </View>

            <Text style={styles.buyerName}>{currentIntent.buyer.display_name}</Text>
            {currentIntent.buyer.id && (
              <Text style={styles.buyerId}>Buyer ID: {currentIntent.buyer.id.substring(0, 8)}...</Text>
            )}
            {currentIntent.isRequest && (
              <View style={styles.requestBadge}>
                <Ionicons name="notifications" size={16} color={glassTokens.colors.accent.primary} />
                <Text style={styles.requestBadgeText}>
                  REQUEST: This buyer swiped MATCH on your listing
                </Text>
              </View>
            )}

            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Budget:</Text>
              <Text style={styles.budgetValue}>
                ${currentIntent.intent.budget_min.toLocaleString()} - ${currentIntent.intent.budget_max.toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>
                {currentIntent.intent.beds_min}+ bed • {currentIntent.intent.baths_min}+ bath
              </Text>
            </View>

            <View style={styles.propertyTypes}>
              <Text style={styles.typesLabel}>Property Types:</Text>
              <View style={styles.typesList}>
                {currentIntent.intent.property_types.map((type, idx) => (
                  <View key={idx} style={styles.typeChip}>
                    <Text style={styles.typeText}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        <View style={[
          styles.actionButtons, 
          { 
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: glassTokens.componentSpacing.screenPadding,
          }
        ]}>
          <LiquidGlassButton
            label="ARCHIVE"
            onPress={() => handleSwipe('no')}
            variant="error"
            size="lg"
            style={[styles.actionButton, { marginRight: glassTokens.spacing.md }]}
          />
          <LiquidGlassButton
            label="MATCH"
            onPress={() => handleSwipe('yes')}
            variant="success"
            size="lg"
            style={styles.actionButton}
          />
          </View>
        </View>
      </ScrollView>
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.md,
    gap: glassTokens.spacing.sm,
  },
  requestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    backgroundColor: `${glassTokens.colors.accent.primary}30`,
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.sm,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.primary,
    flex: 1,
  },
  requestBadgeText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readinessBadge: {
    backgroundColor: `${glassTokens.colors.accent.success}20`,
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.sm,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.success,
  },
  readinessScore: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.accent.success,
    fontWeight: glassTokens.typography.fontWeight.bold,
  },
  buyerName: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.5,
  },
  buyerId: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.xs,
  },
  requestText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.accent.primary,
    fontWeight: glassTokens.typography.fontWeight.medium,
    marginBottom: glassTokens.spacing.md,
    fontStyle: 'italic',
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
  detailsRow: {
    marginBottom: glassTokens.spacing.md,
  },
  detailText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
  },
  propertyTypes: {
    marginTop: glassTokens.spacing.md,
  },
  typesLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: glassTokens.spacing.sm,
  },
  typeChip: {
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: glassTokens.spacing.lg,
    gap: glassTokens.spacing.md,
  },
  actionButton: {
    flex: 1,
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
  headerContainer: {
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    marginBottom: glassTokens.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.sm,
    marginBottom: glassTokens.spacing.xs,
  },
  headerText: {
    fontSize: glassTokens.typography.fontSize.base,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
  },
  headerSubtext: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    marginTop: glassTokens.spacing.xs,
  },
});

