import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {profile && (
        <View style={styles.profileSection}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{profile.display_name || 'Not set'}</Text>

          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{profile.role}</Text>

          <Text style={styles.label}>Verification Level</Text>
          <Text style={styles.value}>Level {profile.verification_level}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
      >
        <Text style={[styles.buttonText, styles.signOutButtonText]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  profileSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
  },
  signOutButtonText: {
    color: '#fff',
  },
});

