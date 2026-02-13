import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="role-selection" options={{ title: 'Select Role' }} />
      <Stack.Screen name="client/login" options={{ title: 'Client Login' }} />
      <Stack.Screen name="client/signup" options={{ title: 'Client Signup' }} />
      <Stack.Screen name="agent/login" options={{ title: 'Agent Login' }} />
      <Stack.Screen name="agent/signup" options={{ title: 'Agent Signup' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Reset Password' }} />
    </Stack>
  );
}
