// app/onboarding/guest-browse.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GuestBrowseScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setCheckedIn(true);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
        You're Browsing as a Guest
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 32 }}>
        Explore listings and register at open houses — no profile needed.
      </Text>

      {/* Feed Preview */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000', marginBottom: 16 }}>
        Feed Preview
      </Text>

      {/* Sample Listing 1 */}
      <View style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' }}>
        <View style={{ height: 200, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center', padding: 16 }}>
            Create a profile to unlock matches & connect with agents.
          </Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
            $450,000
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 4 }}>
            Downtown, San Francisco
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 4 }}>
            3 Beds, 2 Baths, 1,500 Sqft
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 4 }}>
            Agent: John Smith
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 16 }}>
            Matches: 5
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#6666ff',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Offer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#6666ff',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sample Listing 2 */}
      <View style={{ marginBottom: 32, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' }}>
        <View style={{ height: 200, backgroundColor: '#e0e0e0' }} />
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
            $300,000
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 4 }}>
            Midtown, New York City
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 4 }}>
            2 Beds, 1 Bath, 900 Sqft
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 4 }}>
            Agent: Sarah Connor
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 16 }}>
            Matches: 3
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#6666ff',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Offer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#6666ff',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Open House Check-In */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000', marginBottom: 16 }}>
        Open House Check-In
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#6666ff',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Scan QR Code</Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 16 }}>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#9aa0a6"
          value={name}
          onChangeText={setName}
          style={{
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#e0e0e0',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: '#000000',
          }}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <TextInput
          placeholder="Email or Phone (One required)"
          placeholderTextColor="#9aa0a6"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="email-address"
          style={{
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#e0e0e0',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: '#000000',
          }}
        />
      </View>

      <TouchableOpacity
        onPress={handleCheckIn}
        style={{
          backgroundColor: '#6666ff',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Check In Now</Text>
      </TouchableOpacity>

      {checkedIn && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>✅</Text>
          <Text style={{ color: '#666666', fontSize: 14 }}>
            You're checked in! The listing agent will reach out if needed.
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => router.push('/auth/signup')}
        style={{
          borderWidth: 1,
          borderColor: '#6666ff',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>
          Create Full Profile
        </Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32 }}>
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={{ color: '#6666ff', fontSize: 14 }}>Create Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={{ color: '#6666ff', fontSize: 14 }}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/onboarding/role-selection')}>
          <Text style={{ color: '#6666ff', fontSize: 14 }}>Learn How EZRIYA Works</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

