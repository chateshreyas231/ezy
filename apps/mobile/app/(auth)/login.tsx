// Login Screen with Liquid Glass UI
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { GradientBackground } from '../../components/glass/GradientBackground';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassButton } from '../../components/glass/GlassButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        router.replace('/(auth)/role-select');
      } else if (userProfile.role === 'buyer') {
        const { data: intent } = await supabase
          .from('buyer_intents')
          .select('id')
          .eq('buyer_id', authUser.id)
          .eq('active', true)
          .single();

        if (!intent) {
          router.replace('/(buyer)/intent-setup');
        } else {
          router.replace('/(client)/(tabs)/index'); // Fixed route to match new structure
        }
      } else if (userProfile.role === 'seller') {
        router.replace('/(seller)/(tabs)/leads');
      } else if (userProfile.role === 'buyer_agent' || userProfile.role === 'seller_agent') {
        router.replace('/(agent)/(tabs)/index'); // Fixed route to match new structure
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
      await new Promise(resolve => setTimeout(resolve, 500));
      router.replace('/(auth)/role-select');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
          <GlassCard className="p-6 w-full">
            <Text style={styles.title}>Welcome to Ezriya</Text>
            <Text style={styles.subtitle}>Sign in or create an account to continue</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
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
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => Alert.alert('Forgot Password', 'Password reset coming soon')}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <GlassButton
                title="Sign In"
                onPress={handleSignIn}
                variant="primary"
                loading={loading}
                style={styles.signInButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <GlassButton
                title="Sign Up"
                onPress={handleSignUp}
                variant="glass"
                loading={loading}
              />
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6689FF', // ezriya-blue-light
    fontSize: 14,
  },
  signInButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 16,
    fontSize: 12,
  },
});
