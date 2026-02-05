// app/onboarding/agent-welcome.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AgentWelcomeScreen() {
  const router = useRouter();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [specialty, setSpecialty] = useState('Residential');
  const [yearsExperience, setYearsExperience] = useState('');

  const handleCompleteSetup = () => {
    // TODO: Save agent data
    router.push('/(tabs)');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
        Welcome, Agent!
      </Text>
      <Text style={{ fontSize: 16, color: '#666666', marginBottom: 32 }}>
        Let's get you verified and set up.
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 12 }}>
          Upload Real Estate License
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 2,
            borderColor: '#6666ff',
            borderStyle: 'dashed',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
          }}
        >
          <Text style={{ color: '#6666ff', fontSize: 16, fontWeight: '600' }}>Upload File</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 }}>
          License Number
        </Text>
        <TextInput
          placeholder="Enter license number"
          placeholderTextColor="#9aa0a6"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
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
          Office Location (City, State)
        </Text>
        <TextInput
          placeholder="Enter office location"
          placeholderTextColor="#9aa0a6"
          value={officeLocation}
          onChangeText={setOfficeLocation}
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
          Select Specialties
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => setSpecialty('Residential')}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: specialty === 'Residential' ? '#6666ff' : '#e0e0e0',
              borderRadius: 12,
              padding: 16,
              backgroundColor: specialty === 'Residential' ? '#f0f0ff' : '#ffffff',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: specialty === 'Residential' ? '#6666ff' : '#000000', fontWeight: '600' }}>
              Residential
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSpecialty('Commercial')}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: specialty === 'Commercial' ? '#6666ff' : '#e0e0e0',
              borderRadius: 12,
              padding: 16,
              backgroundColor: specialty === 'Commercial' ? '#f0f0ff' : '#ffffff',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: specialty === 'Commercial' ? '#6666ff' : '#000000', fontWeight: '600' }}>
              Commercial
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 }}>
          Years of Experience
        </Text>
        <TextInput
          placeholder="Enter years of experience"
          placeholderTextColor="#9aa0a6"
          value={yearsExperience}
          onChangeText={setYearsExperience}
          keyboardType="numeric"
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
        onPress={handleCompleteSetup}
        style={{
          backgroundColor: '#6666ff',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Complete Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

