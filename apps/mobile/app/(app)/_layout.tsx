import { Stack } from 'expo-router';

import { useAuth } from '../../lib/hooks/useAuth';

export default function ProtectedLayout() {
  const { loading, session } = useAuth();

  if (loading || !session) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
