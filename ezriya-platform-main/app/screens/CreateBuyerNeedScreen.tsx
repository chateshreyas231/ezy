// app/screens/CreateBuyerNeedScreen.tsx
// Form for creating buyer need posts
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { createBuyerNeedPost } from '../../services/postsService';
import type { CreateBuyerNeedInput } from '../../src/types/types';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const PROPERTY_TYPES = [
  'Single Family',
  'Condo',
  'Townhouse',
  'Multi-Unit',
  'Commercial',
  'Land',
];

export default function CreateBuyerNeedScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState(user?.state ?? '');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [radiusMiles, setRadiusMiles] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');

  const handleSubmit = async () => {
    if (!state) {
      Alert.alert('Error', 'Please select a state');
      return;
    }

    if (!priceMin || !priceMax) {
      Alert.alert('Error', 'Please enter price range');
      return;
    }

    try {
      setSaving(true);

      const input: CreateBuyerNeedInput = {
        state,
        city: city || undefined,
        zip: zip || undefined,
        radius_miles: radiusMiles ? parseInt(radiusMiles) : undefined,
        price_min: parseFloat(priceMin),
        price_max: parseFloat(priceMax),
        property_type: propertyType || undefined,
        beds: beds ? parseInt(beds) : undefined,
        baths: baths ? parseFloat(baths) : undefined,
      };

      await createBuyerNeedPost(input);
      Alert.alert('Success', 'Buyer need post created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create buyer need post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
        Create Buyer Need Post
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>State *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {US_STATES.map((s) => (
            <Button
              key={s}
              title={s}
              onPress={() => setState(s)}
              color={state === s ? '#007AFF' : '#ccc'}
            />
          ))}
        </ScrollView>
        <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Selected: {state || 'None'}</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="City"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>ZIP Code</Text>
        <TextInput
          value={zip}
          onChangeText={setZip}
          placeholder="ZIP Code"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Radius (miles)</Text>
        <TextInput
          value={radiusMiles}
          onChangeText={setRadiusMiles}
          placeholder="Search radius in miles"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Price Range *</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={priceMin}
            onChangeText={setPriceMin}
            placeholder="Min"
            keyboardType="numeric"
            style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
          />
          <TextInput
            value={priceMax}
            onChangeText={setPriceMax}
            placeholder="Max"
            keyboardType="numeric"
            style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
          />
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Property Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROPERTY_TYPES.map((pt) => (
            <Button
              key={pt}
              title={pt}
              onPress={() => setPropertyType(pt)}
              color={propertyType === pt ? '#007AFF' : '#ccc'}
            />
          ))}
        </ScrollView>
        <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Selected: {propertyType || 'None'}</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Beds</Text>
        <TextInput
          value={beds}
          onChangeText={setBeds}
          placeholder="Number of bedrooms"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Baths</Text>
        <TextInput
          value={baths}
          onChangeText={setBaths}
          placeholder="Number of bathrooms"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <Button
        title={saving ? 'Creating...' : 'Create Post'}
        onPress={handleSubmit}
        disabled={saving}
      />
    </ScrollView>
  );
}

