// Seller Inbox - Conversations list
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ScreenBackground, LiquidGlassCard, glassTokens } from '../../../src/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SellerInboxScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Reload conversations
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
          title="Inbox"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
        >
          <Text style={styles.emptyText}>
            Your conversations will appear here
          </Text>
          <Text style={styles.todoText}>
            TODO: Implement conversation list with realtime updates
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

