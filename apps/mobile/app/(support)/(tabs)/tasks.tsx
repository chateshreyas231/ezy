// Support Tasks - Assigned tasks
import { View, Text, StyleSheet } from 'react-native';
import { ScreenBackground, LiquidGlassCard, glassTokens } from '../../../src/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportTasksScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
        <LiquidGlassCard 
          title="Assigned Tasks"
          subtitle="Tasks assigned to your role"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
        >
          <Text style={styles.emptyText}>
            Tasks assigned to you will appear here
          </Text>
          <Text style={styles.todoText}>
            TODO: Implement task list filtered by assigned role (inspector, lawyer, title, lender)
          </Text>
        </LiquidGlassCard>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

