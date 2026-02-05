// app/seller/leads.tsx
// Seller leads/inquiries screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';

export default function SellerLeadsScreen() {
  const router = useRouter();

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <AnimatedCard delay={0} style={styles.headerCard}>
          <View style={styles.header}>
            <Ionicons name="people-outline" size={32} color={Theme.colors.accent} />
            <Text style={styles.title}>Leads & Inquiries</Text>
            <Text style={styles.subtitle}>
              View and manage buyer inquiries for your listings
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={100} style={styles.emptyCard}>
          <Ionicons name="chatbubbles-outline" size={64} color={Theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Leads Yet</Text>
          <Text style={styles.emptySubtitle}>
            Buyer inquiries will appear here when they contact you about your listings
          </Text>
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
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyCard: {
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

