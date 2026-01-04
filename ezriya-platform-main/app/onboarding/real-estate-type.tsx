// app/onboarding/real-estate-type.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function RealEstateTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', textAlign: 'center', marginTop: 40, marginBottom: 12 }}>
        What type of real estate are you focused on?
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 48 }}>
        Choose the type of properties you're working with. You can update this later in your settings.
      </Text>

      <View style={{ gap: 24, marginBottom: 48 }}>
        <TouchableOpacity
          onPress={() => setSelectedType('residential')}
          style={{
            borderWidth: 2,
            borderColor: selectedType === 'residential' ? '#6666ff' : '#e0e0e0',
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            backgroundColor: selectedType === 'residential' ? '#f0f0ff' : '#ffffff',
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🏠</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000' }}>Residential</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedType('commercial')}
          style={{
            borderWidth: 2,
            borderColor: selectedType === 'commercial' ? '#6666ff' : '#e0e0e0',
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            backgroundColor: selectedType === 'commercial' ? '#f0f0ff' : '#ffffff',
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🏢</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000' }}>Commercial</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)')}
        disabled={!selectedType}
        style={{
          backgroundColor: selectedType ? '#6666ff' : '#cccccc',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

