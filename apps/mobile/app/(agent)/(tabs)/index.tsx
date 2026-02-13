import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../../../components/glass/GradientBackground';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassHeader } from '../../../components/glass/GlassHeader';
import { GlassButton } from '../../../components/glass/GlassButton';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AgentDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const schedule = [
        { time: '10:00', title: 'Tour with Jake', sub: '1243 Maple St', type: 'Tour' },
        { time: '11:30', title: 'Inspection', sub: '89 Elm St (Under Contract)', type: 'Docs' },
        { time: '2:00', title: 'Call lender', sub: 'Appraisal status check', type: 'Call' },
    ];

    const alerts = [
        { id: 1, text: '3 deals at risk (Loan docs late)', type: 'critical' },
        { id: 2, text: '2 buyers waiting for matches', type: 'warning' },
    ];

    return (
        <GradientBackground>
            <ScrollView
                contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100, paddingHorizontal: 16 }}
                className="flex-1"
            >
                {/* Header */}
                <View className="mb-8">
                    <Text className="text-white text-3xl font-bold mb-1">Good morning,</Text>
                    <Text className="text-white text-3xl font-bold mb-4">Sarah</Text>
                    <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center mr-4">
                            <View className="w-2 h-2 rounded-full bg-blue-400 mr-2" />
                            <Text className="text-white/70">Buyer-side: 5</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-2 h-2 rounded-full bg-purple-400 mr-2" />
                            <Text className="text-white/70">Seller-side: 3</Text>
                        </View>
                    </View>
                </View>

                {/* Schedule */}
                <GlassCard className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white font-semibold text-lg">Today</Text>
                        <Text className="text-white/50 text-sm">Oct 24</Text>
                    </View>
                    {schedule.map((item, index) => (
                        <View key={index} className="flex-row items-start mb-4 last:mb-0">
                            <Text className="text-white/60 w-12 pt-1 font-medium">{item.time}</Text>
                            <View className={`w-1 h-full absolute left-12 top-0 bottom-0 rounded-full ${item.type === 'Tour' ? 'bg-blue-500' : item.type === 'Docs' ? 'bg-purple-500' : 'bg-orange-500'}`} />
                            <View className="flex-1 ml-4 bg-white/5 p-3 rounded-xl">
                                <Text className="text-white font-medium">{item.title}</Text>
                                <Text className="text-white/50 text-xs">{item.sub}</Text>
                            </View>
                        </View>
                    ))}
                </GlassCard>

                {/* Alerts & AI */}
                <View className="mb-6">
                    <Text className="text-white font-semibold text-lg mb-4">Priorities</Text>
                    {alerts.map(alert => (
                        <GlassCard key={alert.id} className="mb-3 border-l-4 border-l-red-500">
                            <View className="flex-row items-center">
                                <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 10 }} />
                                <Text className="text-white font-medium">{alert.text}</Text>
                            </View>
                        </GlassCard>
                    ))}
                </View>

                {/* Pipeline Snapshot */}
                <GlassCard className="mb-20">
                    <Text className="text-white font-semibold text-lg mb-4">Pipeline Health</Text>
                    <View className="space-y-4">
                        {[
                            { label: 'Leads', val: 12, color: 'bg-blue-500' },
                            { label: 'Tours', val: 5, color: 'bg-purple-500' },
                            { label: 'Offers', val: 3, color: 'bg-orange-500' },
                            { label: 'Closing', val: 2, color: 'bg-green-500' }
                        ].map((stage, i) => (
                            <View key={i}>
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-white/60 text-xs">{stage.label}</Text>
                                    <Text className="text-white font-bold text-xs">{stage.val}</Text>
                                </View>
                                <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <View className={`h-full ${stage.color}`} style={{ width: `${stage.val * 5}%` }} />
                                </View>
                            </View>
                        ))}
                    </View>
                </GlassCard>

            </ScrollView>

            {/* Floating AI Action */}
            <View className="absolute bottom-6 left-4 right-4">
                <GlassButton
                    variant="glass"
                    className="rounded-full shadow-lg border border-ezriya-blue/30 bg-ezriya-blue/20 backdrop-blur-xl"
                    onPress={() => { /* Open AI Assistant */ }}
                >
                    <View className="flex-row items-center py-1">
                        <Ionicons name="sparkles" size={20} color="#2F5CFF" style={{ marginRight: 8 }} />
                        <Text className="text-white font-medium">Ask AI: What should I do now?</Text>
                    </View>
                </GlassButton>
            </View>

        </GradientBackground>
    );
}
