import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <Text style={{ color: '#000000' }}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    // Already logged in — redirect to main app
    router.replace('/(tabs)');
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 16, backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#000000' }}>
        Welcome to EZRIYA
      </Text>
      <Button title="Login" onPress={() => router.push('/auth/login')} />
      <Button title="Sign Up" onPress={() => router.push('/auth/signup')} />
      <Button title="Sign In" onPress={() => router.push('/auth/sign-in')} />
      <Button title="Select Role" onPress={() => router.push('/onboarding/role-selection')} />
      <Button title="Browse as Guest" onPress={() => router.push('/onboarding/guest-browse')} />
    </View>
  );
}
