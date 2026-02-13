import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '../../../components/glass/GradientBackground';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassButton } from '../../../components/glass/GlassButton';

export default function AIHome() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const activeJourneys = [
        { id: 1, title: 'Buying in Chicago', status: 'Discover', progress: 0.2 },
        { id: 2, title: 'Selling Condo', status: 'Offers', progress: 0.6 },
        { id: 3, title: 'Invited: 123 Maple', status: 'Tours', progress: 0.4 },
    ];

    const nextActions = [
        { id: 1, icon: 'calendar', title: 'Tour at 4:30 PM', sub: 'with Sam (Agent)' },
        { id: 2, icon: 'document-text', title: 'Review offer draft', sub: 'for Maple St.' },
        { id: 3, icon: 'id-card', title: 'Upload ID doc', sub: 'for closing' },
    ];

    return (
        <GradientBackground>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 10 }}
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-white text-2xl font-bold">Hi, Alex</Text>
                        <View className="flex-row items-center mt-1">
                            <View className="w-2 h-2 rounded-full bg-ezriya-blue mr-2" />
                            <Text className="text-white/60 text-sm">Buying & Selling</Text>
                        </View>
                    </View>
                    <View className="flex-row space-x-4">
                        {/* Using simple View for icon placeholder, in a real app these would be buttons */}
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/5">
                            <Ionicons name="notifications-outline" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/5">
                            <Ionicons name="person-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Active Journeys Card */}
                <GlassCard className="mb-8" intensity={30}>
                    <Text className="text-white text-lg font-semibold mb-1">Your Property Journey</Text>
                    <Text className="text-white/50 text-sm mb-4">AI is tracking 3 active journeys</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {activeJourneys.map((journey) => (
                            <View key={journey.id} className="mr-4 items-center">
                                {/* Progress Ring Placeholder - simplified as a circle for now */}
                                <View className="w-16 h-16 rounded-full border-4 border-white/10 justify-center items-center mb-2 relative">
                                    <View className="absolute w-full h-full rounded-full border-4 border-ezriya-blue/50 border-r-transparent -rotate-45" style={{ opacity: journey.progress + 0.2 }} />
                                    <Text className="text-white text-xs font-bold">{Math.round(journey.progress * 100)}%</Text>
                                </View>
                                <Text className="text-white text-xs font-medium">{journey.status}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </GlassCard>

                {/* AI Centerpiece */}
                <View className="items-center mb-10">
                    <GlassButton
                        variant="glass"
                        className="mb-6 rounded-3xl px-8 py-6 w-full border-ezriya-blue/30"
                    >
                        <View className="items-center">
                            <Ionicons name="sparkles" size={32} color="#2F5CFF" className="mb-4" />
                            <Text className="text-white text-xl font-medium text-center mb-2">
                                What do you want to do right now?
                            </Text>
                        </View>
                    </GlassButton>

                    <View className="flex-row flex-wrap justify-center gap-3">
                        <GlassButton
                            size="sm"
                            variant="outline"
                            title="New Buy Intent"
                            onPress={() => router.push('/(client)/intents/buy/step1')}
                            icon={<Ionicons name="add" size={16} color="white" />}
                        />
                        <GlassButton
                            size="sm"
                            variant="outline"
                            title="New Sell Intent"
                            onPress={() => router.push('/(client)/intents/sell/step1')}
                            icon={<Ionicons name="home" size={16} color="white" />}
                        />
                        <GlassButton
                            size="sm"
                            variant="outline"
                            title="Schedule a Tour"
                            icon={<Ionicons name="calendar" size={16} color="white" />}
                        />
                        <GlassButton
                            size="sm"
                            variant="outline"
                            title="Explore Market"
                            onPress={() => router.push('/(client)/(tabs)/explore')}
                            icon={<Ionicons name="compass" size={16} color="white" />}
                        />
                    </View>
                </View>

                {/* Timeline Widget */}
                <GlassCard className="mb-6" tint="dark">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-white font-semibold">Up Next</Text>
                        <Text className="text-ezriya-blue text-xs">View Calendar</Text>
                    </View>
                    <View className="gap-4">
                        {nextActions.map((action, index) => (
                            <View key={action.id} className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3">
                                    <Ionicons name={action.icon as any} size={20} color="white" />
                                </View>
                                <View className="flex-1 border-b border-white/5 pb-3">
                                    <Text className="text-white font-medium">{action.title}</Text>
                                    <Text className="text-white/50 text-xs">{action.sub}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </GlassCard>

            </ScrollView>
        </GradientBackground>
    );
}
