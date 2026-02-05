// app/(tabs)/feed.tsx
// Premium grid feed with search and filters

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../../services/supabaseClient';
import { seedAllMockData, seedMockListings, seedMockBuyerIntents } from '../../services/mockDataService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_MARGIN) / 2; // 2 columns with padding

interface ListingCard {
  id: string;
  title: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: string | null;
  address_public: string | null;
  features: string[];
  listing_verified: boolean;
}

interface BuyerIntentCard {
  id: string;
  buyer_id: string;
  budget_min: number | null;
  budget_max: number | null;
  beds_min: number | null;
  baths_min: number | null;
  property_types: string[];
}

type FilterType = 'trending' | 'most_viewed' | 'newest' | 'oldest';

export default function FeedScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<(ListingCard | BuyerIntentCard)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('trending');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [user, activeFilter]);

  const loadFeed = async () => {
    if (!user || !authUser) return;

    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);

      // Add timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        setLoading(false);
        // Auto-seed if still loading after 5 seconds and no cards
        if (cards.length === 0 && !seeding) {
          handleAutoSeed();
        }
      }, 5000);

      let query;
      if (user.role === 'buyer' || user.role === 'buyer_agent') {
        // Buyers see listings
        query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .eq('listing_verified', true);

        // Apply filter
        switch (activeFilter) {
          case 'trending':
            query = query.order('created_at', { ascending: false });
            break;
          case 'most_viewed':
            query = query.order('created_at', { ascending: false }); // TODO: Add view_count column
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
        }

        const { data: listings, error } = await query.limit(50);
        
        if (error) {
          if (timeoutId) clearTimeout(timeoutId);
          console.error('Error loading listings:', error);
          // Auto-seed on error
          if (cards.length === 0 && !seeding) {
            await handleAutoSeed();
          }
          return;
        }
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (listings && listings.length > 0) {
          setCards(listings);
        } else if (cards.length === 0 && !seeding) {
          // Auto-seed if no data and cards are empty
          await handleAutoSeed();
        }
      } else if (user.role === 'seller' || user.role === 'seller_agent') {
        // Sellers see buyer intents
        query = supabase
          .from('buyer_intents')
          .select('*')
          .eq('active', true);

        // Apply filter
        switch (activeFilter) {
          case 'trending':
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'most_viewed':
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data: intents, error } = await query.limit(50);
        
        if (error) {
          if (timeoutId) clearTimeout(timeoutId);
          console.error('Error loading intents:', error);
          // Auto-seed on error
          if (cards.length === 0 && !seeding) {
            await handleAutoSeed();
          }
          return;
        }
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (intents && intents.length > 0) {
          setCards(intents);
        } else if (cards.length === 0 && !seeding) {
          // Auto-seed if no data and cards are empty
          await handleAutoSeed();
        }
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
      // Auto-seed on error if no cards
      if (cards.length === 0 && !seeding) {
        await handleAutoSeed();
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleAutoSeed = async () => {
    if (seeding) return; // Prevent multiple simultaneous seeds
    
    try {
      setSeeding(true);
      let result;
      if (user?.role === 'buyer' || user?.role === 'buyer_agent') {
        result = await seedMockListings();
      } else {
        result = await seedMockBuyerIntents();
      }
      
      if (result.success) {
        // Reload feed after seeding with a short delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        await loadFeed();
      }
    } catch (error) {
      console.error('Auto-seed failed:', error);
    } finally {
      setSeeding(false);
    }
  };

  const handleCardPress = async (card: ListingCard | BuyerIntentCard) => {
    if (!authUser || !user) return;

    const targetType = user.role === 'buyer' || user.role === 'buyer_agent' 
      ? 'listing' 
      : 'buyer_intent';

    // Navigate to detail or handle swipe
    router.push(`/listing/${card.id}`);
  };

  const handleSeedMockData = async () => {
    setSeeding(true);
    try {
      if (user?.role === 'buyer' || user?.role === 'buyer_agent') {
        const result = await seedMockListings();
        if (result.success) {
          Alert.alert('Success', `Created ${result.count} mock listings!`, [
            { text: 'OK', onPress: () => loadFeed() }
          ]);
          await loadFeed();
        } else {
          Alert.alert('Error', result.error || 'Failed to seed data');
        }
      } else {
        const result = await seedMockBuyerIntents();
        if (result.success) {
          Alert.alert('Success', `Created ${result.count} mock buyer intents!`, [
            { text: 'OK', onPress: () => loadFeed() }
          ]);
          await loadFeed();
        } else {
          Alert.alert('Error', result.error || 'Failed to seed data');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to seed mock data';
      Alert.alert('Error', errorMessage);
    } finally {
      setSeeding(false);
    }
  };

  const handleSwipe = async (card: ListingCard | BuyerIntentCard, direction: 'yes' | 'no') => {
    if (!authUser || !user) return;

    try {
      const targetType = user.role === 'buyer' || user.role === 'buyer_agent' 
        ? 'listing' 
        : 'buyer_intent';

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          actor_id: authUser.id,
          target_type: targetType,
          target_id: card.id,
          direction,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.includes('verification')) {
          Alert.alert(
            'Verification Required',
            result.error,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') },
            ]
          );
          return;
        }
        throw new Error(result.error || 'Failed to swipe');
      }

      if (result.match_created) {
        Alert.alert('🎉 It\'s a Match!', 'You have a new match!', [
          { text: 'View Matches', onPress: () => router.push('/(tabs)/matches') },
          { text: 'Continue', style: 'cancel' },
        ]);
      }
    } catch (error) {
      console.error('Swipe error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to swipe';
      Alert.alert('Error', errorMessage);
    }
  };

  const filteredCards = cards.filter(card => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if ('title' in card) {
      return card.title.toLowerCase().includes(query) ||
        (card.address_public && card.address_public.toLowerCase().includes(query));
    }
    return false;
  });

  if (loading && cards.length === 0) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
          <Text style={styles.loadingText}>Loading feed...</Text>
          {seeding && (
            <Text style={[styles.loadingText, { marginTop: 8, fontSize: 14 }]}>
              Creating mock data...
            </Text>
          )}
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Premium Header with Search */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Theme.colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={Theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['trending', 'most_viewed', 'newest', 'oldest'] as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.filterTabActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter === 'most_viewed' ? 'Most Viewed' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Grid Feed */}
        {filteredCards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>
              {user?.role === 'buyer' || user?.role === 'buyer_agent'
                ? 'No listings available'
                : 'No buyer intents available'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {user?.role === 'buyer' || user?.role === 'buyer_agent'
                ? 'Create mock listings to test the app'
                : 'Create mock buyer intents to test the app'}
            </Text>
            <TouchableOpacity
              style={styles.seedButton}
              onPress={handleSeedMockData}
              disabled={seeding}
            >
              {seeding ? (
                <ActivityIndicator size="small" color={Theme.colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={Theme.colors.textPrimary} />
                  <Text style={styles.seedButtonText}>
                    {user?.role === 'buyer' || user?.role === 'buyer_agent'
                      ? 'Create Mock Listings'
                      : 'Create Mock Buyer Intents'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredCards}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => (
              <View style={[styles.cardWrapper, index % 2 === 0 && styles.cardWrapperLeft]}>
                {('price' in item) ? (
                  <ListingCardComponent 
                    card={item as ListingCard} 
                    onPress={() => handleCardPress(item)}
                    onSwipe={(direction) => handleSwipe(item, direction)}
                  />
                ) : (
                  <BuyerIntentCardComponent 
                    card={item as BuyerIntentCard}
                    onPress={() => handleCardPress(item)}
                    onSwipe={(direction) => handleSwipe(item, direction)}
                  />
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeScreen>
  );
}

function ListingCardComponent({ 
  card, 
  onPress,
  onSwipe 
}: { 
  card: ListingCard;
  onPress: () => void;
  onSwipe: (direction: 'yes' | 'no') => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="home" size={32} color={Theme.colors.textTertiary} />
        </View>
        {card.listing_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Theme.colors.success} />
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardPrice}>${card.price.toLocaleString()}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{card.title}</Text>
        <View style={styles.cardSpecs}>
          {card.beds && <Text style={styles.cardSpec}>🛏️ {card.beds}</Text>}
          {card.baths && <Text style={styles.cardSpec}>🚿 {card.baths}</Text>}
          {card.sqft && <Text style={styles.cardSpec}>📐 {Math.round(card.sqft / 1000)}k</Text>}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.cardActionNo]}
          onPress={(e) => {
            e.stopPropagation();
            onSwipe('no');
          }}
        >
          <Ionicons name="close" size={16} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.cardActionYes]}
          onPress={(e) => {
            e.stopPropagation();
            onSwipe('yes');
          }}
        >
          <Ionicons name="heart" size={16} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function BuyerIntentCardComponent({ 
  card, 
  onPress,
  onSwipe 
}: { 
  card: BuyerIntentCard;
  onPress: () => void;
  onSwipe: (direction: 'yes' | 'no') => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardImageContainer}>
        <View style={[styles.cardImagePlaceholder, styles.buyerIntentPlaceholder]}>
          <Ionicons name="search" size={32} color={Theme.colors.accent} />
        </View>
      </View>

      <View style={styles.cardInfo}>
        {card.budget_min && card.budget_max && (
          <Text style={styles.cardPrice}>
            ${card.budget_min.toLocaleString()} - ${card.budget_max.toLocaleString()}
          </Text>
        )}
        <Text style={styles.cardTitle}>Buyer Looking For</Text>
        <View style={styles.cardSpecs}>
          {card.beds_min && <Text style={styles.cardSpec}>🛏️ {card.beds_min}+</Text>}
          {card.baths_min && <Text style={styles.cardSpec}>🚿 {card.baths_min}+</Text>}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.cardActionNo]}
          onPress={(e) => {
            e.stopPropagation();
            onSwipe('no');
          }}
        >
          <Ionicons name="close" size={16} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.cardActionYes]}
          onPress={(e) => {
            e.stopPropagation();
            onSwipe('yes');
          }}
        >
          <Ionicons name="heart" size={16} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.md,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.md,
  },
  filterContainer: {
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  filterScroll: {
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surfaceElevated,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterTabActive: {
    backgroundColor: Theme.colors.textPrimary,
    borderColor: Theme.colors.textPrimary,
    ...Theme.shadows.glow,
  },
  filterText: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: Theme.colors.background,
    fontWeight: '700',
  },
  grid: {
    padding: Theme.spacing.md,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
  },
  cardWrapperLeft: {
    marginRight: CARD_MARGIN,
  },
  card: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.lg,
  },
  cardImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    position: 'relative',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyerIntentPlaceholder: {
    backgroundColor: Theme.colors.accent + '20',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Theme.spacing.xs,
    right: Theme.spacing.xs,
    backgroundColor: Theme.colors.success + '20',
    borderRadius: Theme.borderRadius.full,
    padding: Theme.spacing.xs,
  },
  cardInfo: {
    padding: Theme.spacing.sm,
  },
  cardPrice: {
    ...Theme.typography.h4,
    color: Theme.colors.accent,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  cardTitle: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
  cardSpecs: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  },
  cardSpec: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.sm,
    paddingBottom: Theme.spacing.sm,
    gap: Theme.spacing.xs,
  },
  cardActionButton: {
    flex: 1,
    height: 32,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActionNo: {
    backgroundColor: Theme.colors.error + '30',
  },
  cardActionYes: {
    backgroundColor: Theme.colors.success + '30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
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
    marginBottom: Theme.spacing.lg,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.accent,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  seedButtonText: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
});
