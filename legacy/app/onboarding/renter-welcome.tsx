// app/onboarding/renter-welcome.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function RenterWelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
        Welcome, Renter!
      </Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
        Let's Help You Find a Place to Call Home
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 32 }}>
        Set your rental preferences, browse listings, and connect with agents or landlords.
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
          Budget & Preferred Area(s)
        </Text>
        <View style={{ backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 8 }}>
          <Text style={{ color: '#666666', fontSize: 14 }}>
            Selected budget range: $1,200 - $2,000/month
          </Text>
        </View>
        <View style={{ backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16 }}>
          <Text style={{ color: '#666666', fontSize: 14 }}>
            Preferred neighborhoods: Downtown, Midtown
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
          Move-in Date
        </Text>
        <View style={{ backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16 }}>
          <Text style={{ color: '#666666', fontSize: 14 }}>
            Estimated move-in: October 2023
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
          Saved Rentals
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#e0e0e0',
                borderRadius: 12,
              }}
            />
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#f0f0ff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: '#6666ff', fontSize: 14, textAlign: 'center' }}>
          Looking to buy instead? Upgrade your profile anytime.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#6666ff',
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
            Upgrade to Buyer
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12, marginBottom: 32 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#6666ff',
            borderRadius: 12,
            padding: 16,
            backgroundColor: '#ffffff',
          }}
        >
          <Text style={{ fontSize: 20, marginRight: 12 }}>✏️</Text>
          <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>
            Edit Rental Preferences
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#6666ff',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, marginRight: 12 }}>⬆️</Text>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Upgrade to Buyer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#6666ff',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, marginRight: 12 }}>📞</Text>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Contact an Agent or Landlord
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

