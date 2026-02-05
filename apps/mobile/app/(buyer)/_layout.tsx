import { Stack } from 'expo-router';

export default function BuyerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intent-setup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

