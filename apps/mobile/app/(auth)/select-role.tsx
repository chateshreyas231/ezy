import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppScreen } from '../../components/AppScreen';
import { GlassCard } from '../../components/GlassCard';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../constants/theme';
import type { LoginPortal } from '../../lib/types/app';

function choosePortal(portal: LoginPortal) {
  router.push({ pathname: '/(auth)/login', params: { portal } });
}

export default function SelectRoleScreen() {
  return (
    <AppScreen>
      <SectionHeader title="Ezriya Mobile" subtitle="AI-first real estate workspace" />

      <GlassCard>
        <Text style={styles.heading}>Choose your login portal</Text>
        <View style={styles.stack}>
          <AppButton label="Client Login" onPress={() => choosePortal('client')} />
          <AppButton label="Agent Login" onPress={() => choosePortal('agent')} />
          <AppButton
            label="Broker / Vendor Login"
            onPress={() => choosePortal('broker_vendor')}
            variant="secondary"
          />
        </View>
      </GlassCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontWeight: '700', fontSize: 18, marginBottom: 10 },
  stack: { gap: 10 },
});
