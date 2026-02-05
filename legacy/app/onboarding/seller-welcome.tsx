// app/onboarding/seller-welcome.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SellerWelcomeScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
        Ready to Sell? Let's Get Started.
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 32 }}>
        You can list your property yourself or work with an agent through EZRIYA.
      </Text>

      <View style={{ gap: 16, marginBottom: 32 }}>
        <TouchableOpacity
          onPress={() => setSelectedOption('self')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: selectedOption === 'self' ? '#6666ff' : '#e0e0e0',
            borderRadius: 12,
            padding: 16,
            backgroundColor: selectedOption === 'self' ? '#f0f0ff' : '#ffffff',
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: selectedOption === 'self' ? '#6666ff' : '#e0e0e0',
              backgroundColor: selectedOption === 'self' ? '#6666ff' : '#ffffff',
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedOption === 'self' && (
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                }}
              />
            )}
          </View>
          <Text style={{ color: '#000000', fontSize: 16 }}>Upload My Property Myself</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedOption('agent')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: selectedOption === 'agent' ? '#6666ff' : '#e0e0e0',
            borderRadius: 12,
            padding: 16,
            backgroundColor: selectedOption === 'agent' ? '#f0f0ff' : '#ffffff',
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: selectedOption === 'agent' ? '#6666ff' : '#e0e0e0',
              backgroundColor: selectedOption === 'agent' ? '#6666ff' : '#ffffff',
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedOption === 'agent' && (
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                }}
              />
            )}
          </View>
          <Text style={{ color: '#000000', fontSize: 16 }}>Connect with a Real Estate Agent</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: '#000000', marginBottom: 16 }}>
          I agree to EZRIYA Terms & Conditions for Independent Sellers.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>View Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{
              flex: 1,
              backgroundColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{ fontSize: 12, color: '#666666', textAlign: 'center', marginBottom: 32 }}>
        Want professional help pricing, marketing, or negotiating? EZRIYA agents can assist you every step of the way.
      </Text>
    </ScrollView>
  );
}

