// app/auth/signup.tsx
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

export default function SignupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Redirect href={'/(tabs)' as const} />;

  const onSignUp = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        
        if (signUpError.message.includes('Network request failed') || 
            signUpError.message.includes('Failed to fetch') ||
            signUpError.message.includes('Could not resolve host')) {
          setError(
            'Cannot connect to Supabase.\n\n' +
            'Possible issues:\n' +
            '• Supabase project is paused (check dashboard)\n' +
            '• Incorrect URL in .env file\n' +
            '• Network connectivity issue\n\n' +
            'Please check:\n' +
            '1. Go to https://supabase.com and verify your project is active\n' +
            '2. Check .env file has correct EXPO_PUBLIC_SUPABASE_URL\n' +
            '3. Restart Expo after changing .env file'
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data?.user) {
        Alert.alert(
          'Success',
          'Account created! Please check your email to confirm your account.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/auth/sign-in'),
            },
          ]
        );
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message?.includes('Network request failed') || 
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('Could not resolve host')) {
        setError(
          'Cannot connect to Supabase.\n\n' +
          'Your Supabase project may be paused or the URL is incorrect.\n\n' +
          'Steps to fix:\n' +
          '1. Go to https://supabase.com/dashboard\n' +
          '2. Check if your project is active (not paused)\n' +
          '3. Copy the correct URL from Settings > API\n' +
          '4. Update .env file and restart Expo'
        );
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Ezriya and start your real estate journey</Text>
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
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={Theme.colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
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
              <Text style={styles.passwordHint}>
                <Ionicons name="information-circle-outline" size={14} color={Theme.colors.textTertiary} />{' '}
                Must be at least 6 characters
              </Text>
            </View>

            <AnimatedButton
              title="Create Account"
              onPress={onSignUp}
              variant="primary"
              icon="person-add-outline"
              loading={loading}
              size="large"
              style={styles.signUpButton}
            />
          </View>
        </AnimatedCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href={'/auth/sign-in' as const} style={styles.signInLink}>
            <Text style={styles.signInLinkText}>Sign In</Text>
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
  passwordHint: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    flexDirection: 'row',
    alignItems: 'center',
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
    lineHeight: 20,
  },
  signUpButton: {
    marginTop: Theme.spacing.md,
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
  signInLink: {
    padding: Theme.spacing.xs,
  },
  signInLinkText: {
    ...Theme.typography.body,
    color: Theme.colors.accent,
    fontWeight: '600',
  },
});
