// app/auth/index.tsx
// Auth index screen - using working components
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import Logo from '../../components/ui/Logo';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';

export default function AuthIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading && !timeoutReached) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Logo size="large" animated />
          <ActivityIndicator size="large" color={Theme.colors.accent} style={styles.loader} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && timeoutReached) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AnimatedCard delay={100}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color={Theme.colors.warning} />
            <Text style={styles.errorTitle}>Connection Issue</Text>
            <Text style={styles.errorText}>
              Having trouble connecting. Please check your internet connection and try again.
            </Text>
            <Text style={styles.errorSubtext}>
              If the problem persists, check your Supabase configuration in .env file
            </Text>
          </View>
        </AnimatedCard>
      </SafeAreaView>
    );
  }

  if (user) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Logo size="large" animated />
          <Text style={styles.title}>Welcome to EZRIYA</Text>
          <Text style={styles.subtitle}>Your trusted real estate platform</Text>
        </View>

        <AnimatedCard delay={100}>
          <View style={styles.buttonContainer}>
            <AnimatedButton
              title="Sign In"
              onPress={() => router.push('/auth/sign-in')}
              variant="primary"
              icon="log-in-outline"
              size="large"
              style={styles.button}
            />
            <AnimatedButton
              title="Create Account"
              onPress={() => router.push('/auth/signup')}
              variant="secondary"
              icon="person-add-outline"
              size="large"
              style={styles.button}
            />
            <AnimatedButton
              title="Browse as Guest"
              onPress={() => router.push('/onboarding/guest-browse')}
              variant="outline"
              icon="eye-outline"
              size="medium"
              style={styles.button}
            />
          </View>
        </AnimatedCard>

        <View style={styles.features}>
          <AnimatedCard delay={200} style={styles.featureCard}>
            <Ionicons name="shield-checkmark" size={24} color={Theme.colors.success} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Verified Listings</Text>
              <Text style={styles.featureText}>Only verified properties</Text>
            </View>
          </AnimatedCard>
          <AnimatedCard delay={250} style={styles.featureCard}>
            <Ionicons name="flash" size={24} color={Theme.colors.accent} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI-Powered Matching</Text>
              <Text style={styles.featureText}>Find your perfect home</Text>
            </View>
          </AnimatedCard>
          <AnimatedCard delay={300} style={styles.featureCard}>
            <Ionicons name="lock-closed" size={24} color={Theme.colors.warning} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Secure Transactions</Text>
              <Text style={styles.featureText}>Safe and reliable</Text>
            </View>
          </AnimatedCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loader: {
    marginTop: Theme.spacing.xl,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
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
  },
  buttonContainer: {
    gap: Theme.spacing.md,
  },
  button: {
    width: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  errorTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  errorSubtext: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
  },
  features: {
    marginTop: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  featureCard: {
    padding: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Theme.typography.h4,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  featureText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
  },
});
