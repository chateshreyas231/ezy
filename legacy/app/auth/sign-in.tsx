// app/auth/sign-in.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import Logo from '../../components/ui/Logo';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Redirect href={'/(tabs)' as const} />;

  const onSignIn = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        if (signInError.message.includes('Network request failed') || signInError.message.includes('Failed to fetch')) {
          setError('Network error. Please check your internet connection and Supabase configuration.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      router.push('/(tabs)');
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.message?.includes('Network request failed') || err.message?.includes('Failed to fetch')) {
        setError('Network error. Please check:\n1. Your internet connection\n2. Supabase URL and key in .env file\n3. Supabase project is active');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size="large" animated />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        <AnimatedCard delay={100}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={Theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="mail-outline" size={16} color={Theme.colors.textSecondary} />
                <Text style={styles.label}>Email</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={Theme.colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  style={styles.input}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="lock-closed-outline" size={16} color={Theme.colors.textSecondary} />
                <Text style={styles.label}>Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={Theme.colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  style={styles.input}
                  editable={!loading}
                />
                <AnimatedButton
                  title=""
                  onPress={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size="small"
                  style={styles.passwordToggle}
                />
              </View>
            </View>

            <AnimatedButton
              title="Sign In"
              onPress={onSignIn}
              variant="primary"
              icon="log-in-outline"
              loading={loading}
              size="large"
              style={styles.signInButton}
            />

            <View style={styles.forgotPasswordRow}>
              <Link href={'/onboarding/forgot-password' as const} style={styles.forgotPasswordLink}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Link>
            </View>
          </View>
        </AnimatedCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href={'/auth/signup' as const} style={styles.signUpLink}>
            <Text style={styles.signUpLinkText}>Sign Up</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: Theme.spacing.lg,
  },
  inputGroup: {
    gap: Theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  label: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
  },
  input: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    paddingVertical: Theme.spacing.md,
  },
  passwordToggle: {
    padding: 0,
    minWidth: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    gap: Theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    ...Theme.typography.bodySmall,
    color: Theme.colors.error,
  },
  signInButton: {
    marginTop: Theme.spacing.md,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: Theme.spacing.sm,
  },
  forgotPasswordLink: {
    padding: Theme.spacing.sm,
  },
  forgotPasswordText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.accent,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  footerText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  signUpLink: {
    padding: Theme.spacing.xs,
  },
  signUpLinkText: {
    ...Theme.typography.body,
    color: Theme.colors.accent,
    fontWeight: '600',
  },
});
