// app/(tabs)/account.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import ProfileScreen from '../screens/ProfileScreen';

export default function AccountScreen() {
  const { user: authUser, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <ProfileScreen />
        <View style={styles.actions}>
          <AnimatedButton
            title="Sign Out"
            onPress={signOut}
            variant="secondary"
            icon="log-out-outline"
            size="medium"
            style={styles.signOutButton}
          />
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Theme.spacing.xl,
  },
  actions: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  signOutButton: {
    borderColor: Theme.colors.error,
  },
});
