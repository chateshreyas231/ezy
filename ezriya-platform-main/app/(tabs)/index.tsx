// app/(tabs)/index.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllListingPosts } from '../../services/postsService';
import type { ListingPost } from '../../src/types/types';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [listings, setListings] = useState<ListingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Active' | 'Open House' | 'Closed'>('Active');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await getAllListingPosts();
      setListings(data);
    } catch (error: any) {
      console.warn('Failed to load feed:', error.message || 'Network request failed');
      // Use mock data for development
      setListings([
        {
          id: '1',
          agent_id: 'agent1',
          state: 'CA',
          address: '123 Main St',
          city: 'San Francisco',
          zip: '94102',
          list_price: 450000,
          property_type: 'Single Family',
          beds: 3,
          baths: 2,
          features: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          agent_id: 'agent2',
          state: 'NY',
          address: '456 Park Ave',
          city: 'New York',
          zip: '10001',
          list_price: 300000,
          property_type: 'Condo',
          beds: 2,
          baths: 1,
          features: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          agent_id: 'agent3',
          state: 'TN',
          address: '789 Oak Blvd',
          city: 'Nashville',
          zip: '37203',
          list_price: 700000,
          property_type: 'Single Family',
          beds: 4,
          baths: 3,
          features: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderPropertyCard = ({ item, index }: { item: ListingPost; index: number }) => {
    const location = [item.city, item.state].filter(Boolean).join(', ') || item.state || 'Location TBD';
    const propertyDetails = [
      item.beds && `${item.beds} Bed${item.beds > 1 ? 's' : ''}`,
      item.baths && `${item.baths} Bath${item.baths > 1 ? 's' : ''}`,
      item.property_type,
    ]
      .filter(Boolean)
      .join(' • ');

    return (
      <View
        style={{
          width,
          height: height - 100, // Account for tab bar
          backgroundColor: '#ffffff',
        }}
      >
        {/* Property Image */}
        <View
          style={{
            width: '100%',
            height: '70%',
            backgroundColor: '#e0e0e0',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 48 }}>🏠</Text>
          <Text style={{ color: '#666666', marginTop: 8 }}>Property Image</Text>
        </View>

        {/* Property Details Overlay */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          {/* Price */}
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
            {formatPrice(item.list_price)}
          </Text>

          {/* Location */}
          <Text style={{ fontSize: 16, color: '#666666', marginBottom: 4 }}>{location}</Text>

          {/* Property Details */}
          {propertyDetails && (
            <Text style={{ fontSize: 14, color: '#666666', marginBottom: 16 }}>
              {propertyDetails}
            </Text>
          )}

          {/* Address */}
          {item.address && (
            <Text style={{ fontSize: 14, color: '#666666', marginBottom: 20 }}>
              {item.address}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push(`/offers/${item.id}`)}
              style={{
                flex: 1,
                backgroundColor: '#6666ff',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Make Offer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/offers/${item.id}`)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#6666ff',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side Action Icons */}
        <View
          style={{
            position: 'absolute',
            right: 16,
            bottom: 200,
            alignItems: 'center',
            gap: 24,
          }}
        >
          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 24 }}>❤️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 24 }}>💬</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 24 }}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6666ff" />
        <Text style={{ marginTop: 16, color: '#666666' }}>Loading properties...</Text>
      </SafeAreaView>
    );
  }

  if (listings.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 12, textAlign: 'center' }}>
          No Properties Found
        </Text>
        <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 24 }}>
          Start by creating a listing or check back later for new properties.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/screens/CreateListingScreen')}
          style={{
            backgroundColor: '#6666ff',
            borderRadius: 12,
            padding: 16,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Create Listing</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Search Bar and Tabs */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 16,
        }}
      >
        {/* Search Bar */}
        <TextInput
          placeholder="Search Listing by address or keyword"
          placeholderTextColor="#9aa0a6"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 12,
            padding: 12,
            fontSize: 14,
            color: '#000000',
            marginBottom: 12,
          }}
        />

        {/* Segmented Control */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Active', 'Open House', 'Closed'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                backgroundColor: activeTab === tab ? '#6666ff' : '#f5f5f5',
                borderRadius: 8,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? '#ffffff' : '#666666',
                  fontSize: 14,
                  fontWeight: activeTab === tab ? '600' : '400',
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={listings}
        renderItem={renderPropertyCard}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height - 100}
        decelerationRate="fast"
        contentContainerStyle={{ paddingTop: 120 }} // Space for search bar and tabs
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / (height - 100));
          setCurrentIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: height - 100,
          offset: (height - 100) * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}
