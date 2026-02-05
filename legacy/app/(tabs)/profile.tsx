// app/(tabs)/profile.tsx
// Profile screen with verification level UI

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../../services/supabaseClient';
import { seedAllMockData } from '../../services/mockDataService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { user, refreshUser } = useUser();
  const [verificationLevel, setVerificationLevel] = useState(0);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user) {
      setVerificationLevel(user.verification_level || 0);
    }
  }, [user]);

  const handleRoleSelect = () => {
    router.push('/onboarding/role-selection');
  };

  const handleVerifyIdentity = () => {
    router.push('/onboarding/verify-identity');
  };

  const handleUploadPreapproval = () => {
    router.push('/onboarding/upload-preapproval');
  };

  const handleSeedAllMockData = async () => {
    setSeeding(true);
    try {
      const result = await seedAllMockData();
      Alert.alert(
        'Mock Data Created!',
        `✅ Listings: ${result.listings.count}\n✅ Buyer Intents: ${result.intents.count}\n✅ Matches: ${result.matches.count}\n✅ Deal Rooms: ${result.dealRooms.count}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to seed mock data';
      Alert.alert('Error', errorMessage);
    } finally {
      setSeeding(false);
    }
  };

  const getVerificationStatus = () => {
    switch (verificationLevel) {
      case 0:
        return { label: 'Email Verified', color: Theme.colors.textTertiary, icon: 'mail-outline' };
      case 1:
        return { label: 'ID Verified', color: Theme.colors.warning, icon: 'id-card-outline' };
      case 2:
        return { label: 'Pre-approval Verified', color: Theme.colors.info, icon: 'document-check-outline' };
      case 3:
        return { label: 'Fully Verified', color: Theme.colors.success, icon: 'checkmark-circle' };
      default:
        return { label: 'Not Verified', color: Theme.colors.textTertiary, icon: 'alert-circle-outline' };
    }
  };

  const status = getVerificationStatus();

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <AnimatedCard delay={0} style={styles.card}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={Theme.colors.accent} />
            </View>
            <Text style={styles.displayName}>
              {user?.name || user?.email || 'User'}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="briefcase-outline" size={16} color={Theme.colors.accent} />
              <Text style={styles.roleText}>
                {user?.role?.replace(/([A-Z])/g, ' $1').trim() || 'Buyer'}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={100} style={styles.card}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Theme.colors.accent} />
              <Text style={styles.sectionTitle}>Verification Status</Text>
            </View>
            <View style={styles.verificationStatus}>
              <Ionicons name={status.icon as any} size={32} color={status.color} />
              <Text style={[styles.verificationLabel, { color: status.color }]}>
                {status.label}
              </Text>
              <Text style={styles.verificationLevel}>
                Level {verificationLevel} / 3
              </Text>
            </View>

            <View style={styles.verificationSteps}>
              <VerificationStep
                level={1}
                currentLevel={verificationLevel}
                title="Verify Identity"
                description="Upload government ID"
                onPress={handleVerifyIdentity}
                icon="id-card-outline"
              />
              <VerificationStep
                level={2}
                currentLevel={verificationLevel}
                title="Upload Pre-approval"
                description="Proof of funds or pre-approval letter"
                onPress={handleUploadPreapproval}
                icon="document-text-outline"
              />
              <VerificationStep
                level={3}
                currentLevel={verificationLevel}
                title="Complete Verification"
                description="All documents reviewed and approved"
                onPress={() => {}}
                icon="checkmark-circle-outline"
                disabled={verificationLevel < 2}
              />
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={200} style={styles.card}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={20} color={Theme.colors.accent} />
              <Text style={styles.sectionTitle}>Testing</Text>
            </View>
            <AnimatedButton
              title={seeding ? "Creating Mock Data..." : "Seed All Mock Data"}
              onPress={handleSeedAllMockData}
              variant="primary"
              icon="sparkles"
              style={styles.settingButton}
              disabled={seeding}
            />
            <Text style={styles.seedDescription}>
              Create test data: listings, buyer intents, matches, and deal rooms
            </Text>
          </View>
        </AnimatedCard>

        <AnimatedCard delay={250} style={styles.card}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color={Theme.colors.accent} />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
            <AnimatedButton
              title="Change Role"
              onPress={handleRoleSelect}
              variant="outline"
              icon="swap-horizontal-outline"
              style={styles.settingButton}
            />
            <AnimatedButton
              title="Sign Out"
              onPress={async () => {
                await supabase.auth.signOut();
                router.replace('/auth');
              }}
              variant="outline"
              icon="log-out-outline"
              style={styles.settingButton}
            />
          </View>
        </AnimatedCard>
      </View>
    </SafeScreen>
  );
}

function VerificationStep({
  level,
  currentLevel,
  title,
  description,
  onPress,
  icon,
  disabled = false,
}: {
  level: number;
  currentLevel: number;
  title: string;
  description: string;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}) {
  const isCompleted = currentLevel >= level;
  const isNext = currentLevel === level - 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isCompleted}
      style={[
        styles.verificationStep,
        isCompleted && styles.verificationStepCompleted,
        isNext && styles.verificationStepNext,
        disabled && styles.verificationStepDisabled,
      ]}
    >
      <View style={styles.stepIcon}>
        <Ionicons
          name={isCompleted ? 'checkmark-circle' : icon}
          size={24}
          color={
            isCompleted
              ? Theme.colors.success
              : isNext
              ? Theme.colors.accent
              : Theme.colors.textTertiary
          }
        />
      </View>
      <View style={styles.stepInfo}>
        <Text
          style={[
            styles.stepTitle,
            isCompleted && styles.stepTitleCompleted,
            isNext && styles.stepTitleNext,
          ]}
        >
          {title}
        </Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
      {isNext && (
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.accent} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.md,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
  },
  card: {
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.lg,
  },
  profileSection: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  displayName: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  email: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    backgroundColor: Theme.colors.accent + '20',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  roleText: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  section: {
    padding: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  verificationStatus: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  verificationLabel: {
    ...Theme.typography.h3,
    marginTop: Theme.spacing.sm,
    fontWeight: '600',
  },
  verificationLevel: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  verificationSteps: {
    gap: Theme.spacing.md,
  },
  verificationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  verificationStepCompleted: {
    backgroundColor: Theme.colors.success + '10',
    borderColor: Theme.colors.success + '30',
  },
  verificationStepNext: {
    backgroundColor: Theme.colors.accent + '10',
    borderColor: Theme.colors.accent,
    borderWidth: 2,
  },
  verificationStepDisabled: {
    opacity: 0.5,
  },
  stepIcon: {
    marginRight: Theme.spacing.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
  stepTitleCompleted: {
    color: Theme.colors.success,
  },
  stepTitleNext: {
    color: Theme.colors.accent,
  },
  stepDescription: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
  },
  settingButton: {
    marginBottom: Theme.spacing.sm,
  },
  seedDescription: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.xs,
  },
});

