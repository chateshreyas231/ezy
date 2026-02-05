// Welcome / Splash Screen
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../src/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Auto-redirect if already authenticated
    if (!loading && user && profile) {
      const role = profile.role;
      if (role === 'buyer') {
        router.replace('/(buyer)/(tabs)/feed');
      } else if (role === 'seller') {
        router.replace('/(seller)/(tabs)/leads');
      } else if (role === 'buyer_agent' || role === 'seller_agent') {
        router.replace('/(pro)/(tabs)/dashboard');
      } else if (role === 'support') {
        router.replace('/(support)/(tabs)/work-orders');
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <ScreenBackground gradient>
        <View style={styles.container} />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
        <LiquidGlassCard
          title="Welcome to Ezriya"
          subtitle="Real estate matchmaking made simple"
          cornerRadius={28}
          padding={32}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <View style={styles.content}>
            <Text style={styles.description}>
              Swipe through properties and buyer intents. Find your perfect match.
            </Text>

            <View style={styles.buttonContainer}>
              <LiquidGlassButton
                label="Get Started"
                onPress={() => router.push('/(auth)/login')}
                variant="primary"
                size="lg"
                fullWidth
                style={styles.button}
              />
            </View>

            <View style={styles.rolePreview}>
              <Text style={styles.roleLabel}>I'm a...</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => router.push('/(auth)/login?role=buyer')}
                >
                  <Text style={styles.roleButtonText}>Buyer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => router.push('/(auth)/login?role=seller')}
                >
                  <Text style={styles.roleButtonText}>Seller</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => router.push('/(auth)/login?role=pro')}
                >
                  <Text style={styles.roleButtonText}>Agent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  card: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    gap: glassTokens.componentSpacing.sectionSpacing,
  },
  description: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.relaxed,
  },
  buttonContainer: {
    marginTop: glassTokens.spacing.md,
  },
  button: {
    marginTop: glassTokens.spacing.md,
  },
  rolePreview: {
    marginTop: glassTokens.spacing.xl,
    paddingTop: glassTokens.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: glassTokens.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: glassTokens.spacing.sm,
    justifyContent: 'center',
  },
  roleButton: {
    paddingVertical: glassTokens.spacing.sm,
    paddingHorizontal: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleButtonText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.medium,
  },
});

