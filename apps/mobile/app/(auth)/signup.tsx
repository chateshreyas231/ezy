import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppScreen } from '../../components/AppScreen';
import { GlassCard } from '../../components/GlassCard';
import { SectionHeader } from '../../components/SectionHeader';
import { TextInputField } from '../../components/TextInputField';
import * as authApi from '../../lib/api/auth';
import { labelForPortal } from '../../lib/role';
import type { LoginPortal } from '../../lib/types/app';

export default function SignupScreen() {
  const params = useLocalSearchParams<{ portal?: string }>();
  const portal = (params.portal as LoginPortal) || 'client';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Enter your display name.');
      return;
    }

    try {
      setLoading(true);
      await authApi.requestSignupOtp({
        email: email.trim(),
        displayName: name.trim(),
        portal,
      });
      Alert.alert('OTP sent', 'Enter the 6-digit code sent to your email.');
      router.replace({
        pathname: '/(auth)/verify-otp',
        params: { portal, email: email.trim(), name: name.trim() },
      });
    } catch (e: any) {
      Alert.alert('Signup failed', e.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <SectionHeader title={`Create ${labelForPortal(portal)} account`} subtitle="Set up secure access" />
      <GlassCard>
        <View style={{ gap: 12 }}>
          <TextInputField label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <TextInputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
          />
          <AppButton label="Send 6-digit OTP" onPress={onSubmit} loading={loading} />
        </View>
      </GlassCard>
    </AppScreen>
  );
}
