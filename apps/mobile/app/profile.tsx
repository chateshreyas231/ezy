import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/hooks/useAuth';

export default function ProfileEditScreen() {
  const { profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ display_name: displayName });
      Alert.alert('Success', 'Profile updated');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={displayName}
        onChangeText={setDisplayName}
      />

      {profile && (
        <View style={styles.infoSection}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.infoText}>{profile.role}</Text>

          <Text style={styles.label}>Verification Level</Text>
          <Text style={styles.infoText}>Level {profile.verification_level}</Text>
          <Text style={styles.infoSubtext}>
            {profile.verification_level < 3
              ? 'Complete verification to unlock all features'
              : 'Fully verified'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

