// app/onboarding/contractor-welcome.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ContractorWelcomeScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [services, setServices] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
        Welcome! Let's Set Up Your Business Profile.
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', marginBottom: 32 }}>
        Showcase your services, connect with agents or sellers, and get discovered for upcoming projects.
      </Text>

      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 }}>
            Business Name
          </Text>
          <TextInput
            placeholder="Enter your business name"
            placeholderTextColor="#9aa0a6"
            value={businessName}
            onChangeText={setBusinessName}
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 }}>
            Upload Business Logo
          </Text>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>Upload File</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 }}>
            Select Your Services
          </Text>
          <TextInput
            placeholder="Electrician, Photographer, General Contractor, Inspector, Landscaper, Stager"
            placeholderTextColor="#9aa0a6"
            value={services}
            onChangeText={setServices}
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 }}>
            Area You Serve (City, State, or Regions)
          </Text>
          <TextInput
            placeholder="Enter areas you serve"
            placeholderTextColor="#9aa0a6"
            value={serviceArea}
            onChangeText={setServiceArea}
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
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 }}>
            Upload Past Work (Optional)
          </Text>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>Upload Images</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 8,
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={{ gap: 12, marginBottom: 32 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#6666ff',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#6666ff',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
            Upload More Work
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={{
            backgroundColor: '#6666ff',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
            Connect with Agent or Seller
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

