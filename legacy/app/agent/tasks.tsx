// app/agent/tasks.tsx
// Agent tasks screen
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';

export default function AgentTasksScreen() {
  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <AnimatedCard delay={0} style={styles.headerCard}>
          <View style={styles.header}>
            <Ionicons name="checkmark-done-circle-outline" size={32} color={Theme.colors.accent} />
            <Text style={styles.title}>My Tasks</Text>
            <Text style={styles.subtitle}>
              Track your progress through client deals
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={100} style={styles.emptyCard}>
          <Ionicons name="clipboard-outline" size={64} color={Theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Tasks Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tasks will appear here once you have active deals or listings
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

