// app/(tabs)/matches.tsx
// Matches screen - shows all matches

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

interface Match {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  match_score: number;
  created_at: string;
  listing?: {
    title: string;
    price: number;
    address_public: string | null;
  };
}

export default function MatchesScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    loadMatches();
  }, [authUser]);

  const loadMatches = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          listing:listings(id, title, price, address_public)
        `)
        .or(`buyer_id.eq.${authUser.id},seller_id.eq.${authUser.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Matches</Text>
            <Text style={styles.subtitle}>{matches.length} match{matches.length !== 1 ? 'es' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter-outline" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>
              Start swiping in the Feed to find matches!
            </Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <AnimatedCard delay={index * 50} style={styles.matchCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/deal-room/${item.id}`)}
                  style={styles.matchContent}
                >
                  <View style={styles.matchHeader}>
                    <View style={styles.matchIcon}>
                      <Ionicons name="heart" size={24} color={Theme.colors.error} />
                    </View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchTitle}>
                        {item.listing?.title || 'Property Match'}
                      </Text>
                      {item.listing?.price && (
                        <Text style={styles.matchPrice}>
                          ${item.listing.price.toLocaleString()}
                        </Text>
                      )}
                      {item.listing?.address_public && (
                        <Text style={styles.matchAddress}>
                          {item.listing.address_public}
                        </Text>
                      )}
                    </View>
                    <View style={styles.matchScore}>
                      <Text style={styles.scoreText}>
                        {Math.round(item.match_score * 100)}%
                      </Text>
                      <Text style={styles.scoreLabel}>Match</Text>
                    </View>
                  </View>
                  <View style={styles.matchFooter}>
                    <Text style={styles.matchDate}>
                      Matched {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={Theme.colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              </AnimatedCard>
            )}
          />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.md,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  list: {
    padding: Theme.spacing.md,
  },
  matchCard: {
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.lg,
  },
  matchContent: {
    padding: Theme.spacing.lg,
  },
  matchHeader: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  matchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  matchPrice: {
    ...Theme.typography.h4,
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.xs,
  },
  matchAddress: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
  },
  matchScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    ...Theme.typography.h2,
    color: Theme.colors.success,
  },
  scoreLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  matchDate: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});

