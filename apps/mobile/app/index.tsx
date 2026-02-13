// Root Index - Routes based on authentication status
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/hooks/useAuth';
import { Text, View } from 'react-native';

export default function Index() {
  const { user, profile, loading } = useAuth();

  // Show simple loading text while resolving auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, go to role selection (which leads to login)
  if (!user) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  // If authenticated but no role selected, go to role select
  if (!profile?.role) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  // Route based on role
  if (profile.role === 'buyer' || profile.role === 'seller' || profile.role === 'client') {
    return <Redirect href="/(client)/(tabs)" />;
  } else if (profile.role === 'agent' || profile.role === 'buyer_agent' || profile.role === 'seller_agent') {
    return <Redirect href="/(agent)/(tabs)" />;
  } else if (profile.role === 'vendor') {
    return <Redirect href="/(vendor)" />;
  }

  // Fallback
  return <Redirect href="/(auth)/role-selection" />;
}
