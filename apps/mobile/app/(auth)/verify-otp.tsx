import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppScreen } from '../../components/AppScreen';
import { GlassCard } from '../../components/GlassCard';
import { SectionHeader } from '../../components/SectionHeader';
import * as authApi from '../../lib/api/auth';
import { labelForPortal } from '../../lib/role';
import type { LoginPortal } from '../../lib/types/app';

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ portal?: string; email?: string; name?: string }>();
  const portal = (params.portal as LoginPortal) || 'client';
  const email = (params.email || '').trim();
  const name = (params.name || '').trim();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const submittedRef = useRef(false);

  async function onVerify(token = otp) {
    if (!email) {
      Alert.alert('Missing email', 'Please restart signup and enter your email again.');
      return;
    }
    if (token.length !== 6) return;

    try {
      submittedRef.current = true;
      setLoading(true);
      await authApi.verifyEmailOtp(email, token);
      router.replace('/');
    } catch (e: any) {
      submittedRef.current = false;
      Alert.alert('Invalid code', e.message ?? 'Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email) return;
    try {
      setResending(true);
      await authApi.requestSignupOtp({ email, displayName: name, portal });
      Alert.alert('OTP resent', 'Check your email for a new 6-digit code.');
    } catch (e: any) {
      Alert.alert('Failed to resend', e.message ?? 'Please try again.');
    } finally {
      setResending(false);
    }
  }

  useEffect(() => {
    if (otp.length === 6 && !submittedRef.current && !loading) {
      void onVerify(otp);
    }
  }, [otp, loading]);

  return (
    <AppScreen>
      <SectionHeader
        title={`${labelForPortal(portal)} OTP Verification`}
        subtitle="Enter the 6-digit code sent to your email"
      />
      <GlassCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: '#9CB5CA' }}>{email || 'No email provided'}</Text>
          <TextInput
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#E7F2FF',
              paddingVertical: 14,
              fontSize: 28,
              textAlign: 'center',
              letterSpacing: 10,
              fontWeight: '700',
            }}
            placeholder="000000"
            placeholderTextColor="#7A93AA"
          />
          <AppButton label="Verify OTP" onPress={() => onVerify()} loading={loading} />
          <AppButton label="Resend OTP" onPress={onResend} loading={resending} variant="secondary" />
        </View>
      </GlassCard>
    </AppScreen>
  );
}
