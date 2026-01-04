// app/onboarding/role-selection.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ROLES = [
  {
    id: 'agent',
    title: 'Agent',
    description: 'Represent buyers and sellers.',
    icon: '👔',
  },
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Find your future home.',
    icon: '🏠',
  },
  {
    id: 'seller',
    title: 'Seller',
    description: 'Market a property, with or without an agent.',
    icon: '🏢',
  },
  {
    id: 'guest',
    title: 'OMNI Guest',
    description: 'Browse freely — no profile needed.',
    icon: '👁️',
  },
  {
    id: 'investor',
    title: 'Investor',
    description: 'Flip, buy-and-hold, or fund real estate.',
    icon: '📈',
  },
  {
    id: 'lender',
    title: 'Lender',
    description: 'Offer financing and connect with buyers.',
    icon: '🏛️',
  },
  {
    id: 'contractor',
    title: 'Contractor/Ven',
    description: 'Provide services like staging, inspection, repairs.',
    icon: '🔧',
  },
  {
    id: 'renter',
    title: 'Renter',
    description: 'Find a rental and contact landlords.',
    icon: '🏘️',
  },
  {
    id: 'landlord',
    title: 'Landlord',
    description: 'List and manage rental properties.',
    icon: '🏡',
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleRoleSelect = (roleId: string) => {
    // Navigate to appropriate welcome screen based on role
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
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff', padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', textAlign: 'center', marginTop: 40, marginBottom: 12 }}>
        What brings you to EZRIYA?
      </Text>
      <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 32 }}>
        Select a role to personalize your experience. You can switch or add roles anytime.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            onPress={() => handleRoleSelect(role.id)}
            style={{
              width: '30%',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>{role.icon}</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000000', marginBottom: 4, textAlign: 'center' }}>
              {role.title}
            </Text>
            <Text style={{ fontSize: 11, color: '#666666', textAlign: 'center' }}>
              {role.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)')}
        style={{
          backgroundColor: '#6666ff',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Continue</Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ color: '#666666', fontSize: 14 }}>
          Already have an account?{' '}
          <Text
            style={{ color: '#6666ff' }}
            onPress={() => router.push('/auth/login')}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

