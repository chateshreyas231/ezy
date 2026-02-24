import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppScreen } from '../../components/AppScreen';
import { GlassCard } from '../../components/GlassCard';
import { SectionHeader } from '../../components/SectionHeader';
import { TextInputField } from '../../components/TextInputField';
import * as authApi from '../../lib/api/auth';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await authApi.updatePassword(password);
      Alert.alert('Updated', 'Password updated successfully.');
      router.replace('/(auth)/select-role');
    } catch (e: any) {
      Alert.alert('Failed', e.message ?? 'Could not update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen>
      <SectionHeader title="Set new password" subtitle="Use a strong password you have not used before" />
      <GlassCard>
        <View style={{ gap: 12 }}>
          <TextInputField
            label="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInputField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
          <AppButton label="Update password" onPress={onSubmit} loading={loading} />
        </View>
      </GlassCard>
    </AppScreen>
  );
}
