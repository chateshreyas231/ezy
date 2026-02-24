import { Tabs } from 'expo-router';

import { colors } from '../../../constants/theme';
import { tabIcon } from '../../../components/role-screens';

export default function ClientTabs() {
  return (
    <Tabs
      initialRouteName="ai"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#0B1C2A',
          borderTopColor: 'rgba(255,255,255,0.12)',
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen name="ai" options={{ title: 'AI', tabBarIcon: tabIcon('sparkles') }} />
      <Tabs.Screen name="listings" options={{ title: 'Listings', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="matches" options={{ title: 'Deals', tabBarIcon: tabIcon('git-compare') }} />
      <Tabs.Screen name="network" options={{ title: 'Network', tabBarIcon: tabIcon('people') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-circle') }} />
    </Tabs>
  );
}
