import { Link, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppScreen } from '../../components/AppScreen';
import { GlassCard } from '../../components/GlassCard';
import { SectionHeader } from '../../components/SectionHeader';
import { TextInputField } from '../../components/TextInputField';
import { colors } from '../../constants/theme';
import * as authApi from '../../lib/api/auth';
import { labelForPortal } from '../../lib/role';
import type { LoginPortal } from '../../lib/types/app';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ portal?: string }>();
  const portal = (params.portal as LoginPortal) || 'client';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => `${labelForPortal(portal)} Login`, [portal]);

  async function onSubmit() {
    try {
      setLoading(true);
      await authApi.signIn(email.trim(), password, portal);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Login failed', e.message ?? 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <SectionHeader title={title} subtitle="Secure access to your Ezriya workspace" />
      <GlassCard>
        <View style={styles.form}>
          <TextInputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
          />
          <TextInputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <AppButton label="Log In" onPress={onSubmit} loading={loading} />
          <Link href={{ pathname: '/(auth)/forgot-password', params: { portal } }} style={styles.link}>
            Forgot password?
          </Link>
          <Text style={styles.subtle}>
            New here?{' '}
            <Link href={{ pathname: '/(auth)/signup', params: { portal } }} style={styles.linkInline}>
              Register with OTP
            </Link>
          </Text>
        </View>
      </GlassCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  link: { color: colors.primary, fontWeight: '600', textAlign: 'right' },
  linkInline: { color: colors.primary, fontWeight: '700' },
  subtle: { color: colors.textMuted, textAlign: 'center' },
});
