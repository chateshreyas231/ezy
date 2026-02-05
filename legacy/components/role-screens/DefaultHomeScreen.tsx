// components/role-screens/DefaultHomeScreen.tsx
// Default home screen for roles without specific screens
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedButton from '../ui/AnimatedButton';
import AnimatedCard from '../ui/AnimatedCard';
import { Theme } from '../../constants/Theme';
import { useUser } from '../../app/context/UserContext';

export default function DefaultHomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Theme.spacing.md }]}
      >
        <AnimatedCard delay={0} style={styles.headerCard}>
          <View style={styles.header}>
            <Ionicons name="home-outline" size={48} color={Theme.colors.accent} />
            <Text style={styles.title}>Welcome to EZRIYA</Text>
            <Text style={styles.subtitle}>
              Select a role in your profile to see role-specific features
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={100} style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Get Started</Text>
          <View style={styles.actionsGrid}>
            <AnimatedButton
              title="Update Profile"
              onPress={() => router.push('/(tabs)/account')}
              variant="primary"
              icon="person-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="Browse Listings"
              onPress={() => router.push('/(tabs)/explore')}
              variant="secondary"
              icon="search-outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </AnimatedCard>
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
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  headerCard: {
    marginBottom: Theme.spacing.md,
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
  actionsCard: {
    marginTop: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
});

