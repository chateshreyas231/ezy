// app/onboarding/role-selection.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import Logo from '../../components/ui/Logo';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';

const ROLES = [
  {
    id: 'agent',
    title: 'Agent',
    description: 'Represent buyers and sellers',
    icon: 'briefcase-outline' as const,
  },
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Find your future home',
    icon: 'search-outline' as const,
  },
  {
    id: 'seller',
    title: 'Seller',
    description: 'Market a property',
    icon: 'home-outline' as const,
  },
  {
    id: 'guest',
    title: 'Guest',
    description: 'Browse freely',
    icon: 'eye-outline' as const,
  },
  {
    id: 'investor',
    title: 'Investor',
    description: 'Real estate investments',
    icon: 'trending-up-outline' as const,
  },
  {
    id: 'lender',
    title: 'Lender',
    description: 'Offer financing',
    icon: 'cash-outline' as const,
  },
  {
    id: 'contractor',
    title: 'Contractor',
    description: 'Provide services',
    icon: 'hammer-outline' as const,
  },
  {
    id: 'renter',
    title: 'Renter',
    description: 'Find a rental',
    icon: 'key-outline' as const,
  },
  {
    id: 'landlord',
    title: 'Landlord',
    description: 'Manage rentals',
    icon: 'business-outline' as const,
  },
];


export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleRoleSelect = (roleId: string) => {
    const roleRoutes: Record<string, string> = {
      agent: '/onboarding/agent-welcome',
      buyer: '/onboarding/buyer-welcome',
      seller: '/onboarding/seller-welcome',
      guest: '/onboarding/guest-browse',
      investor: '/onboarding/investor-welcome',
      lender: '/onboarding/lender-welcome',
      contractor: '/onboarding/contractor-welcome',
      renter: '/onboarding/renter-welcome',
      landlord: '/onboarding/landlord-welcome',
    };
    
    const route = roleRoutes[roleId] || '/onboarding/role-selection';
    router.push(route as any);
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Logo size="medium" animated />
          <Text style={styles.title}>What brings you to EZRIYA?</Text>
          <Text style={styles.subtitle}>
            Select a role to personalize your experience. You can switch or add roles anytime.
          </Text>
        </View>

        <View style={styles.rolesGrid}>
          {ROLES.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              onPress={() => handleRoleSelect(role.id)}
              delay={index * 50}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <AnimatedButton
            title="Continue"
            onPress={() => router.push('/(tabs)')}
            variant="primary"
            icon="arrow-forward-outline"
            size="large"
            style={styles.continueButton}
          />
          <AnimatedButton
            title="Already have an account? Sign In"
            onPress={() => router.push('/auth/login')}
            variant="ghost"
            icon="log-in-outline"
            size="medium"
            style={styles.signInButton}
          />
        </View>
      </View>
    </SafeScreen>
  );
}

function RoleCard({
  role,
  onPress,
  delay,
}: {
  role: typeof ROLES[0];
  onPress: () => void;
  delay: number;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <AnimatedCard delay={delay} style={styles.roleCardContainer}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={0.9}
        style={[styles.roleCard, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <View style={styles.roleIconContainer}>
          <Ionicons name={role.icon} size={32} color={Theme.colors.accent} />
        </View>
        <Text style={styles.roleTitle}>{role.title}</Text>
        <Text style={styles.roleDescription}>{role.description}</Text>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  roleCardContainer: {
    width: '30%',
    padding: 0,
    margin: 0,
  },
  roleCard: {
    width: '100%',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minHeight: 140,
    justifyContent: 'center',
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  roleTitle: {
    ...Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  roleDescription: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  continueButton: {
    width: '100%',
  },
  signInButton: {
    width: '100%',
  },
});
