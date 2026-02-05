// Login Screen with Liquid Glass UI
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { LiquidGlassButton, LiquidGlassCard, ScreenBackground, glassTokens } from '../../src/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, profile } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const preSelectedRole = params.role as string | undefined;

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Wait for profile to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get fresh profile data
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        throw new Error('User not found after sign in');
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Navigate based on profile status
      if (!userProfile?.role) {
        // No role selected - go to role select
        router.replace('/(auth)/role-select');
      } else if (userProfile.role === 'buyer') {
        // Check if buyer has an intent
        const { data: intent } = await supabase
          .from('buyer_intents')
          .select('id')
          .eq('buyer_id', authUser.id)
          .eq('active', true)
          .single();
        
        if (!intent) {
          router.replace('/(buyer)/intent-setup');
        } else {
          router.replace('/(buyer)/(tabs)/feed');
        }
      } else if (userProfile.role === 'seller') {
        router.replace('/(seller)/(tabs)/leads');
      } else if (userProfile.role === 'buyer_agent' || userProfile.role === 'seller_agent') {
        router.replace('/(pro)/(tabs)/dashboard');
      } else if (userProfile.role === 'support') {
        router.replace('/(support)/(tabs)/work-orders');
      } else {
        router.replace('/(auth)/role-select');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // Wait a bit for profile to be created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // New users always go to role select
      router.replace('/(auth)/role-select');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground gradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
          <LiquidGlassCard
            title="Welcome to Ezriya"
            subtitle="Sign in or create an account to continue"
            cornerRadius={28}
            padding={24}
            elasticity={0.25}
            blurAmount={0.12}
            style={styles.card}
          >
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => {
                  // TODO: Implement forgot password
                  Alert.alert('Forgot Password', 'Password reset coming soon');
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <LiquidGlassButton
                label="Sign In"
                onPress={handleSignIn}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                style={styles.signInButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <LiquidGlassButton
                label="Sign Up"
                onPress={handleSignUp}
                variant="secondary"
                size="lg"
                fullWidth
                loading={loading}
                style={styles.signUpButton}
              />
            </View>
          </LiquidGlassCard>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  form: {
    gap: glassTokens.componentSpacing.sectionSpacing,
  },
  inputContainer: {
    gap: glassTokens.spacing.sm,
  },
  label: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: glassTokens.colors.background.darkGrey,
    borderRadius: glassTokens.radius.lg,
    paddingVertical: glassTokens.componentSpacing.inputPaddingVertical,
    paddingHorizontal: glassTokens.componentSpacing.inputPaddingHorizontal,
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 52,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -glassTokens.spacing.sm,
  },
  forgotPasswordText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.accent.primary,
    fontWeight: glassTokens.typography.fontWeight.medium,
  },
  signInButton: {
    marginTop: glassTokens.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.md,
    marginVertical: glassTokens.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    fontWeight: glassTokens.typography.fontWeight.medium,
  },
  signUpButton: {
    marginTop: 0,
  },
});
