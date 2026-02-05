// Explore Screen - Map view with location-based filtering
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { glassTokens, LiquidGlassCard, ScreenBackground } from '../src/ui';

// Import MapView with fallback
let MapViewComponent: any = null;
let MarkerComponent: any = null;
let hasMaps = false;

try {
  const maps = require('react-native-maps');
  MapViewComponent = maps.default || maps.MapView;
  MarkerComponent = maps.Marker;
  hasMaps = !!(MapViewComponent && MarkerComponent);
  if (hasMaps) {
    console.log('✅ React Native Maps loaded successfully');
  }
} catch (e: any) {
  console.log('⚠️ react-native-maps not available, using list view fallback');
  console.log('   Error:', e?.message || 'Module not found');
  console.log('   This requires a development build. See MAPS_SETUP.md for instructions.');
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ExploreMode = 'buyers' | 'sellers' | 'agents';

interface LocationStats {
  buyers: number;
  sellers: number;
  agents: number;
  listings: number;
}

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  type: 'buyer' | 'seller' | 'listing';
  data?: any;
}

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  
  const [mode, setMode] = useState<ExploreMode>((params.mode as ExploreMode) || 'sellers');
  const [region, setRegion] = useState({
    latitude: 41.8781, // Chicago default
    longitude: -87.6298,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [listings, setListings] = useState<any[]>([]); // For list view fallback
  const [stats, setStats] = useState<LocationStats>({ buyers: 0, sellers: 0, agents: 0, listings: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  useEffect(() => {
    loadMapData();
  }, [mode]);

  const loadMapData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (mode === 'buyers') {
        // Load buyer intents with their areas
        const { data: buyerIntents, error } = await supabase
          .from('buyer_intents')
          .select(`
            id,
            buyer_id,
            budget_min,
            budget_max,
            areas,
            buyer:profiles!buyer_intents_buyer_id_fkey(
              id,
              display_name,
              buyer_verified
            )
          `)
          .eq('active', true)
          .eq('verified', true);

        if (error) {
          console.error('Error fetching buyer intents:', error);
          throw error;
        }

        // Extract locations from buyer intents
        const buyerMarkers: MapMarker[] = [];
        const uniqueBuyerIds = new Set<string>();
        
        buyerIntents?.forEach((intent: any) => {
          if (intent.buyer_id && !uniqueBuyerIds.has(intent.buyer_id)) {
            uniqueBuyerIds.add(intent.buyer_id);
          }
          
          if (intent.areas && Array.isArray(intent.areas)) {
            intent.areas.forEach((area: any) => {
              if (area.lat && area.lng) {
                buyerMarkers.push({
                  id: `${intent.id}-${area.name || 'area'}`,
                  latitude: area.lat,
                  longitude: area.lng,
                  title: intent.buyer?.display_name || 'Buyer',
                  type: 'buyer',
                  data: intent,
                });
              }
            });
          }
        });

        setMarkers(buyerMarkers);
        setStats({ buyers: uniqueBuyerIds.size, sellers: 0, agents: 0, listings: 0 });
      } else if (mode === 'sellers') {
        // Load listings, filtered by buyer intent if user is a buyer
        let query = supabase
          .from('listings')
          .select(`
            id,
            seller_id,
            title,
            price,
            lat,
            lng,
            address_public,
            beds,
            baths,
            property_type,
            status,
            seller:profiles!listings_seller_id_fkey(
              id,
              display_name,
              seller_verified
            )
          `)
          .eq('status', 'active')
          .not('lat', 'is', null)
          .not('lng', 'is', null);

        // If user is a buyer, filter by their intent
        if (profile?.role === 'buyer') {
          const { data: buyerIntent } = await supabase
            .from('buyer_intents')
            .select('*')
            .eq('buyer_id', user.id)
            .eq('active', true)
            .single();

          if (buyerIntent) {
            console.log('Filtering listings by buyer intent:', buyerIntent);
            if (buyerIntent.budget_min) {
              query = query.gte('price', buyerIntent.budget_min);
            }
            if (buyerIntent.budget_max) {
              query = query.lte('price', buyerIntent.budget_max);
            }
            if (buyerIntent.beds_min) {
              query = query.gte('beds', buyerIntent.beds_min);
            }
            if (buyerIntent.baths_min) {
              query = query.gte('baths', buyerIntent.baths_min);
            }
            if (buyerIntent.property_types && buyerIntent.property_types.length > 0) {
              query = query.in('property_type', buyerIntent.property_types);
            }
          }
        }

        const { data: listingsData, error } = await query;

        if (error) {
          console.error('Error fetching listings:', error);
          throw error;
        }

        console.log(`Found ${listingsData?.length || 0} listings matching criteria`);

        // Set listings for list view
        setListings(listingsData || []);

        // Create markers for map view
        const listingMarkers: MapMarker[] = (listingsData || [])
          .filter((listing: any) => listing.lat && listing.lng)
          .map((listing: any) => ({
            id: listing.id,
            latitude: listing.lat,
            longitude: listing.lng,
            title: listing.title,
            type: 'listing',
            data: listing,
          }));

        setMarkers(listingMarkers);
        setStats({ 
          buyers: 0, 
          sellers: listingsData?.length || 0, 
          agents: 0, 
          listings: listingsData?.length || 0 
        });
      } else if (mode === 'agents') {
        // Load agents - show all verified agents
        const { data: agents, error } = await supabase
          .from('profiles')
          .select('id, display_name, role')
          .in('role', ['buyer_agent', 'seller_agent'])
          .or('buyer_verified.eq.true,seller_verified.eq.true');

        if (error) {
          console.error('Error fetching agents:', error);
          throw error;
        }

        // For agents, we'll show them in the list view since we don't have location data
        // In a real implementation, you'd add lat/lng to profiles or use a separate locations table
        setMarkers([]);
        setListings(agents || []);
        setStats({ buyers: 0, sellers: 0, agents: agents?.length || 0, listings: 0 });
      }
    } catch (error: any) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = useCallback((newRegion: any) => {
    setRegion(newRegion);
  }, []);

  const handleMarkerPress = (marker: MapMarker) => {
    if (marker.type === 'listing') {
      router.push(`/(seller)/listing/${marker.id}`);
    } else if (marker.type === 'buyer') {
      // Show buyer details
      setSelectedArea(marker.title);
    }
  };

  const renderListingItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(seller)/listing/${item.id}`)}
      style={styles.listingItem}
    >
      <LiquidGlassCard cornerRadius={16} padding={16} style={styles.listingCard}>
        <View style={styles.listingHeader}>
          <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.listingPrice}>${item.price?.toLocaleString()}</Text>
        </View>
        {item.address_public && (
          <View style={styles.listingLocation}>
            <Ionicons name="location" size={14} color={glassTokens.colors.text.secondary} />
            <Text style={styles.listingAddress} numberOfLines={1}>{item.address_public}</Text>
          </View>
        )}
        <View style={styles.listingDetails}>
          <Text style={styles.listingDetail}>
            {item.beds} bed • {item.baths} bath
          </Text>
          {item.property_type && (
            <Text style={styles.listingDetail}>• {item.property_type}</Text>
          )}
        </View>
        {item.seller && (
          <Text style={styles.sellerName}>
            Seller: {item.seller.display_name}
          </Text>
        )}
      </LiquidGlassCard>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header with mode selector */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={glassTokens.colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.modeSelector}>
            <TouchableOpacity
              onPress={() => setMode('buyers')}
              style={[styles.modeButton, mode === 'buyers' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, mode === 'buyers' && styles.modeTextActive]}>
                Buyers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('sellers')}
              style={[styles.modeButton, mode === 'sellers' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, mode === 'sellers' && styles.modeTextActive]}>
                Sellers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('agents')}
              style={[styles.modeButton, mode === 'agents' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, mode === 'agents' && styles.modeTextActive]}>
                Agents
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Card */}
        <LiquidGlassCard
          cornerRadius={20}
          padding={16}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.buyers}</Text>
              <Text style={styles.statLabel}>Buyers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.sellers}</Text>
              <Text style={styles.statLabel}>Sellers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.agents}</Text>
              <Text style={styles.statLabel}>Agents</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.listings}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Map View or List View */}
        {hasMaps && MapViewComponent && MarkerComponent ? (
          <View style={styles.mapContainer}>
            <MapViewComponent
              style={styles.map}
              region={region}
              onRegionChangeComplete={handleRegionChange}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {markers.map((marker) => (
                <MarkerComponent
                  key={marker.id}
                  coordinate={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  }}
                  title={marker.title}
                  onPress={() => handleMarkerPress(marker)}
                >
                  <View style={[
                    styles.markerContainer,
                    marker.type === 'buyer' && styles.markerBuyer,
                    marker.type === 'seller' && styles.markerSeller,
                    marker.type === 'listing' && styles.markerListing,
                  ]}>
                    <Ionicons
                      name={
                        marker.type === 'buyer' ? 'person' :
                        marker.type === 'seller' ? 'home' :
                        'location'
                      }
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                </MarkerComponent>
              ))}
            </MapViewComponent>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={glassTokens.colors.accent.primary} />
                <Text style={styles.loadingText}>Loading {mode}...</Text>
              </View>
            ) : (mode === 'sellers' || mode === 'agents') && listings.length > 0 ? (
              <FlatList
                data={listings}
                renderItem={mode === 'sellers' ? renderListingItem : ({ item }: { item: any }) => (
                  <TouchableOpacity style={styles.listingItem}>
                    <LiquidGlassCard cornerRadius={16} padding={16} style={styles.listingCard}>
                      <View style={styles.listingHeader}>
                        <Text style={styles.listingTitle}>{item.display_name}</Text>
                        <Text style={styles.listingPrice}>{item.role}</Text>
                      </View>
                    </LiquidGlassCard>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : mode === 'buyers' && markers.length > 0 ? (
              <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
                {markers.map((marker, index) => (
                  <TouchableOpacity key={marker.id} style={styles.listingItem}>
                    <LiquidGlassCard cornerRadius={16} padding={16} style={styles.listingCard}>
                      <View style={styles.listingHeader}>
                        <Text style={styles.listingTitle}>{marker.title}</Text>
                        <Text style={styles.listingPrice}>
                          ${marker.data?.budget_min?.toLocaleString() || '0'} - ${marker.data?.budget_max?.toLocaleString() || '0'}
                        </Text>
                      </View>
                      {marker.data?.areas && (
                        <View style={styles.listingLocation}>
                          <Ionicons name="location" size={14} color={glassTokens.colors.text.secondary} />
                          <Text style={styles.listingAddress}>
                            {marker.data.areas.map((a: any) => a.name).join(', ')}
                          </Text>
                        </View>
                      )}
                    </LiquidGlassCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                {!hasMaps ? (
                  <>
                    <Ionicons name="map-outline" size={64} color={glassTokens.colors.text.tertiary} />
                    <Text style={styles.emptyText}>Map View Not Available</Text>
                    <Text style={styles.emptySubtext}>
                      react-native-maps requires a development build.{'\n'}
                      It doesn't work with Expo Go.
                    </Text>
                    <Text style={styles.emptySubtext}>
                      To enable maps:{'\n'}
                      1. Run: npx expo prebuild{'\n'}
                      2. Run: npx expo run:ios (or run:android){'\n'}
                      3. See MAPS_SETUP.md for details
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="map-outline" size={64} color={glassTokens.colors.text.tertiary} />
                    <Text style={styles.emptyText}>
                      {mode === 'sellers' 
                        ? 'No listings found matching your criteria'
                        : `No ${mode} found in this area`}
                    </Text>
                    <Text style={styles.emptySubtext}>
                      {mode === 'sellers' && profile?.role === 'buyer'
                        ? 'Try adjusting your buyer intent filters'
                        : 'Scroll the map or change location to see more'}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
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
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    paddingBottom: glassTokens.spacing.md,
    gap: glassTokens.spacing.md,
  },
  backButton: {
    padding: glassTokens.spacing.sm,
  },
  modeSelector: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: glassTokens.colors.background.glassMedium,
    borderRadius: glassTokens.radius.md,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: glassTokens.spacing.sm,
    paddingHorizontal: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.sm,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: glassTokens.colors.accent.primary,
  },
  modeText: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
  },
  modeTextActive: {
    color: '#FFFFFF',
    fontWeight: glassTokens.typography.fontWeight.bold,
  },
  statsCard: {
    marginHorizontal: glassTokens.componentSpacing.screenPadding,
    marginBottom: glassTokens.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.accent.primary,
    marginBottom: glassTokens.spacing.xs,
  },
  statLabel: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: glassTokens.componentSpacing.screenPadding,
    marginBottom: glassTokens.componentSpacing.screenPadding,
    borderRadius: glassTokens.radius.xl,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: glassTokens.colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerBuyer: {
    backgroundColor: glassTokens.colors.accent.secondary,
  },
  markerSeller: {
    backgroundColor: glassTokens.colors.accent.primary,
  },
  markerListing: {
    backgroundColor: glassTokens.colors.accent.tertiary,
  },
  listContainer: {
    flex: 1,
    marginHorizontal: glassTokens.componentSpacing.screenPadding,
    marginBottom: glassTokens.componentSpacing.screenPadding,
  },
  listContent: {
    paddingBottom: glassTokens.spacing.md,
    gap: glassTokens.spacing.md,
  },
  listingItem: {
    marginBottom: glassTokens.spacing.md,
  },
  listingCard: {
    width: '100%',
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.sm,
  },
  listingTitle: {
    flex: 1,
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginRight: glassTokens.spacing.sm,
  },
  listingPrice: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.accent.primary,
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
    marginBottom: glassTokens.spacing.sm,
  },
  listingAddress: {
    flex: 1,
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
  },
  listingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: glassTokens.spacing.xs,
  },
  listingDetail: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
  },
  sellerName: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.tertiary,
    marginTop: glassTokens.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: glassTokens.spacing['4xl'],
  },
  loadingText: {
    marginTop: glassTokens.spacing.md,
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: glassTokens.spacing['4xl'],
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
  },
  emptyText: {
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginTop: glassTokens.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    marginTop: glassTokens.spacing.sm,
    textAlign: 'center',
  },
});
