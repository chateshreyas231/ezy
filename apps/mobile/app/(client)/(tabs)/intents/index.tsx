import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../../../../components/glass/GradientBackground';
import { GlassCard } from '../../../../components/glass/GlassCard';
import { GlassHeader } from '../../../../components/glass/GlassHeader';
import { GlassButton } from '../../../../components/glass/GlassButton';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IntentsList() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState<'All' | 'Buy' | 'Sell'>('All');

    const intents = [
        { id: '1', type: 'Buy', title: 'Chicago up to $800k', status: 'Discover', agent: 'Alex Rivera' },
        { id: '2', type: 'Sell', title: '2BR Condo – River North', status: 'Offers', agent: 'Sarah Chen' },
        { id: '3', type: 'Buy', title: 'Investment Property', status: 'Tours', agent: 'Alex Rivera' },
    ];

    const filteredIntents = filter === 'All' ? intents : intents.filter(i => i.type === filter);

    return (
        <GradientBackground>
            <GlassHeader
                title="Your Intents"
                rightElement={
                    <TouchableOpacity onPress={() => { /* Open New Intent Sheet */ }}>
                        <Ionicons name="add-circle-outline" size={28} color="white" />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={{ paddingTop: 100, paddingBottom: 100, paddingHorizontal: 16 }}
                className="flex-1"
            >
                {/* Filters */}
                <View className="flex-row mb-6 space-x-2">
                    {['All', 'Buy', 'Sell'].map((f) => (
                        <GlassButton
                            key={f}
                            title={f}
                            size="sm"
                            variant={filter === f ? 'primary' : 'glass'}
                            onPress={() => setFilter(f as any)}
                            className="mr-2"
                        />
                    ))}
                </View>

                {/* List */}
                {filteredIntents.map((intent) => (
                    <TouchableOpacity key={intent.id} onPress={() => router.push(`/(client)/intents/${intent.id}`)}>
                        <GlassCard className="mb-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-row items-center">
                                    <View className={`px-2 py-1 rounded-md mr-2 ${intent.type === 'Buy' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                                        <Text className={`text-xs font-bold ${intent.type === 'Buy' ? 'text-blue-300' : 'text-purple-300'}`}>
                                            {intent.type.toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text className="text-white font-semibold text-lg">{intent.title}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                            </View>

                            <View className="flex-row items-center justify-between mt-2">
                                <View className="flex-row items-center">
                                    <View className="w-6 h-6 rounded-full bg-white/10 items-center justify-center mr-2">
                                        <Ionicons name="person" size={12} color="white" />
                                    </View>
                                    <Text className="text-white/60 text-sm">{intent.agent}</Text>
                                </View>
                                <View className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                    <Text className="text-white/80 text-xs">{intent.status}</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                ))}

                {filteredIntents.length === 0 && (
                    <View className="items-center mt-10">
                        <Text className="text-white/40">No active intents found.</Text>
                    </View>
                )}

            </ScrollView>
        </GradientBackground>
    );
}
