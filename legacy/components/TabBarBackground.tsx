import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TabBarBackground() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        height: 80 + insets.bottom,
        width: '100%',
        position: 'absolute',
        backgroundColor: Colors[colorScheme].background,
        bottom: 0,
        borderTopWidth: 0.2,
        borderTopColor: Colors[colorScheme].text,
      }}
    />
  );
}
