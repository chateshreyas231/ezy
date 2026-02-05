// app/index.tsx - Root index route
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import SafeScreen from '../components/ui/SafeScreen';
import { Theme } from '../constants/Theme';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
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
      <SafeScreen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (loading && timeoutReached) {
    return (
      <SafeScreen>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorText}>
            Having trouble connecting. Please check your internet connection and try again.
          </Text>
          <Text style={styles.errorSubtext}>
            If the problem persists, check your Supabase configuration in .env file
          </Text>
        </View>
      </SafeScreen>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  errorTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
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
});
