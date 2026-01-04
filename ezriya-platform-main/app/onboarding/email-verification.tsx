// app/onboarding/email-verification.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleVerify = () => {
    // TODO: Implement verification logic
    router.push('/(tabs)');
  };

  const handleResend = () => {
    // TODO: Implement resend logic
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, color: '#6666ff' }}>🏠</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6666ff', marginLeft: 8 }}>
              EZRIYA
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', textAlign: 'center', marginBottom: 16 }}>
          Verify Your Email
        </Text>

        <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 32 }}>
          Please enter the verification code sent to your email address.
        </Text>

        <TextInput
          placeholder="Verification Code"
          placeholderTextColor="#9aa0a6"
          value={code}
          onChangeText={setCode}
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
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Verify Email</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666666', fontSize: 14 }}>Didn't receive the email? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={{ color: '#6666ff', fontSize: 14, fontWeight: '600' }}>Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

