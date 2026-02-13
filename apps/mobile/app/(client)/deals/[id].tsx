import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { GradientBackground } from '../../../components/glass/GradientBackground';
import { GlassHeader } from '../../../components/glass/GlassHeader';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassButton } from '../../../components/glass/GlassButton';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../../lib/utils';

type TabType = 'Timeline' | 'Chat' | 'Docs' | 'People';

export default function DealRoom() {
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('Timeline');

    const deal = {
        address: '1243 Maple St',
        status: 'Under Contract',
        progress: 40
    };

    const tabs: TabType[] = ['Timeline', 'Chat', 'Docs', 'People'];

    return (
        <GradientBackground>
            <GlassHeader title={deal.address} showBack />

            <View className="flex-1 pt-24">
                {/* Deal Progress Summary */}
                <View className="px-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white/70 text-sm">Deal Progress</Text>
                        <Text className="text-white font-bold text-sm">{deal.progress}%</Text>
                    </View>
                    <View className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <View className="h-full bg-ezriya-blue rounded-full" style={{ width: `${deal.progress}%` }} />
                    </View>
                </View>

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

                {/* Content Area */}
                <ScrollView className="flex-1 px-4">
                    {activeTab === 'Timeline' && <TimelineTab />}
                    {activeTab === 'Chat' && <ChatTab />}
                    {activeTab === 'Docs' && <DocsTab />}
                    {activeTab === 'People' && <PeopleTab />}
                </ScrollView>
            </View>
        </GradientBackground>
    );
}

function TimelineTab() {
    const steps = [
        { title: "Offer Accepted", date: "Oct 12", status: 'done' },
        { title: "Inspection Scheduled", date: "Oct 15", status: 'done' },
        { title: "Inspection Review", date: "Oct 16", status: 'current', due: 'Due Today' },
        { title: "Appraisal", date: "Oct 20", status: 'pending' },
        { title: "Closing Disclosure", date: "Nov 01", status: 'pending' },
    ];

    return (
        <View className="pb-20">
            {steps.map((step, index) => (
                <GlassCard key={index} className="mb-4 flex-row items-center border-l-4 border-l-ezriya-blue">
                    <View className={cn(
                        "w-8 h-8 rounded-full items-center justify-center mr-4",
                        step.status === 'done' ? "bg-green-500/20" :
                            step.status === 'current' ? "bg-blue-500/20" : "bg-white/5"
                    )}>
                        <Ionicons
                            name={step.status === 'done' ? "checkmark" : step.status === 'current' ? "time" : "ellipse-outline"}
                            size={16}
                            color={step.status === 'done' ? "#4ADE80" : step.status === 'current' ? "#60A5FA" : "rgba(255,255,255,0.3)"}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className={cn(
                            "font-medium text-lg",
                            step.status === 'pending' ? "text-white/50" : "text-white"
                        )}>{step.title}</Text>
                        <Text className="text-white/40 text-xs">{step.date}</Text>
                    </View>
                    {step.status === 'current' && (
                        <View className="px-2 py-1 bg-blue-500/20 rounded">
                            <Text className="text-blue-300 text-[10px] font-bold">ACTION</Text>
                        </View>
                    )}
                </GlassCard>
            ))}
        </View>
    );
}

function ChatTab() {
    return (
        <View className="items-center justify-center py-10">
            <GlassCard className="w-full items-center p-8">
                <Ionicons name="chatbubbles-outline" size={48} color="white" className="opacity-50 mb-4" />
                <Text className="text-white font-medium mb-2">Deal Chat</Text>
                <Text className="text-white/50 text-center mb-6">Coordinate with your agent and other parties here.</Text>
                <GlassButton variant="primary" title="Start Message" />
            </GlassCard>
        </View>
    );
}

function DocsTab() {
    const docs = [
        { name: "Purchase Agreement", date: "Oct 12", type: "PDF" },
        { name: "Property Disclosure", date: "Oct 12", type: "PDF" },
    ];
    return (
        <View>
            <GlassButton icon={<Ionicons name="cloud-upload-outline" size={20} color="white" />} variant="glass" title="Upload Document" className="mb-6" />

            {docs.map((doc, idx) => (
                <GlassCard key={idx} className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="document-text" size={24} color="#60A5FA" style={{ marginRight: 12 }} />
                        <View>
                            <Text className="text-white font-medium">{doc.name}</Text>
                            <Text className="text-white/40 text-xs">{doc.date} • {doc.type}</Text>
                        </View>
                    </View>
                    <Ionicons name="download-outline" size={20} color="white" />
                </GlassCard>
            ))}
        </View>
    )
}

function PeopleTab() {
    return (
        <GlassCard>
            <Text className="text-white font-medium mb-4">Key Contacts</Text>
            {[1, 2, 3].map(i => (
                <View key={i} className="flex-row items-center mb-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <View className="w-10 h-10 rounded-full bg-white/20 mr-3" />
                    <View>
                        <Text className="text-white font-medium">Alex Rivera</Text>
                        <Text className="text-white/50 text-xs">Buyer's Agent</Text>
                    </View>
                    <View className="flex-1 items-end">
                        <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                            <Ionicons name="call-outline" size={16} color="white" />
                        </View>
                    </View>
                </View>
            ))}
        </GlassCard>
    )
}
