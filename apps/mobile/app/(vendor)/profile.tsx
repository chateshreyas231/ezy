import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { ScreenBackground } from '@/src/ui/ScreenBackground';
import { GlassSurface } from '@/src/ui/GlassSurface';
import { GlassButton } from '@/src/ui/GlassButton';

export default function VendorProfile() {
    return (
        <View className="flex-1">
            <ScreenBackground />
            <SafeAreaView className="flex-1 px-4 pt-8 items-center">
                <View className="w-24 h-24 rounded-full bg-slate-700 items-center justify-center mb-4 border-2 border-cyan-500 shadow-lg shadow-cyan-500/50">
                    <Text className="text-3xl font-bold text-slate-300">BB</Text>
                </View>
                <Text className="text-2xl font-bold text-white">Bob's Building Co.</Text>
                <Text className="text-slate-400 mb-8">General Contractor</Text>

                <View className="w-full gap-4">
                    <GlassSurface className="p-4 flex-row justify-between">
                        <Text className="text-white">Availability</Text>
                        <Text className="text-emerald-400">Online</Text>
                    </GlassSurface>
                    <GlassSurface className="p-4 flex-row justify-between">
                        <Text className="text-white">Service Area</Text>
                        <Text className="text-slate-400">Austin, TX</Text>
                    </GlassSurface>
                    <GlassSurface className="p-4 flex-row justify-between">
                        <Text className="text-white">Rating</Text>
                        <Text className="text-amber-400">★ 4.8</Text>
                    </GlassSurface>
                </View>

                <View className="mt-auto w-full mb-8">
                    <GlassButton label="Sign Out" onPress={() => { }} variant="secondary" />
                </View>
            </SafeAreaView>
        </View>
    );
}
