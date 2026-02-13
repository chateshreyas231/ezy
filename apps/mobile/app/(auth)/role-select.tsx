// Role Select Screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { LiquidGlassButton, LiquidGlassCard, ScreenBackground, glassTokens } from '../../src/ui';

const roles = [
  { id: 'buyer', label: 'Buyer', icon: 'home', description: 'Find your perfect property' },
  { id: 'seller', label: 'Seller', icon: 'key', description: 'Connect with verified buyers' },
  { id: 'buyer_agent', label: 'Buyer Agent', icon: 'people', description: 'Manage buyer clients' },
  { id: 'seller_agent', label: 'Seller Agent', icon: 'business', description: 'Manage listings' },
  { id: 'support', label: 'Support', icon: 'document-text', description: 'Inspection, title, legal' },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSelectRole = async (roleId: string) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    setLoading(true);
    try {
      // Verify user exists in auth.users by checking current session
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser || authUser.id !== user.id) {
        throw new Error('User authentication failed. Please sign in again.');
      }

      // Use UPSERT to handle both create and update cases
      // This is safer than checking first, as it handles race conditions
      const displayName = user.email?.split('@')[0] || 'User';

      const { data: profileData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            role: roleId,
            display_name: displayName,
            verification_level: 0,
          },
          {
            onConflict: 'id',
          }
        )
        .select('id, role')
        .single();

      if (upsertError) {
        // Provide more helpful error messages
        if (upsertError.code === '23503') {
          // Foreign key constraint violation
          throw new Error(
            'User account not found. Please sign out and sign in again, or contact support if the issue persists.'
          );
        }
        if (upsertError.code === '42501') {
          // Permission denied
          throw new Error(
            'Permission denied. Please ensure you are signed in and try again.'
          );
        }
        throw new Error(`Failed to update profile: ${upsertError.message}`);
      }

      if (!profileData) {
        throw new Error('Failed to update profile: No data returned.');
      }

      // Verify the update was successful
      if (profileData.role !== roleId) {
        throw new Error('Failed to verify role update. Please try again.');
      }

      // Navigate to verification (onboarding step)
      // After verification, user will be directed to intent-setup (for buyers) or app
      router.replace('/(auth)/verify');
    } catch (error: any) {
      console.error('Failed to update role:', error);
      Alert.alert('Error', error.message || 'Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground gradient>
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <LiquidGlassCard
          title="Choose Your Role"
          subtitle="Select how you'll use Ezriya"
          cornerRadius={28}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <View style={styles.roleList}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardSelected,
                ]}
                onPress={() => setSelectedRole(role.id)}
                activeOpacity={0.8}
              >
                <View style={styles.roleIconContainer}>
                  <Ionicons
                    name={role.icon as any}
                    size={32}
                    color={selectedRole === role.id ? glassTokens.colors.accent.primary : glassTokens.colors.text.secondary}
                  />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === role.id && styles.roleLabelSelected,
                  ]}>
                    {role.label}
                  </Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                {selectedRole === role.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={glassTokens.colors.accent.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <LiquidGlassButton
            label="Continue"
            onPress={() => selectedRole && handleSelectRole(selectedRole)}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedRole || loading}
            loading={loading}
            style={styles.continueButton}
          />
        </LiquidGlassCard>
      </View>
    </ScreenBackground>
  );
}

const styles: any = {};

