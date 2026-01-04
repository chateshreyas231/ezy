// app/auth/signup.tsx
import { Link, Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) return <Redirect href={'/(tabs)' as const} />; // <- cast

  const onSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Sign up error', error.message);
    else Alert.alert('Check your email to confirm your account');
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12, backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 28, fontWeight: '600', color: '#000000' }}>Create account</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ 
          borderWidth: 1, 
          borderRadius: 8, 
          padding: 12, 
          backgroundColor: '#ffffff',
          borderColor: '#e0e0e0',
          color: '#000000'
        }}
      />
      <TextInput
        placeholder="Password (min 6 chars)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ 
          borderWidth: 1, 
          borderRadius: 8, 
          padding: 12,
          backgroundColor: '#ffffff',
          borderColor: '#e0e0e0',
          color: '#000000'
        }}
      />
      <Button title="Sign up" onPress={onSignUp} />
      
      <View style={{ marginTop: 12, gap: 8 }}>
        <Link href={'/auth/sign-in' as const} style={{ color: '#61a0ff', textAlign: 'center' }}>
          I already have an account
        </Link>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 }}>
          <Link href={'/auth/login' as const} style={{ color: '#61a0ff', fontSize: 14 }}>
            Login
          </Link>
          <Text style={{ color: '#666666' }}>|</Text>
          <Link href={'/auth' as const} style={{ color: '#61a0ff', fontSize: 14 }}>
            Home
          </Link>
        </View>
      </View>
    </View>
  );
}
