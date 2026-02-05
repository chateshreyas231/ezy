import { useLocalSearchParams } from 'expo-router';
import OfferRoomScreen from '../screens/OfferRoomScreen';

export default function OfferRoomRoute() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <OfferRoomScreen />;
}
