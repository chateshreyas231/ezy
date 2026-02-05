// components/role-screens/AgentHomeScreen.tsx
// Agent-specific home screen - using working components
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedButton from '../ui/AnimatedButton';
import AnimatedCard from '../ui/AnimatedCard';
import { Theme } from '../../constants/Theme';
import { getMyListingPosts } from '../../services/postsService';
import type { ListingPost } from '../../src/types/types';
import { useUser } from '../../app/context/UserContext';

export default function AgentHomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<ListingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await getMyListingPosts();
      setListings(data);
    } catch (error: any) {
      console.warn('Failed to load listings:', error.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const activeListings = listings.filter(l => l.listing_status === 'active' || l.listing_status === 'live');

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const roleLabel = user?.role === 'buyerAgent' ? 'Buyer Agent' :
                   user?.role === 'listingAgent' ? 'Listing Agent' :
                   user?.role === 'selfRepresentedAgent' ? 'Self-Represented' :
                   user?.role === 'teamLead' ? 'Team Lead' : 'Agent';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Theme.spacing.md },
        ]}
      >
        {/* Header */}
        <AnimatedCard delay={0} style={styles.headerCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Agent Dashboard</Text>
              <Text style={styles.roleBadge}>
                <Ionicons name="briefcase-outline" size={16} color={Theme.colors.accent} /> {roleLabel}
              </Text>
            </View>
            {user?.is_verified_agent && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </AnimatedCard>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <AnimatedCard delay={100} style={styles.statCard}>
            <Ionicons name="home-outline" size={24} color={Theme.colors.accent} />
            <Text style={styles.statNumber}>{activeListings.length}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </AnimatedCard>
          <AnimatedCard delay={150} style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color={Theme.colors.accent} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </AnimatedCard>
          <AnimatedCard delay={200} style={styles.statCard}>
            <Ionicons name="flash-outline" size={24} color={Theme.colors.accent} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </AnimatedCard>
        </View>

        {/* Quick Actions */}
        <AnimatedCard delay={250} style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <AnimatedButton
              title="Create Listing"
              onPress={() => router.push('/screens/CreateListingScreen')}
              variant="primary"
              icon="add-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="My Clients"
              onPress={() => router.push('/agent/clients')}
              variant="secondary"
              icon="people-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="View Matches"
              onPress={() => router.push('/agent/matches')}
              variant="outline"
              icon="flash-outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="My Tasks"
              onPress={() => router.push('/agent/tasks')}
              variant="outline"
              icon="checkmark-done-outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </AnimatedCard>

        {/* Verification Status */}
        {!user?.is_verified_agent && (
          <AnimatedCard delay={300} style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <Ionicons name="shield-outline" size={24} color={Theme.colors.warning} />
              <Text style={styles.verificationTitle}>Verify Your Agent License</Text>
            </View>
            <Text style={styles.verificationText}>
              Verify your agent license to unlock all features and build trust with clients.
            </Text>
            <AnimatedButton
              title="Verify License"
              onPress={() => router.push('/agent/verify-license')}
              variant="primary"
              icon="id-card-outline"
              size="medium"
              style={styles.verificationButton}
            />
          </AnimatedCard>
        )}
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
  loadingContainer: {
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
  headerCard: {
    marginBottom: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  roleBadge: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.success + '20',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    gap: Theme.spacing.xs,
  },
  verifiedText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  statNumber: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsCard: {
    marginBottom: Theme.spacing.md,
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
  verificationCard: {
    marginTop: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.warning + '30',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  verificationTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  verificationText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
    lineHeight: 22,
  },
  verificationButton: {
    width: '100%',
  },
});
