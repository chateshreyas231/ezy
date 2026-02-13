import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { GradientBackground } from '../../../../components/glass/GradientBackground';
import { GlassHeader } from '../../../../components/glass/GlassHeader';
import { GlassCard } from '../../../../components/glass/GlassCard';
import { GlassButton } from '../../../../components/glass/GlassButton';
import { cn } from '../../../../lib/utils';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'Chat' | 'Docs' | 'People' | 'Timeline';

export default function AgentDealRoom() {
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('Chat');

    const tabs: TabType[] = ['Chat', 'Docs', 'People', 'Timeline'];

    return (
        <GradientBackground>
            <GlassHeader title={`Deal Room #${id} (Agent)`} showBack />

            <View className="flex-1 pt-24">
                {/* Tabs */}
                <View className="flex-row px-4 mb-6">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={cn(
                                "mr-2 px-4 py-2 rounded-full border",
                                activeTab === tab
                                    ? "bg-white/20 border-white/20"
                                    : "bg-transparent border-transparent"
                            )}
                        >
                            <Text className={cn(
                                "text-sm font-medium",
                                activeTab === tab ? "text-white" : "text-white/50"
                            )}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                <ScrollView className="flex-1 px-4">
                    {activeTab === 'Chat' && <AgentConversationTab />}
                    {activeTab === 'Docs' && <AgentDocsTab />}
                    {activeTab === 'Timeline' && <AgentTimelineTab />}
                    {activeTab === 'People' && <AgentPeopleTab />}
                </ScrollView>
            </View>
        </GradientBackground>
    );
}

function AgentConversationTab() {
    return (
        <View className="items-center justify-center py-10">
            <GlassCard className="w-full items-center p-8">
                <Ionicons name="chatbubbles-outline" size={48} color="white" className="opacity-50 mb-4" />
                <Text className="text-white font-medium mb-2">Agent Chat Hub</Text>
                <Text className="text-white/50 text-center mb-6">Talk to Client, Other Agent, Vendors</Text>
                <GlassButton variant="primary" title="Broadcast Update" />
                <View className="mt-4 p-4 bg-white/5 rounded-lg w-full">
                    <Text className="text-ezriya-blue text-xs font-bold mb-1">AI SUGGESTION</Text>
                    <Text className="text-white/80 text-sm">"Schedule inspection review call for tomorrow morning."</Text>
                </View>
            </GlassCard>
        </View>
    );
}

function AgentDocsTab() {
    return (
        <View>
            <GlassCard className="mb-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white font-medium">Pending Tasks</Text>
                    <Text className="text-white/50 text-xs">Admin View</Text>
                </View>
                <View className="flex-row items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20 mb-2">
                    <View className="flex-row items-center">
                        <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                        <Text className="text-white text-sm">Pre-approval Letter</Text>
                    </View>
                    <Text className="text-red-400 text-xs font-bold">LATE</Text>
                </View>
                <View className="flex-row items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <View className="flex-row items-center">
                        <Ionicons name="time" size={16} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white text-sm">Inspection Report</Text>
                    </View>
                    <Text className="text-white/50 text-xs">Due tomorrow</Text>
                </View>
            </GlassCard>
            <GlassButton variant="glass" title="Assign New Task" icon={<Ionicons name="add" size={18} color="white" />} />
        </View>
    );
}

function AgentTimelineTab() {
    return (
        <GlassCard>
            <Text className="text-white font-medium mb-4">Deal Timeline</Text>
            <View className="border-l-2 border-white/10 pl-4 py-2">
                <Text className="text-white font-medium">Offer Accepted</Text>
                <Text className="text-white/40 text-xs mb-4">Oct 12</Text>

                <Text className="text-ezriya-blue font-medium">Inspection</Text>
                <Text className="text-white/40 text-xs">Current Stage</Text>
            </View>
        </GlassCard>
    )
}

function AgentPeopleTab() {
    return (
        <GlassCard>
            <Text className="text-white font-medium mb-4">Participants</Text>
            <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-white/20 mr-3" />
                <View>
                    <Text className="text-white font-medium">Alex Rivera</Text>
                    <Text className="text-white/50 text-xs">Buyer (Your Client)</Text>
                </View>
            </View>
            <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-white/20 mr-3" />
                <View>
                    <Text className="text-white font-medium">Sarah Chen</Text>
                    <Text className="text-white/50 text-xs">Seller Agent</Text>
                </View>
            </View>
        </GlassCard>
    )
}
