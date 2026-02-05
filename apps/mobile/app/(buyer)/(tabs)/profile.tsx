// Buyer Profile - Comprehensive Settings with Intent Management
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useIntent } from '../../../lib/hooks/useIntent';
import { supabase } from '../../../lib/supabaseClient';

export default function BuyerProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { getCurrentIntent } = useIntent();
  const insets = useSafeAreaInsets();
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currentIntent, setCurrentIntent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIntent();
  }, []);

  const loadIntent = async () => {
    try {
      const intent = await getCurrentIntent();
      setCurrentIntent(intent);
    } catch (error) {
      console.error('Failed to load intent:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleStartVerification = () => {
    router.push('/(auth)/verify');
  };

  const getVerificationStatus = () => {
    if (profile?.buyer_verified && profile?.verification_level >= 2) {
      return { status: 'Verified', color: glassTokens.colors.accent.success, icon: 'checkmark-circle' };
    } else if (profile?.verification_level >= 1) {
      return { status: 'Pending', color: glassTokens.colors.accent.warning, icon: 'time' };
    }
    return { status: 'Not Verified', color: glassTokens.colors.accent.error, icon: 'close-circle' };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <ScreenBackground gradient>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 100,
            paddingHorizontal: glassTokens.componentSpacing.screenPadding,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LiquidGlassCard
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={glassTokens.colors.text.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{profile?.display_name || 'User'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Buyer</Text>
              </View>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Verification Status */}
        <LiquidGlassCard
          title="Verification Status"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <View style={styles.verificationRow}>
            <View style={styles.verificationInfo}>
              <Ionicons name={verificationStatus.icon as any} size={24} color={verificationStatus.color} />
              <Text style={[styles.verificationText, { color: verificationStatus.color }]}>
                {verificationStatus.status}
              </Text>
            </View>
            {verificationStatus.status !== 'Verified' && (
              <LiquidGlassButton
                label="Verify Now"
                onPress={handleStartVerification}
                variant="primary"
                size="sm"
              />
            )}
          </View>
          {profile?.readiness_score !== undefined && (
            <View style={styles.readinessRow}>
              <Text style={styles.readinessLabel}>Readiness Score</Text>
              <Text style={styles.readinessValue}>{profile.readiness_score}%</Text>
            </View>
          )}
        </LiquidGlassCard>

        {/* Current Intent */}
        <LiquidGlassCard
          title="My Search Intent"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          {currentIntent ? (
            <View style={styles.intentInfo}>
              <View style={styles.intentRow}>
                <Text style={styles.intentLabel}>Budget</Text>
                <Text style={styles.intentValue}>
                  ${currentIntent.budget_min?.toLocaleString()} - ${currentIntent.budget_max?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.intentRow}>
                <Text style={styles.intentLabel}>Bedrooms</Text>
                <Text style={styles.intentValue}>{currentIntent.beds_min}+</Text>
              </View>
              <View style={styles.intentRow}>
                <Text style={styles.intentLabel}>Bathrooms</Text>
                <Text style={styles.intentValue}>{currentIntent.baths_min}+</Text>
              </View>
              {currentIntent.property_types && currentIntent.property_types.length > 0 && (
                <View style={styles.intentRow}>
                  <Text style={styles.intentLabel}>Property Types</Text>
                  <Text style={styles.intentValue}>{currentIntent.property_types.join(', ')}</Text>
                </View>
              )}
              <LiquidGlassButton
                label="Edit Intent"
                onPress={() => router.push('/(buyer)/intent-setup')}
                variant="secondary"
                size="md"
                fullWidth
                style={styles.editButton}
              />
            </View>
          ) : (
            <View style={styles.noIntentContainer}>
              <Text style={styles.noIntentText}>No active intent set</Text>
              <LiquidGlassButton
                label="Create Intent"
                onPress={() => router.push('/(buyer)/intent-setup')}
                variant="primary"
                size="md"
                fullWidth
                style={styles.createButton}
              />
            </View>
          )}
        </LiquidGlassCard>

        {/* Notification Settings */}
        <LiquidGlassCard
          title="Notifications"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color={glassTokens.colors.text.secondary} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{
                false: glassTokens.colors.background.mediumGrey,
                true: glassTokens.colors.accent.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail" size={20} color={glassTokens.colors.text.secondary} />
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{
                false: glassTokens.colors.background.mediumGrey,
                true: glassTokens.colors.accent.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </LiquidGlassCard>

        {/* Display Settings */}
        <LiquidGlassCard
          title="Display"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="eye" size={20} color={glassTokens.colors.text.secondary} />
              <Text style={styles.settingLabel}>Reduce Transparency</Text>
            </View>
            <Switch
              value={reduceTransparency}
              onValueChange={setReduceTransparency}
              trackColor={{
                false: glassTokens.colors.background.mediumGrey,
                true: glassTokens.colors.accent.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </LiquidGlassCard>

        {/* Account Actions */}
        <LiquidGlassCard
          title="Account"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(buyer)/intent-setup')}
            activeOpacity={0.7}
          >
            <Ionicons name="create" size={20} color={glassTokens.colors.text.secondary} />
            <Text style={styles.actionLabel}>Edit Search Intent</Text>
            <Ionicons name="chevron-forward" size={20} color={glassTokens.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleStartVerification}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark" size={20} color={glassTokens.colors.text.secondary} />
            <Text style={styles.actionLabel}>Verification</Text>
            <Ionicons name="chevron-forward" size={20} color={glassTokens.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Help', 'Help center coming soon')}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle" size={20} color={glassTokens.colors.text.secondary} />
            <Text style={styles.actionLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={glassTokens.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed" size={20} color={glassTokens.colors.text.secondary} />
            <Text style={styles.actionLabel}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={glassTokens.colors.text.tertiary} />
          </TouchableOpacity>
        </LiquidGlassCard>

        {/* Sign Out */}
        <LiquidGlassButton
          label="Sign Out"
          onPress={handleSignOut}
          variant="error"
          size="lg"
          fullWidth
          style={styles.signOutButton}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: glassTokens.spacing.md,
  },
  card: {
    width: '100%',
    marginBottom: glassTokens.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.md,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: glassTokens.colors.background.darkGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: glassTokens.colors.background.darkGrey,
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  roleText: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: glassTokens.spacing.md,
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.sm,
    flex: 1,
  },
  verificationText: {
    fontSize: glassTokens.typography.fontSize.base,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  readinessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: glassTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  readinessLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
  },
  readinessValue: {
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
  },
  intentInfo: {
    gap: glassTokens.spacing.md,
  },
  intentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: glassTokens.spacing.xs,
  },
  intentLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  intentValue: {
    fontSize: glassTokens.typography.fontSize.base,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
  },
  noIntentContainer: {
    alignItems: 'center',
    gap: glassTokens.spacing.md,
  },
  noIntentText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.secondary,
    textAlign: 'center',
  },
  editButton: {
    marginTop: glassTokens.spacing.sm,
  },
  createButton: {
    marginTop: glassTokens.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: glassTokens.spacing.sm,
    marginBottom: glassTokens.spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.sm,
    flex: 1,
  },
  settingLabel: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  actionLabel: {
    flex: 1,
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
  },
  signOutButton: {
    marginTop: glassTokens.spacing.md,
    marginBottom: glassTokens.spacing.xl,
  },
});
