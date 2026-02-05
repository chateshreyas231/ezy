// app/screens/ProfileScreen.tsx
// User profile with instant role selection
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { updateUser, upsertUser } from '../../services/userService';
import type { Role } from '../../src/types/types';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const ROLES: Array<{ value: Role; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: 'buyer', label: 'Buyer', icon: 'search-outline' },
  { value: 'seller', label: 'Seller', icon: 'home-outline' },
  { value: 'buyerAgent', label: 'Buyer Agent', icon: 'briefcase-outline' },
  { value: 'listingAgent', label: 'Listing Agent', icon: 'document-text-outline' },
  { value: 'selfRepresentedAgent', label: 'Self-Represented', icon: 'person-outline' },
  { value: 'fsboSeller', label: 'FSBO Seller', icon: 'storefront-outline' },
  { value: 'vendor', label: 'Vendor', icon: 'hammer-outline' },
  { value: 'vendorAttorney', label: 'Attorney', icon: 'scale-outline' },
  { value: 'teamLead', label: 'Team Lead', icon: 'people-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const { user: authUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'buyer');
  const [state, setState] = useState(user?.state ?? '');
  const [isVerifiedAgent, setIsVerifiedAgent] = useState(user?.is_verified_agent ?? false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhone(user.phone ?? '');
      setRole(user.role);
      setState(user.state ?? '');
      setIsVerifiedAgent(user.is_verified_agent);
    }
  }, [user]);

  // Instant role change - auto-save when role is selected
  const handleRoleChange = async (newRole: Role) => {
    if (!authUser) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    if (newRole === role) return; // Already selected
    if (saving) return; // Already saving

    setRole(newRole);
    setError(null);
    setSaving(true);

    try {
      if (user) {
        await updateUser({
          name: name || null,
          phone: phone || null,
          role: newRole,
          state: state || null,
          is_verified_agent: isVerifiedAgent,
        });
      } else {
        await upsertUser({
          email: authUser.email ?? undefined,
          name: name || undefined,
          phone: phone || undefined,
          role: newRole,
          state: state || undefined,
          is_verified_agent: isVerifiedAgent,
        });
      }

      await refreshUser();
      setSaving(false);
      // Immediately navigate to home to see the new role UI
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error: any) {
      console.error('Role change error:', error);
      setError(error.message || 'Failed to change role');
      setSaving(false);
      Alert.alert('Error', error.message || 'Failed to change role. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!authUser) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      if (user) {
        await updateUser({
          name: name || null,
          phone: phone || null,
          role,
          state: state || null,
          is_verified_agent: isVerifiedAgent,
        });
      } else {
        await upsertUser({
          email: authUser.email ?? undefined,
          name: name || undefined,
          phone: phone || undefined,
          role,
          state: state || undefined,
          is_verified_agent: isVerifiedAgent,
        });
      }

      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <AnimatedCard delay={0}>
          <View style={styles.header}>
            <Ionicons name="person-circle" size={64} color={Theme.colors.accent} />
            <Text style={styles.title}>Profile</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={Theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="mail-outline" size={18} color={Theme.colors.textSecondary} />
              <Text style={styles.label}>Email</Text>
            </View>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{authUser?.email ?? 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={18} color={Theme.colors.textSecondary} />
              <Text style={styles.label}>Name</Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Theme.colors.textTertiary}
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="call-outline" size={18} color={Theme.colors.textSecondary} />
              <Text style={styles.label}>Phone</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={Theme.colors.textTertiary}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="briefcase-outline" size={18} color={Theme.colors.textSecondary} />
              <Text style={styles.label}>Select Your Role</Text>
              {saving && (
                <Text style={styles.savingText}>Saving...</Text>
              )}
            </View>
            <Text style={styles.roleHint}>
              Tap a role to instantly switch - your UI will update immediately
            </Text>
            <View style={styles.rolesGrid}>
              {ROLES.map((r) => {
                const isSelected = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => handleRoleChange(r.value)}
                    disabled={saving}
                    style={[
                      styles.roleCard,
                      isSelected && styles.roleCardActive,
                      saving && styles.roleCardDisabled,
                    ]}
                  >
                    <View
                      style={[
                        styles.roleIconContainer,
                        isSelected && styles.roleIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name={r.icon}
                        size={24}
                        color={isSelected ? Theme.colors.textPrimary : Theme.colors.accent}
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleLabel,
                        isSelected && styles.roleLabelActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color={Theme.colors.textPrimary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.selectedText}>
              Current: {ROLES.find(r => r.value === role)?.label || role}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="location-outline" size={18} color={Theme.colors.textSecondary} />
              <Text style={styles.label}>State</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
              {US_STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setState(s)}
                  style={[
                    styles.stateButton,
                    state === s && styles.stateButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stateButtonText,
                      state === s && styles.stateButtonTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.selectedText}>Selected: {state || 'None'}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Theme.colors.textSecondary} />
              <Text style={styles.label}>Verified Agent</Text>
            </View>
            <AnimatedButton
              title={isVerifiedAgent ? 'Verified ✓' : 'Not Verified'}
              onPress={() => setIsVerifiedAgent(!isVerifiedAgent)}
              variant={isVerifiedAgent ? 'primary' : 'secondary'}
              icon={isVerifiedAgent ? 'checkmark-circle' : 'close-circle-outline'}
              size="medium"
              style={styles.verifiedButton}
            />
          </View>

          <AnimatedButton
            title={saving ? 'Saving...' : 'Save Profile'}
            onPress={handleSave}
            variant="primary"
            icon="save-outline"
            loading={saving}
            size="large"
            style={styles.saveButton}
          />
        </AnimatedCard>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    gap: Theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    ...Theme.typography.bodySmall,
    color: Theme.colors.error,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.xs,
  },
  label: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  savingText: {
    ...Theme.typography.caption,
    color: Theme.colors.accent,
    marginLeft: Theme.spacing.sm,
  },
  roleHint: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    marginBottom: Theme.spacing.md,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  readOnlyField: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  readOnlyText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  roleCard: {
    width: '30%',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    minHeight: 100,
    justifyContent: 'center',
    position: 'relative',
  },
  roleCardActive: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  roleCardDisabled: {
    opacity: 0.5,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  roleIconContainerActive: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderColor: Theme.colors.textPrimary,
  },
  roleLabel: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  roleLabelActive: {
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: Theme.spacing.xs,
    right: Theme.spacing.xs,
  },
  scrollRow: {
    marginBottom: Theme.spacing.sm,
  },
  scrollContent: {
    paddingRight: Theme.spacing.md,
  },
  stateButton: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  stateButtonActive: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  stateButtonText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  stateButtonTextActive: {
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  selectedText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.xs,
  },
  verifiedButton: {
    marginTop: Theme.spacing.xs,
  },
  saveButton: {
    marginTop: Theme.spacing.md,
  },
});
