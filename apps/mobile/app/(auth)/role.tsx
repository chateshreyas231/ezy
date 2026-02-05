import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { useTheme } from '../../lib/ThemeContext';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { updateProfile, user, loading } = useAuth();
  const router = useRouter();

  const handleRoleSelect = async (role: 'buyer' | 'seller') => {
    if (!user) {
      console.error('User not authenticated yet');
      return;
    }
    
    setSelectedRole(role);
    try {
      await updateProfile({ role });
      if (role === 'buyer') {
        router.replace('/(buyer)/intent');
      } else {
        router.replace('/(seller)/create-listing');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      Alert.alert('Error', 'Failed to update role. Please try again.');
    }
  };

  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>Please log in first</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Choose Your Role</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>How do you want to use Ezriya?</Text>

      <TouchableOpacity
        style={[
          styles.roleButton,
          { 
            borderColor: theme.colors.cardBorder,
            backgroundColor: theme.colors.card,
          },
          selectedRole === 'buyer' && { 
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.backgroundTertiary,
          }
        ]}
        onPress={() => handleRoleSelect('buyer')}
      >
        <Text style={[styles.roleTitle, { color: theme.colors.text }]}>I'm a Buyer</Text>
        <Text style={[styles.roleDescription, { color: theme.colors.textSecondary }]}>Looking to buy a property</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.roleButton,
          { 
            borderColor: theme.colors.cardBorder,
            backgroundColor: theme.colors.card,
          },
          selectedRole === 'seller' && { 
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.backgroundTertiary,
          }
        ]}
        onPress={() => handleRoleSelect('seller')}
      >
        <Text style={[styles.roleTitle, { color: theme.colors.text }]}>I'm a Seller</Text>
        <Text style={[styles.roleDescription, { color: theme.colors.textSecondary }]}>Looking to sell my property</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  roleButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  selectedButton: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
  },
});

