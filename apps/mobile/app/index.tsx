// Root Index - Routes based on authentication status
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/hooks/useAuth';

export default function Index() {
  const { user, profile, loading } = useAuth();

  // Show nothing while loading to prevent flash
  if (loading) {
    return null;
  }

  // If not authenticated, go to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated but no role selected, go to role select
  if (!profile?.role) {
    return <Redirect href="/(auth)/role-select" />;
  }

  // Check if buyer has intent setup
  if (profile.role === 'buyer') {
    // We'll check intent in the buyer feed screen, so just redirect there
    return <Redirect href="/(buyer)/(tabs)/feed" />;
  }

  // Route based on role
  if (profile.role === 'seller') {
    return <Redirect href="/(seller)/(tabs)/leads" />;
  } else if (profile.role === 'buyer_agent' || profile.role === 'seller_agent') {
    return <Redirect href="/(pro)/(tabs)/dashboard" />;
  } else if (profile.role === 'support') {
    return <Redirect href="/(support)/(tabs)/work-orders" />;
  }

  // Fallback to role select
  return <Redirect href="/(auth)/role-select" />;
}
