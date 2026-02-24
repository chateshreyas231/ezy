import { useLocalSearchParams } from 'expo-router';
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

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ portal?: string }>();
  const portal = (params.portal as LoginPortal) || 'client';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      setLoading(true);
      await authApi.sendPasswordReset(email.trim());
      Alert.alert('Reset sent', 'Check your inbox for a password reset link.');
    } catch (e: any) {
      Alert.alert('Failed', e.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <SectionHeader
        title={`${labelForPortal(portal)} password reset`}
        subtitle="We will send a secure reset link"
      />
      <GlassCard>
        <View style={{ gap: 12 }}>
          <TextInputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
          />
          <AppButton label="Send reset link" onPress={onSubmit} loading={loading} />
        </View>
      </GlassCard>
    </AppScreen>
  );
}
