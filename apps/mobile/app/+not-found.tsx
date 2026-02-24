import { Link } from 'expo-router';
import { Text } from 'react-native';

import { AppScreen } from '../components/AppScreen';

export default function NotFoundScreen() {
  return (
    <AppScreen>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Page not found</Text>
      <Link href="/" style={{ color: '#2EC6FF' }}>
        Go home
      </Link>
    </AppScreen>
  );
}
