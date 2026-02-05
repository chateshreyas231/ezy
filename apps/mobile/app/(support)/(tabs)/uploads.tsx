// Support Uploads - Document uploads
import { View, Text, StyleSheet } from 'react-native';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportUploadsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
        <LiquidGlassCard 
          title="Document Uploads"
          subtitle="Upload inspection reports, title documents, etc."
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
        >
          <Text style={styles.emptyText}>
            Upload documents for deals you're invited to
          </Text>
          <LiquidGlassButton
            label="Upload Document"
            onPress={() => {
              // TODO: Implement document upload with type selector
            }}
            variant="primary"
            size="md"
            style={styles.uploadButton}
          />
          <Text style={styles.todoText}>
            TODO: Implement document upload with type selector (inspection, title, appraisal, contract), triggers AI summary
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
    marginBottom: glassTokens.spacing.lg,
  },
  uploadButton: {
    marginTop: glassTokens.spacing.md,
    marginBottom: glassTokens.spacing.md,
  },
  todoText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

