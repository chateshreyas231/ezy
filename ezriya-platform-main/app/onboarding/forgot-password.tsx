// app/onboarding/forgot-password.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleSendResetLink = () => {
    // TODO: Implement send reset link logic
  };

  const handleVerify = () => {
    // TODO: Implement verification logic
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ backgroundColor: '#6666ff', padding: 20, paddingTop: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color: '#ffffff', marginRight: 8 }}>🏢</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>
              OMNI Real Estate
            </Text>
          </View>
        </View>

        <View style={{ padding: 24 }}>
          {/* Forgot Password Section */}
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
            Forgot Password
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 24 }}>
            Enter your registered email address to receive a password reset link.
          </Text>

          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#9aa0a6"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e0e0e0',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: '#000000',
              marginBottom: 24,
            }}
          />

          <TouchableOpacity
            onPress={handleSendResetLink}
            style={{
              backgroundColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 48,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Send Reset Link</Text>
          </TouchableOpacity>

          {/* Verification Section */}
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 12 }}>
            Verification
          </Text>
          <Text style={{ fontSize: 14, color: '#666666', marginBottom: 24 }}>
            Enter the verification code sent to your email or phone.
          </Text>

          <TextInput
            placeholder="Verification Code"
            placeholderTextColor="#9aa0a6"
            value={verificationCode}
            onChangeText={setVerificationCode}
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e0e0e0',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: '#000000',
              marginBottom: 24,
            }}
          />

          <TouchableOpacity
            onPress={handleVerify}
            style={{
              backgroundColor: '#6666ff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 48,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Verify</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ backgroundColor: '#6666ff', padding: 20 }}>
          <Text style={{ color: '#ffffff', fontSize: 12, textAlign: 'center' }}>
            © 2025 Omnipotent Real Estate LLC. Ezriya™. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

