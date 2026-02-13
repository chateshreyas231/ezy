import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../../../../components/glass/GradientBackground';
import { GlassCard } from '../../../../components/glass/GlassCard';
import { GlassHeader } from '../../../../components/glass/GlassHeader';
import { Ionicons } from '@expo/vector-icons';

export default function DealsList() {
    const router = useRouter();

    const deals = [
        { id: '1', address: '1243 Maple St', status: 'Under Contract', stage: 'Inspection', progress: 0.4 },
        { id: '2', address: '89 Elm St', status: 'Close to Closing', stage: 'Final Walkthrough', progress: 0.9 },
    ];

    return (
        <GradientBackground>
            <GlassHeader title="Active Deals" />

            <ScrollView
                contentContainerStyle={{ paddingTop: 100, paddingBottom: 100, paddingHorizontal: 16 }}
                className="flex-1"
            >
                {deals.map((deal) => (
                    <TouchableOpacity key={deal.id} onPress={() => router.push(`/(client)/deals/${deal.id}`)}>
                        <GlassCard className="mb-4">
                            <View className="flex-row justify-between items-start mb-4">
                                <View>
                                    <Text className="text-white font-semibold text-xl mb-1">{deal.address}</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                                        <Text className="text-green-400 text-xs font-medium">{deal.status.toUpperCase()}</Text>
                                    </View>
                                </View>
                                <GlassCard intensity={40} className="w-12 h-12 items-center justify-center rounded-full border-0 bg-white/10">
                                    <Text className="text-white font-bold">{Math.round(deal.progress * 100)}%</Text>
                                </GlassCard>
                            </View>

                            <View className="bg-white/5 rounded-lg p-3 border border-white/5 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-white/40 text-xs uppercase mb-1">Current Stage</Text>
                                    <Text className="text-white font-medium">{deal.stage}</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={16} color="white" />
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                ))}

                {deals.length === 0 && (
                    <View className="items-center mt-10">
                        <Text className="text-white/40">No active deals.</Text>
                    </View>
                )}

            </ScrollView>
        </GradientBackground>
    );
}
