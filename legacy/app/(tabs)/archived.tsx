// app/(tabs)/archived.tsx
// Archived screen - shows passed items (swiped NO)

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

interface ArchivedItem {
  id: string;
  target_type: 'listing' | 'buyer_intent';
  target_id: string;
  created_at: string;
  listing?: {
    title: string;
    price: number;
    address_public: string | null;
  };
  buyer_intent?: {
    budget_min: number | null;
    budget_max: number | null;
  };
}

export default function ArchivedScreen() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [archived, setArchived] = useState<ArchivedItem[]>([]);

  useEffect(() => {
    loadArchived();
  }, [authUser]);

  const loadArchived = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const { data: swipes, error } = await supabase
        .from('swipes')
        .select('*')
        .eq('actor_id', authUser.id)
        .eq('direction', 'no')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch details for each target
      const items: ArchivedItem[] = [];
      for (const swipe of swipes || []) {
        if (swipe.target_type === 'listing') {
          const { data: listing } = await supabase
            .from('listings')
            .select('id, title, price, address_public')
            .eq('id', swipe.target_id)
            .single();

          if (listing) {
            items.push({
              id: swipe.id,
              target_type: 'listing',
              target_id: swipe.target_id,
              created_at: swipe.created_at,
              listing,
            });
          }
        } else if (swipe.target_type === 'buyer_intent') {
          const { data: intent } = await supabase
            .from('buyer_intents')
            .select('id, budget_min, budget_max')
            .eq('id', swipe.target_id)
            .single();

          if (intent) {
            items.push({
              id: swipe.id,
              target_type: 'buyer_intent',
              target_id: swipe.target_id,
              created_at: swipe.created_at,
              buyer_intent: intent,
            });
          }
        }
      }

      setArchived(items);
    } catch (error) {
      console.error('Failed to load archived:', error);
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
            <Text style={styles.title}>Archived</Text>
            <Text style={styles.subtitle}>
              {archived.length} passed item{archived.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {archived.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={64} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No archived items</Text>
            <Text style={styles.emptySubtitle}>
              Items you pass will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={archived}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <AnimatedCard delay={index * 50} style={styles.archivedCard}>
                <View style={styles.archivedContent}>
                  {item.target_type === 'listing' && item.listing ? (
                    <>
                      <Text style={styles.archivedTitle}>{item.listing.title}</Text>
                      {item.listing.price && (
                        <Text style={styles.archivedPrice}>
                          ${item.listing.price.toLocaleString()}
                        </Text>
                      )}
                      {item.listing.address_public && (
                        <Text style={styles.archivedAddress}>
                          {item.listing.address_public}
                        </Text>
                      )}
                    </>
                  ) : item.buyer_intent ? (
                    <>
                      <Text style={styles.archivedTitle}>Buyer Intent</Text>
                      {item.buyer_intent.budget_min && item.buyer_intent.budget_max && (
                        <Text style={styles.archivedPrice}>
                          ${item.buyer_intent.budget_min.toLocaleString()} - ${item.buyer_intent.budget_max.toLocaleString()}
                        </Text>
                      )}
                    </>
                  ) : null}
                  <Text style={styles.archivedDate}>
                    Passed {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
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
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
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
  archivedCard: {
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.lg,
  },
  archivedContent: {
    padding: Theme.spacing.lg,
  },
  archivedTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  archivedPrice: {
    ...Theme.typography.h4,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  archivedAddress: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textTertiary,
    marginBottom: Theme.spacing.sm,
  },
  archivedDate: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.sm,
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

