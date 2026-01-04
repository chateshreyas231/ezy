// app/(tabs)/account.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import ProfileScreen from '../screens/ProfileScreen';

export default function AccountScreen() {
  const { user: authUser, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1 }}>
      <ProfileScreen />
      <View style={{ padding: 20, gap: 12 }}>
        <Button title="Sign out" onPress={signOut} />
      </View>
    </ScrollView>
  );
}
