// Seller Profile - Comprehensive Settings
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../lib/hooks/useAuth';
import { supabase } from '../../../lib/supabaseClient';

export default function SellerProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [listingsCount, setListingsCount] = useState(0);
  const [activeListingsCount, setActiveListingsCount] = useState(0);

  useEffect(() => {
    loadListingsStats();
  }, []);

  const loadListingsStats = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, status')
        .eq('seller_id', user.id);

      if (!error && data) {
        setListingsCount(data.length);
        setActiveListingsCount(data.filter(l => l.status === 'active').length);
      }
    } catch (error) {
      console.error('Failed to load listings stats:', error);
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
    if (profile?.seller_verified && profile?.verification_level >= 2) {
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
                <Text style={styles.roleText}>Seller</Text>
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
        </LiquidGlassCard>

        {/* Listings Stats */}
        <LiquidGlassCard
          title="My Listings"
          cornerRadius={24}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{listingsCount}</Text>
              <Text style={styles.statLabel}>Total Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeListingsCount}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <LiquidGlassButton
            label="Manage Listings"
            onPress={() => router.push('/(seller)/(tabs)/listings')}
            variant="secondary"
            size="md"
            fullWidth
            style={styles.manageButton}
          />
          <LiquidGlassButton
            label="Create New Listing"
            onPress={() => router.push('/(seller)/create-listing')}
            variant="primary"
            size="md"
            fullWidth
            style={styles.createButton}
          />
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
                false: 'rgba(255, 255, 255, 0.2)',
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
                false: 'rgba(255, 255, 255, 0.2)',
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
                false: 'rgba(255, 255, 255, 0.2)',
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
            onPress={() => router.push('/(seller)/create-listing')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color={glassTokens.colors.text.secondary} />
            <Text style={styles.actionLabel}>Create Listing</Text>
            <Ionicons name="chevron-forward" size={20} color={glassTokens.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(seller)/(tabs)/listings')}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={20} color={glassTokens.colors.text.secondary} />
            <Text style={styles.actionLabel}>Manage Listings</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    borderRadius: glassTokens.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: glassTokens.spacing.md,
    paddingBottom: glassTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: glassTokens.typography.fontSize['2xl'],
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
  },
  statLabel: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  manageButton: {
    marginTop: glassTokens.spacing.sm,
  },
  createButton: {
    marginTop: glassTokens.spacing.sm,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
