// app/onboarding/lender-welcome.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LenderWelcomeScreen() {
  const router = useRouter();
  const [nmlsNumber, setNmlsNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [loanTypes, setLoanTypes] = useState('');
  const [statesLicensed, setStatesLicensed] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');

  const handleCompleteSetup = () => {
    // TODO: Save lender data
    router.push('/(tabs)');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 8 }}>
        Welcome, Lender!
      </Text>
      <Text style={{ fontSize: 16, color: '#666666', marginBottom: 32 }}>
        Let's get you verified and ready to connect with buyers and agents.
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 12 }}>
          Upload Lending License or NMLS Document
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
          NMLS License Number
        </Text>
        <TextInput
          placeholder="Enter your NMLS License Number"
          placeholderTextColor="#9aa0a6"
          value={nmlsNumber}
          onChangeText={setNmlsNumber}
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
          Company or Brokerage Name
        </Text>
        <TextInput
          placeholder="Enter your Company or Brokerage Name"
          placeholderTextColor="#9aa0a6"
          value={companyName}
          onChangeText={setCompanyName}
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
          placeholder="Enter your Office Location"
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
          Loan Types Offered
        </Text>
        <TextInput
          placeholder="Select Loan Types or Add Tags"
          placeholderTextColor="#9aa0a6"
          value={loanTypes}
          onChangeText={setLoanTypes}
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
          States You're Licensed In
        </Text>
        <TextInput
          placeholder="Select States"
          placeholderTextColor="#9aa0a6"
          value={statesLicensed}
          onChangeText={setStatesLicensed}
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

