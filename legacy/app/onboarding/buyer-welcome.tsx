// app/onboarding/buyer-welcome.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function BuyerWelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
        Welcome! Let's Get You Started
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 8 }}>
        Browse matched homes or explore listings nearby.
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 32 }}>
        Your agent will upload your home preferences. In the meantime, browse homes by price or location.
      </Text>

      <View style={{ gap: 16, marginBottom: 32 }}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
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
          <Text style={{ fontSize: 24, marginRight: 12 }}>🔗</Text>
          <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>
            Connect with My Agent
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
          <Text style={{ fontSize: 24, marginRight: 12 }}>📍</Text>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Browse by Location
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
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
          <Text style={{ fontSize: 24, marginRight: 12 }}>💬</Text>
          <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>
            Ask a Question
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 32 }}>
        <Text style={{ fontSize: 12, color: '#666666', textAlign: 'center' }}>
          Your matches will appear here once your agent sets your preferences.
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)')}
        style={{
          backgroundColor: '#6666ff',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
          Take Me to My Feed
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

