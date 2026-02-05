// app/auth/login.tsx
import * as Linking from 'expo-linking';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';



// These generate ezriya:// and ezriya://auth/reset automatically
const appRedirect = Linking.createURL('/');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) Alert.alert('Login Error', error.message);
    else router.replace('/');
  };


  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: appRedirect },
      });
      if (error) throw error;
      // Supabase will handle the redirect; session comes via onAuthStateChange
    } catch (e: any) {
      Alert.alert('Google Sign-In error', e.message ?? String(e));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 14 }}>
          <Text style={{ color: '#000000', fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
            Login
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#9aa0a6"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            selectionColor="#61a0ff"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9aa0a6"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            selectionColor="#61a0ff"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
          />

          <Button title={busy ? 'Signing in…' : 'Log In'} onPress={handleLogin} disabled={busy} />

          <TouchableOpacity 
            onPress={() => router.push('/onboarding/forgot-password')} 
            style={{ marginTop: 10 }}
          >
            <Text style={{ color: '#61a0ff', textAlign: 'center' }}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 16 }}>
            <Button title="Continue with Google" onPress={handleGoogle} />
          </View>

          <Text style={{ color: '#666666', textAlign: 'center', marginTop: 12 }}>
            No account?{' '}
            <Link href="/auth/signup" style={{ color: '#61a0ff' }}>
              Create one
            </Link>
          </Text>

          <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
            <Link href="/auth/sign-in" style={{ color: '#61a0ff', fontSize: 14 }}>
              Sign In
            </Link>
            <Text style={{ color: '#666666' }}>|</Text>
            <Link href="/auth" style={{ color: '#61a0ff', fontSize: 14 }}>
              Home
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
