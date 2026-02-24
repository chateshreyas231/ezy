import { useLocalSearchParams } from 'expo-router';

import { DealRoomScreen } from '../../../../components/role-screens';

export default function DealRoomRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  return <DealRoomScreen roomId={params.id || ''} />;
}
