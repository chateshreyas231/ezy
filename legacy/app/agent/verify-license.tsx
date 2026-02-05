// app/agent/verify-license.tsx
// Agent license verification screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';

export default function AgentVerifyLicenseScreen() {
  const router = useRouter();

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <AnimatedCard delay={0} style={styles.headerCard}>
          <View style={styles.header}>
            <Ionicons name="id-card-outline" size={48} color={Theme.colors.accent} />
            <Text style={styles.title}>Verify Agent License</Text>
            <Text style={styles.subtitle}>
              Upload your real estate license to verify your agent status
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Build trust with clients</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Unlock all agent features</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="lock-closed" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Your license is secure and encrypted</Text>
            </View>
          </View>

          <AnimatedButton
            title="Upload License"
            onPress={() => {
              // TODO: Implement license upload
              router.back();
            }}
            variant="primary"
            icon="cloud-upload-outline"
            size="large"
            style={styles.uploadButton}
          />
        </AnimatedCard>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
  },
  headerCard: {
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoSection: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  infoText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  uploadButton: {
    marginTop: Theme.spacing.md,
  },
});

