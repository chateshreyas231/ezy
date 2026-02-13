import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GradientBackground } from '../../../components/glass/GradientBackground';
import { GlassHeader } from '../../../components/glass/GlassHeader';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassButton } from '../../../components/glass/GlassButton';
import { Ionicons } from '@expo/vector-icons';

export default function IntentDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Mock data - normally fetched by ID
    const intent = {
        id,
        type: 'Buy',
        title: 'Chicago up to $800k',
        status: 'Discover',
        agent: 'Alex Rivera',
        stats: {
            budget: '$750k - $850k',
            matches: 7,
            tours: 2
        }
    };

    return (
        <GradientBackground>
            <GlassHeader title={intent.title} showBack />

            <ScrollView contentContainerStyle={{ paddingTop: 100, paddingBottom: 40, paddingHorizontal: 16 }}>

                {/* Top Status */}
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <Text className="text-white/60 mr-2">Status:</Text>
                        <View className="px-3 py-1 bg-ezriya-blue/20 rounded-full border border-ezriya-blue/30">
                            <Text className="text-ezriya-blue text-xs font-bold">{intent.status.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text className="text-white/60">Agent: {intent.agent}</Text>
                </View>

                {/* Stats Strip */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-4 px-4">
                    <GlassCard className="mr-3 w-32 items-center justify-center py-4" intensity={10}>
                        <Text className="text-white/50 text-xs uppercase mb-1">Budget</Text>
                        <Text className="text-white font-bold">{intent.stats.budget}</Text>
                    </GlassCard>
                    <GlassCard className="mr-3 w-24 items-center justify-center py-4" intensity={10}>
                        <Text className="text-white/50 text-xs uppercase mb-1">Matches</Text>
                        <Text className="text-white font-bold text-xl">{intent.stats.matches}</Text>
                    </GlassCard>
                    <GlassCard className="w-24 items-center justify-center py-4" intensity={10}>
                        <Text className="text-white/50 text-xs uppercase mb-1">Tours</Text>
                        <Text className="text-white font-bold text-xl">{intent.stats.tours}</Text>
                    </GlassCard>
                </ScrollView>

                {/* AI Summary */}
                <GlassCard className="mb-6 bg-ezriya-blue/5 border-ezriya-blue/20">
                    <View className="flex-row items-start">
                        <Ionicons name="sparkles" size={20} color="#2F5CFF" style={{ marginRight: 10, marginTop: 2 }} />
                        <View className="flex-1">
                            <Text className="text-white text-base leading-6 mb-3">
                                3 neighborhoods match your budget. Expect 5–8 weeks to find a fit based on current market speed.
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                <GlassButton size="sm" variant="glass" title="Widen area" />
                                <GlassButton size="sm" variant="glass" title="Lower budget" />
                            </View>
                        </View>
                    </View>
                </GlassCard>

                {/* Tours Section */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-semibold mb-4">Upcoming Tours</Text>
                    <GlassCard>
                        <View className="flex-row mb-4 border-b border-white/5 pb-4">
                            <View className="w-16 h-16 bg-white/10 rounded-lg mr-4" />
                            <View className="flex-1 justify-center">
                                <Text className="text-white font-medium text-lg">1243 Maple St.</Text>
                                <Text className="text-white/60">Today at 4:30 PM</Text>
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                                    <Text className="text-green-400 text-xs ml-1">Confirmed</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row justify-between">
                            <GlassButton size="sm" variant="glass" title="Reschedule" className="flex-1 mr-2" />
                            <GlassButton size="sm" variant="glass" title="Directions" className="flex-1 ml-2" />
                        </View>
                    </GlassCard>
                </View>

                {/* Matches Section */}
                <View className="mb-20">
                    <Text className="text-white text-lg font-semibold mb-4">Top Matches</Text>
                    {/* Horizontal Listing Cards would go here */}
                    <GlassCard className="p-0">
                        <View className="h-40 bg-white/10 w-full" />
                        <View className="p-4">
                            <Text className="text-white text-lg font-bold">$795,000</Text>
                            <Text className="text-white/70">89 Elm St, Chicago</Text>
                            <GlassButton variant="primary" title="Book Tour" className="mt-4" />
                        </View>
                    </GlassCard>
                </View>

            </ScrollView>

            {/* Floating Action Button for Deal Room if active */}
            <View className="absolute bottom-10 left-4 right-4">
                <GlassButton variant="primary" title="Open Deal Room" onPress={() => router.push(`/(client)/deals/${id}`)} />
            </View>

        </GradientBackground>
    );
}
