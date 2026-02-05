// Buyer Feed - Browse properties with Liquid Glass UI (Reels-style)
// Use MATCH and ARCHIVE buttons to interact with listings
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image';
import { useFeed } from '../../../lib/hooks/useFeed';
import { useSwipe } from '../../../lib/hooks/useSwipe';
import { useUserSwipes } from '../../../lib/hooks/useUserSwipes';
import { useAuth } from '../../../lib/hooks/useAuth';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabaseClient';
import { getAssetUri } from '../../../lib/utils/assetLoader';

// Placeholder URLs for when no media is available
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1568605117035-4c1b3c0e0b1a?w=800',
  'https://images.unsplash.com/photo-1560448075-cbc16bf4e33c?w=800',
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const TAB_BAR_HEIGHT = 60; // Tab bar height (minHeight from GlassTabBar)
const CARD_HEIGHT = SCREEN_HEIGHT - 280; // Account for safe areas and buttons

interface MediaItem {
  id: string;
  uri: string;
  type: 'video' | 'image';
  order_index: number;
}

interface ListingCard {
  listing: {
    id: string;
    seller_id?: string; // Seller ID
    title: string;
    price: number;
    beds: number;
    baths: number;
    sqft?: number;
    description?: string;
    address_public?: string;
    property_type?: string;
    features?: string[];
    listing_number?: string; // Listing ID
  };
  explanation?: string;
  match_score?: number;
  score?: number; // 0-1 from matchmake function
  media?: MediaItem[];
  isRequest?: boolean; // True if seller swiped yes on buyer's intent
}

// Media Background Component (Reels-style with auto-scroll for multiple images)
function MediaBackground({ mediaItems }: { mediaItems: MediaItem[] }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Ensure we have valid media items
  const validMediaItems = mediaItems && mediaItems.length > 0 
    ? mediaItems.filter(item => item && item.uri) 
    : [];
  
  const currentMedia = validMediaItems.length > 0 
    ? validMediaItems[Math.min(currentMediaIndex, validMediaItems.length - 1)]
    : null;
  
  // Auto-scroll through images (not videos)
  useEffect(() => {
    if (validMediaItems.length <= 1) return;
    
    // Only auto-scroll if current item is an image
    if (currentMedia && currentMedia.type === 'image') {
      const timer = setInterval(() => {
        setCurrentMediaIndex((prev) => {
          // Find next image (skip videos for auto-scroll)
          let nextIndex = (prev + 1) % validMediaItems.length;
          let attempts = 0;
          while (validMediaItems[nextIndex] && validMediaItems[nextIndex].type === 'video' && attempts < validMediaItems.length) {
            nextIndex = (nextIndex + 1) % validMediaItems.length;
            attempts++;
          }
          return nextIndex;
        });
      }, 3000); // Change image every 3 seconds
      
      return () => clearInterval(timer);
    }
  }, [validMediaItems.length, currentMediaIndex, currentMedia?.type]);

  // Create video player with autoplay - always call hook, even if no video
  const player = useVideoPlayer(
    currentMedia?.type === 'video' ? currentMedia.uri : undefined,
    (player) => {
      if (player && currentMedia?.type === 'video') {
        player.loop = true;
        player.play();
      }
    }
  );

  // Reset video when media changes
  useEffect(() => {
    if (currentMedia?.type === 'video' && player) {
      player.play();
    }
  }, [currentMedia?.id, player]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentMediaIndex >= validMediaItems.length && validMediaItems.length > 0) {
      setCurrentMediaIndex(0);
    }
  }, [currentMediaIndex, validMediaItems.length]);

  // Always render something - use placeholder if no media
  if (validMediaItems.length === 0 || !currentMedia) {
    return (
      <View style={styles.backgroundMedia}>
        <Image
          source={{ uri: PLACEHOLDER_IMAGES[0] }}
          style={styles.backgroundMedia}
          contentFit="cover"
        />
      </View>
    );
  }

  if (currentMedia.type === 'video') {
    return (
      <VideoView
        player={player}
        style={styles.backgroundMedia}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
      />
    );
  }

  return (
    <Image
      source={{ uri: currentMedia.uri }}
      style={styles.backgroundMedia}
      contentFit="cover"
    />
  );
}

// Listing card component (no swipe gestures, buttons only)
function ListingCard({
  item,
  onTap,
  isMatched,
}: {
  item: ListingCard;
  onTap: () => void;
  isMatched: (listingId: string) => boolean;
}) {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        {/* Media Background (Reels-style) - Always show media, even if placeholder */}
        {item.media && item.media.length > 0 ? (
          <MediaBackground mediaItems={item.media} />
        ) : (
          // Fallback: Show placeholder if no media
          <MediaBackground mediaItems={[{
            id: 'fallback-placeholder',
            uri: PLACEHOLDER_IMAGES[0],
            type: 'image' as const,
            order_index: 0,
          }]} />
        )}

        {/* Card content overlay - transparent so media shows through */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onTap}
          style={styles.cardContent}
        >
          {/* Green match indicator - circular badge in top right */}
          {isMatched(item.listing.id) && (
            <View style={styles.matchIndicator}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            </View>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.listing.title}</Text>
              {item.listing.listing_number && (
                <Text style={styles.listingNumber}>Listing ID: {item.listing.listing_number}</Text>
              )}
              {item.listing.seller_id && (
                <Text style={styles.sellerId}>Seller ID: {item.listing.seller_id.substring(0, 8)}...</Text>
              )}
              {item.isRequest && (
                <View style={styles.requestBadge}>
                  <Ionicons name="notifications" size={14} color="#fff" />
                  <Text style={styles.requestBadgeText}>SELLER INTERESTED</Text>
                </View>
              )}
            </View>
            {(item.match_score !== undefined && item.match_score !== null) && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchScore}>{item.match_score}%</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardPrice}>
            ${item.listing.price.toLocaleString()}
          </Text>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="bed" size={18} color={glassTokens.colors.text.primary} />
              <Text style={styles.detailText}>{item.listing.beds} bed</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="water" size={18} color={glassTokens.colors.text.primary} />
              <Text style={styles.detailText}>{item.listing.baths} bath</Text>
            </View>
            {item.listing.sqft && (
              <View style={styles.detailRow}>
                <Ionicons name="square" size={18} color={glassTokens.colors.text.primary} />
                <Text style={styles.detailText}>{item.listing.sqft.toLocaleString()} sqft</Text>
              </View>
            )}
            {item.listing.property_type && (
              <View style={styles.detailRow}>
                <Ionicons name="home" size={18} color={glassTokens.colors.text.primary} />
                <Text style={styles.detailText}>{item.listing.property_type}</Text>
              </View>
            )}
          </View>

          {item.listing.address_public && (
            <View style={styles.addressRow}>
              <Ionicons name="location" size={16} color={glassTokens.colors.text.primary} />
              <Text style={styles.addressText} numberOfLines={1}>{item.listing.address_public}</Text>
            </View>
          )}

          {item.listing.features && item.listing.features.length > 0 && (
            <View style={styles.featuresRow}>
              {item.listing.features.slice(0, 3).map((feature, idx) => (
                <View key={idx} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {item.listing.description && (
            <Text style={styles.description} numberOfLines={3}>
              {item.listing.description}
            </Text>
          )}

          {item.explanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>Why matched:</Text>
              <Text style={styles.explanationText}>{item.explanation}</Text>
            </View>
          )}

          {/* Media indicator */}
          {item.media && item.media.length > 1 && (
            <View style={styles.mediaIndicator}>
              <Ionicons name="images" size={16} color={glassTokens.colors.text.primary} />
              <Text style={styles.mediaCount}>
                {item.media.length} {item.media.some(m => m.type === 'video') ? 'media' : 'photos'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function BuyerFeedScreen() {
  const [cards, setCards] = useState<ListingCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedListingIds, setLoadedListingIds] = useState<Set<string>>(new Set());
  const [intentChecked, setIntentChecked] = useState(false); // Track if we've already checked for intent
  const { fetchFeed } = useFeed();
  const { createSwipe } = useSwipe();
  const { isMatched, addMatchedListing, refresh: refreshSwipes } = useUserSwipes();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Check if buyer has an intent on mount (only once)
  useEffect(() => {
    const checkIntent = async () => {
      if (!user || intentChecked) return;
      
      setIntentChecked(true); // Mark as checked to prevent loops
      
      const { data: intents, error } = await supabase
        .from('buyer_intents')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1); // Get the most recent intent
      
      if (error) {
        console.error('Error checking intent:', error);
        // Don't redirect on error, just load feed
        loadFeed();
        return;
      }
      
      if (!intents || intents.length === 0) {
        // No intent found, redirect to intent setup
        console.log('No intent found, redirecting to setup');
        router.replace('/(buyer)/intent-setup');
        return;
      }
      
      // Intent exists, load feed
      console.log('Intent found, loading feed');
      loadFeed();
    };
    
    if (user) {
      checkIntent();
    }
  }, [user]);

  // Load more listings when we're near the end
  useEffect(() => {
    if (currentIndex >= cards.length - 2 && hasMore && !loading && cards.length > 0) {
      loadMoreListings();
    }
  }, [currentIndex, cards.length, hasMore, loading]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      console.log('Loading feed...');
      const feedCards = await fetchFeed();
      console.log('Feed cards received:', feedCards?.length || 0);
      
      // Also fetch seller requests (listings where seller swiped yes on buyer's intent)
      const sellerRequests = await fetchSellerRequests();
      console.log('Seller requests received:', sellerRequests?.length || 0);
      
      // Combine: seller requests first, then regular feed
      const allCards = [...sellerRequests, ...(feedCards || [])];
      
      if (!allCards || allCards.length === 0) {
        console.log('No feed cards, setting hasMore to false');
        setHasMore(false);
        setCards([]);
        return;
      }

      // Process cards with media and match scores
      // Processing cards with media
      const cardsWithMedia = await processCardsWithMedia(allCards);
      // Processed cards
      const newIds = new Set(cardsWithMedia.map(c => c.listing.id));

      setCards(cardsWithMedia);
      setLoadedListingIds(newIds);
      setHasMore(feedCards.length > 0);
    } catch (error: any) {
      console.error('Error loading feed:', error);
      if (error.message?.includes('intent')) {
        router.replace('/(buyer)/intent-setup');
      } else {
        Alert.alert('Error', error.message || 'Failed to load feed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerRequests = async (): Promise<ListingCard[]> => {
    if (!user) return [];

    try {
      // Get buyer's active intent
      const { data: intent } = await supabase
        .from('buyer_intents')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!intent) return [];

      // Get sellers who swiped yes on buyer's intent
      const { data: sellerSwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('actor_id, target_id')
        .eq('target_type', 'buyer_intent')
        .eq('target_id', intent.id)
        .eq('direction', 'yes');

      if (swipesError || !sellerSwipes || sellerSwipes.length === 0) {
        return [];
      }

      const sellerIds = [...new Set(sellerSwipes.map(s => s.actor_id))];

      // Get listings from these sellers
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('seller_id', sellerIds)
        .eq('status', 'active')
        .eq('listing_verified', true);

      if (listingsError || !listings || listings.length === 0) {
        return [];
      }

      // Transform to ListingCard format with isRequest flag
      return listings.map(listing => ({
        listing: {
          id: listing.id,
          seller_id: listing.seller_id,
          title: listing.title,
          price: listing.price,
          beds: listing.beds,
          baths: listing.baths,
          sqft: listing.sqft,
          description: listing.description,
          address_public: listing.address_public,
          property_type: listing.property_type,
          features: listing.features,
          listing_number: listing.listing_number,
        },
        isRequest: true,
        match_score: 100, // High match score for requests
      })) as ListingCard[];
    } catch (error: any) {
      console.error('Error fetching seller requests:', error);
      return [];
    }
  };

  const loadMoreListings = async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const feedCards = await fetchFeed();
      
      if (feedCards.length === 0) {
        setHasMore(false);
        return;
      }

      // Filter out listings we already have
      const newCards = feedCards.filter(c => !loadedListingIds.has(c.listing.id));
      
      if (newCards.length === 0) {
        setHasMore(false);
        return;
      }

      // Process new cards with media and match scores
      const cardsWithMedia = await processCardsWithMedia(newCards);
      const newIds = new Set(cardsWithMedia.map(c => c.listing.id));
      
      setCards(prev => [...prev, ...cardsWithMedia]);
      setLoadedListingIds(prev => new Set([...prev, ...newIds]));
    } catch (error: any) {
      console.error('Failed to load more listings:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const processCardsWithMedia = async (feedCards: ListingCard[]) => {
    return Promise.all(
      feedCards.map(async (card) => {
        try {
          // Convert score (0-1) to match_score (0-100) if needed
          const matchScore = card.score !== undefined 
            ? Math.round(card.score * 100) 
            : card.match_score || 0;

          // Fetch media for listing - try from card.media first (from matchmake), then query
          let media: any[] = [];
          
          // Check if media is already in the card (from matchmake function)
          if (card.media && Array.isArray(card.media) && card.media.length > 0) {
            media = card.media;
            // Using media from matchmake
          } else {
            // Fallback: query listing_media table
            const { data: fetchedMedia, error: mediaError } = await supabase
              .from('listing_media')
              .select('*')
              .eq('listing_id', card.listing.id)
              .order('order_index', { ascending: true });

            if (mediaError) {
              console.error('Error fetching media for listing:', card.listing.id, mediaError);
            } else {
              media = fetchedMedia || [];
              // Fetched media from DB
            }
          }

          // Convert storage paths to asset URIs
          const mediaItems = (media || []).map((m: any) => {
            const storagePath = m.storage_path || m.uri || '';
            const mediaType = (m.media_type || m.type) as 'video' | 'image';
            const uri = getAssetUri(storagePath, mediaType);
            
            return {
              id: m.id || `media-${Math.random()}`,
              uri,
              type: mediaType,
              order_index: m.order_index || 0,
            };
          });

          // Listing media processed
          
          // If no media found, add a placeholder to ensure something displays
          if (mediaItems.length === 0) {
            // No media found, adding placeholder
            // Use a random placeholder image for variety
            const placeholderIndex = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
            mediaItems.push({
              id: `placeholder-${card.listing.id}`,
              uri: PLACEHOLDER_IMAGES[placeholderIndex],
              type: 'image' as const,
              order_index: 0,
            });
          }

          return {
            ...card,
            match_score: matchScore,
            media: mediaItems.length > 0 ? mediaItems : undefined,
          };
        } catch (error) {
          console.error('Failed to process card:', card.listing.id, error);
          return {
            ...card,
            match_score: card.score !== undefined ? Math.round(card.score * 100) : card.match_score || 0,
          };
        }
      })
    );
  };

  const handleSwipe = async (direction: 'yes' | 'no') => {
    if (currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log('Creating swipe:', {
        direction,
        listingId: currentCard.listing.id,
        target_type: 'listing',
      });

      const result = await createSwipe({
        target_type: 'listing',
        target_id: currentCard.listing.id,
        direction: direction === 'yes' ? 'yes' : 'no',
      });

      console.log('Swipe result:', JSON.stringify(result, null, 2));

      // Move to next card immediately
      handleSwipeComplete();

      // Handle different outcomes
      if (direction === 'yes') {
        if (result?.matched) {
          // Match created! Seller accepted the request
          console.log('🎉 Match created! Deal room ID:', result.deal_room_id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            'Match! 🎉',
            'The seller accepted your request! Check your Matches tab.',
            [
              {
                text: 'View Matches',
                onPress: () => router.push('/(buyer)/(tabs)/matches'),
              },
              { text: 'Continue', style: 'cancel' },
            ]
          );
          // Refresh to update matched listings
          refreshSwipes();
        } else if (result?.is_request) {
          // Request sent (waiting for seller to accept)
          console.log('✅ Request sent to seller');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Don't add to matched listings - it's just a request, not a match yet
        }
      }
    } catch (error: any) {
      console.error('Swipe error:', error);
      Alert.alert('Error', error.message || 'Failed to swipe');
    }
  };

  const handleSwipeComplete = () => {
    // Move to next card after animation completes
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      console.log(`Moving to next card: ${nextIndex} of ${cards.length}`);
      return nextIndex;
    });
  };

  const handleCardTap = () => {
    Alert.alert('Listing Detail', 'Open gallery or detail view');
  };

  const currentCard = cards[currentIndex];

  if (loading && cards.length === 0) {
    return (
      <ScreenBackground gradient>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <LiquidGlassCard 
            title="Loading..."
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
          >
            <Text style={styles.emptyText}>
              Fetching available properties...
            </Text>
          </LiquidGlassCard>
        </View>
      </ScreenBackground>
    );
  }

  if (cards.length === 0 && !loading) {
    return (
      <ScreenBackground gradient>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <LiquidGlassCard 
            title="No listings available"
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
          >
            <Text style={styles.emptyText}>
              {hasMore ? 'Check back later for new properties' : 'No properties match your criteria. Try adjusting your search preferences.'}
            </Text>
            <LiquidGlassButton
              label="Refresh"
              onPress={loadFeed}
              variant="primary"
              size="md"
              style={styles.refreshButton}
            />
          </LiquidGlassCard>
        </View>
      </ScreenBackground>
    );
  }

  if (!currentCard) {
    return (
      <ScreenBackground gradient>
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <LiquidGlassCard 
            title="You're all caught up!"
            cornerRadius={24}
            padding={24}
            elasticity={0.25}
          >
            <Text style={styles.emptyText}>
              You've seen all available listings. Check back later for more.
            </Text>
          </LiquidGlassCard>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground gradient>
      {/* Top Header Buttons */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 10 }]}>
        {/* Intent Change Button */}
        <TouchableOpacity
          onPress={() => router.push('/(buyer)/intent-setup')}
          style={styles.intentButton}
        >
          <Ionicons name="settings" size={18} color={glassTokens.colors.accent.primary} />
          <Text style={styles.intentButtonText}>Intent</Text>
        </TouchableOpacity>
        
        {/* Explore Button */}
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
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom, // Ensure content doesn't go under tab bar
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadFeed}
            tintColor={glassTokens.colors.accent.primary}
          />
        }
        scrollEnabled={true}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          {/* Current card */}
          <View style={[styles.cardContainer, { paddingTop: insets.top + 10, flex: 1 }]}>
            {currentCard && (
              <ListingCard
                item={currentCard}
                onTap={handleCardTap}
                isMatched={isMatched}
              />
            )}
          </View>

          {/* Action buttons */}
          <View style={[
            styles.actionButtons, 
            { 
              paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 10, // Add tab bar height + extra spacing
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
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    paddingBottom: glassTokens.spacing.sm,
  },
  intentButton: {
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
  intentButtonText: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.accent.primary,
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
    minHeight: 0, // Allow flex to shrink
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    ...glassTokens.shadow.large,
  },
  backgroundMedia: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: glassTokens.componentSpacing.cardPadding,
    paddingTop: glassTokens.spacing['3xl'],
    // Gradient overlay for text readability
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
  },
  matchIndicator: {
    position: 'absolute',
    top: glassTokens.spacing.md,
    right: glassTokens.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: glassTokens.spacing.sm,
  },
  cardTitle: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: glassTokens.typography.fontSize['2xl'] * 1.2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  listingNumber: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
    marginTop: glassTokens.spacing.xs,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sellerId: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
    marginTop: glassTokens.spacing.xs,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  requestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    backgroundColor: glassTokens.colors.accent.primary,
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.primary,
    marginTop: glassTokens.spacing.xs,
    alignSelf: 'flex-start',
  },
  requestBadgeText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: '#fff',
    fontWeight: glassTokens.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchBadge: {
    backgroundColor: `${glassTokens.colors.accent.success}20`,
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: glassTokens.colors.accent.success,
  },
  matchScore: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.accent.success,
    fontWeight: glassTokens.typography.fontWeight.bold,
  },
  cardPrice: {
    fontSize: glassTokens.typography.fontSize['4xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.md,
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: glassTokens.spacing.md,
    gap: glassTokens.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
  },
  detailText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.medium,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: glassTokens.spacing.xs,
    marginTop: glassTokens.spacing.sm,
  },
  featureTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  featureText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.medium,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    marginTop: glassTokens.spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
  },
  mediaCount: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.medium,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: glassTokens.spacing.md,
    gap: glassTokens.spacing.xs,
  },
  addressText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    flex: 1,
  },
  description: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.primary,
    lineHeight: glassTokens.typography.fontSize.sm * glassTokens.typography.lineHeight.relaxed,
    marginBottom: glassTokens.spacing.lg,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  explanationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 'auto',
  },
  explanationLabel: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    marginBottom: glassTokens.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  explanationText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.primary,
    lineHeight: glassTokens.typography.fontSize.sm * glassTokens.typography.lineHeight.normal,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: glassTokens.spacing.md,
    gap: glassTokens.spacing.md,
    marginTop: 'auto', // Push buttons to bottom
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
    marginBottom: glassTokens.spacing.lg,
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
  refreshButton: {
    marginTop: glassTokens.spacing.md,
  },
});
