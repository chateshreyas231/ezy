import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { GradientBackground } from '../../components/glass/GradientBackground';
import { GlassHeader } from '../../components/glass/GlassHeader';
import { GlassCard } from '../../components/glass/GlassCard';

export default function VendorDashboard() {
    return (
        <GradientBackground>
            <GlassHeader title="Vendor Portal" />

            <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-white/60 mb-6">Welcome back, Bob</Text>

                <View className="flex-row gap-4 mb-6">
                    <GlassCard className="flex-1 items-center justify-center py-6">
                        <Text className="text-3xl font-bold text-white">12</Text>
                        <Text className="text-white/50 text-xs uppercase mt-1">Active</Text>
                    </GlassCard>
                    <GlassCard className="flex-1 items-center justify-center py-6">
                        <Text className="text-3xl font-bold text-emerald-400">$4.2k</Text>
                        <Text className="text-white/50 text-xs uppercase mt-1">Earnings</Text>
                    </GlassCard>
                </View>

                <Text className="text-white text-lg font-bold mb-4">New Requests</Text>

                <View className="gap-4">
                    <GlassCard className="mb-4">
                        <Text className="text-white font-bold text-lg">Plumbing Repair</Text>
                        <Text className="text-white/60 text-sm mt-1">123 Serenity Lane • $250</Text>
                        <View className="flex-row mt-4">
                            <View className="bg-ezriya-blue/20 px-3 py-1 rounded-full border border-ezriya-blue/30 self-start">
                                <Text className="text-ezriya-blue text-xs font-bold">NEW REQUEST</Text>
                            </View>
                        </View>
                    </GlassCard>
                    <GlassCard className="mb-4">
                        <Text className="text-white font-bold text-lg">Roof Inspection</Text>
                        <Text className="text-white/60 text-sm mt-1">456 Skyline Blvd • $400</Text>
                        <View className="flex-row mt-4">
                            <View className="bg-ezriya-blue/20 px-3 py-1 rounded-full border border-ezriya-blue/30 self-start">
                                <Text className="text-ezriya-blue text-xs font-bold">NEW REQUEST</Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>
            </ScrollView>
        </GradientBackground>
    );
}
