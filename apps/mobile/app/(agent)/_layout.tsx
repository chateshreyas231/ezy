import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassTabBar } from '../../components/ui/GlassTabBar';
import { GlassActionModal } from '../../components/ui/GlassActionModal';

export default function AgentLayout() {
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
                            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="leads"
                    options={{
                        title: 'Leads',
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
                    name="deals"
                    options={{
                        title: 'Deals',
                        tabBarIcon: ({ color, size, focused }) => (
                            <Ionicons name={focused ? "briefcase" : "briefcase-outline"} size={size} color={color} />
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

                {/* Hide legacy/unused tabs */}
                <Tabs.Screen name="clients/index" options={{ href: null }} />
                <Tabs.Screen name="listings/index" options={{ href: null }} />
                <Tabs.Screen name="reels/index" options={{ href: null }} />
            </Tabs>

            <GlassActionModal
                visible={actionModalVisible}
                onClose={() => setActionModalVisible(false)}
                actions={[
                    { icon: 'add-circle-outline', label: 'New Deal', onPress: () => console.log('New Deal') },
                    { icon: 'person-add-outline', label: 'Add Client', onPress: () => console.log('Add Client') },
                    { icon: 'document-text-outline', label: 'Create Task', onPress: () => console.log('Create Task') },
                ]}
            />
        </>
    );
}
