// app/onboarding/landlord-welcome.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LandlordWelcomeScreen() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [leaseLength, setLeaseLength] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [depositInfo, setDepositInfo] = useState('');
  const [contactMethod, setContactMethod] = useState<string | null>(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#6666ff', padding: 24, paddingTop: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 8 }}>
          Welcome, Landlord! Let's List Your Property
        </Text>
        <Text style={{ fontSize: 14, color: '#ffffff', textAlign: 'center' }}>
          Upload your rental, manage interest, and connect with qualified renters and agents.
        </Text>
      </View>

      <View style={{ padding: 24 }}>
        {/* Rental Property Details */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 16 }}>
          Rental Property Details
        </Text>

        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Address"
            placeholderTextColor="#9aa0a6"
            value={address}
            onChangeText={setAddress}
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

        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Unit # (if applicable)"
            placeholderTextColor="#9aa0a6"
            value={unitNumber}
            onChangeText={setUnitNumber}
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

        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Bedrooms / Bathrooms"
            placeholderTextColor="#9aa0a6"
            value={`${bedrooms} / ${bathrooms}`}
            onChangeText={(text) => {
              const parts = text.split(' / ');
              setBedrooms(parts[0] || '');
              setBathrooms(parts[1] || '');
            }}
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
            placeholder="Square Footage"
            placeholderTextColor="#9aa0a6"
            value={squareFootage}
            onChangeText={setSquareFootage}
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

        {/* Upload Property Photos */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 16 }}>
          Upload Property Photos
        </Text>

        <TouchableOpacity
          style={{
            borderWidth: 2,
            borderColor: '#6666ff',
            borderStyle: 'dashed',
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            marginBottom: 24,
            backgroundColor: '#f8f9fa',
          }}
        >
          <Text style={{ color: '#666666', fontSize: 14, marginBottom: 12 }}>
            Drag & Drop or Upload Multiple Images
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#6666ff',
              borderRadius: 12,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Upload Photos</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Lease Terms */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 16 }}>
          Lease Terms
        </Text>

        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Lease Length"
            placeholderTextColor="#9aa0a6"
            value={leaseLength}
            onChangeText={setLeaseLength}
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

        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Move-in Date"
            placeholderTextColor="#9aa0a6"
            value={moveInDate}
            onChangeText={setMoveInDate}
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
            placeholder="Deposit Info"
            placeholderTextColor="#9aa0a6"
            value={depositInfo}
            onChangeText={setDepositInfo}
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

        {/* Contact Method */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 16 }}>
          Contact Method
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
          {['Call', 'Email', 'Contact via Agent Only'].map((method) => (
            <TouchableOpacity
              key={method}
              onPress={() => setContactMethod(method)}
              style={{
                flex: 1,
                backgroundColor: contactMethod === method ? '#6666ff' : '#ffffff',
                borderWidth: 1,
                borderColor: contactMethod === method ? '#6666ff' : '#e0e0e0',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: contactMethod === method ? '#ffffff' : '#000000',
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 32 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>🏠</Text>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Post Another Rental
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>✏️</Text>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Edit My Listing
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={{
              backgroundColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>🤝</Text>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Connect with Agent or Property Manager
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

