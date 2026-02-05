// Pro Unified Inbox - All messages across all deals
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ScreenBackground, LiquidGlassCard, glassTokens } from '../../../src/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProInboxScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Reload messages
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScreenBackground gradient>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={glassTokens.colors.accent.primary}
          />
        }
      >
        <LiquidGlassCard 
          title="Unified Inbox"
          subtitle="All messages across all deals"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
        >
          <Text style={styles.emptyText}>
            Messages from all your deals will appear here
          </Text>
          <Text style={styles.todoText}>
            TODO: Implement unified inbox with grouping by property/client, AI draft, quick replies
          </Text>
        </LiquidGlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
  },
  emptyText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: glassTokens.spacing.md,
  },
  todoText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

