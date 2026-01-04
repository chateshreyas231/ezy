// app/onboarding/investor-welcome.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function InvestorWelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
        Welcome, Investor!{'\n'}Let's Find Your Next Deal
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 8 }}>
        Explore investment opportunities, connect with deal sources, and grow your portfolio.
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 32 }}>
        Your agent or seller contact will upload deals based on your criteria. In the meantime, browse markets or ask questions to get started.
      </Text>

      <View style={{ gap: 16, marginBottom: 32 }}>
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
          <Text style={{ fontSize: 24, marginRight: 12 }}>💼</Text>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Connect with an Agent or Deal Source
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
            Browse by Market
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
          <Text style={{ fontSize: 24, marginRight: 12 }}>💬</Text>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Ask a Question About a Deal
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 32 }}>
        <Text style={{ fontSize: 12, color: '#666666', textAlign: 'center' }}>
          Your matched deals will appear here once your preferences are set.
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

