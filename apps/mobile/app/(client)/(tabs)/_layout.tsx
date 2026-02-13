import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassTabBar } from '../../../components/ui/GlassTabBar';
import { GlassActionModal } from '../../../components/ui/GlassActionModal';

export default function ClientLayout() {
    const [actionModalVisible, setActionModalVisible] = useState(false);

    return (
        <>
            <Tabs
                screenOptions={{ headerShown: false }}
                tabBar={(props) => <GlassTabBar {...props} />}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, size, focused }) => (
                            <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        title: 'Search',
                        tabBarIcon: ({ color, size, focused }) => (
                            <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="action"
                    options={{
                        title: '',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="add-circle" size={48} color="#2F5CFF" style={{ marginTop: -20 }} />
                        ),
                    }}
                    listeners={() => ({
                        tabPress: (e) => {
                            e.preventDefault();
                            setActionModalVisible(true);
                        },
                    })}
                />
                <Tabs.Screen
                    name="intents/index"
                    options={{
                        title: 'Intents',
                        tabBarIcon: ({ color, size, focused }) => (
                            <Ionicons name={focused ? "list" : "list-outline"} size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size, focused }) => (
                            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
                        ),
                    }}
                />

                {/* Hidden tabs */}
                <Tabs.Screen name="deals/index" options={{ href: null }} />
            </Tabs>

            <GlassActionModal
                visible={actionModalVisible}
                onClose={() => setActionModalVisible(false)}
                actions={[
                    { icon: 'search-outline', label: 'New Search', onPress: () => console.log('New Search') },
                    { icon: 'home-outline', label: 'Request Tour', onPress: () => console.log('Request Tour') },
                    { icon: 'chatbubble-ellipses-outline', label: 'Ask AI', onPress: () => console.log('Ask AI') },
                ]}
            />
        </>
    );
}
