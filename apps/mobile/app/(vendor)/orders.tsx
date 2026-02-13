import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { ScreenBackground } from '@/src/ui/ScreenBackground';
import { GlassSurface } from '@/src/ui/GlassSurface';
import { SectionHeader } from '@/src/ui/SectionHeader';

export default function VendorOrders() {
    return (
        <View className="flex-1">
            <ScreenBackground />
            <SafeAreaView className="flex-1">
                <ScrollView className="flex-1 px-4 pt-4">
                    <SectionHeader title="Your Orders" subtitle="Manage service info" />

                    <View className="gap-4 mt-4">
                        <OrderCard id="#3023" service="HVAC Maintenance" status="Scheduled" date="Feb 12, 10:00 AM" />
                        <OrderCard id="#2911" service="Electrical Wiring" status="Completed" date="Feb 5, 2:30 PM" />
                        <OrderCard id="#2880" service="Landscaping" status="In Progress" date="Feb 1, 9:00 AM" />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function OrderCard({ id, service, status, date }: { id: string, service: string, status: string, date: string }) {
    return (
        <GlassSurface className="p-4 flex-row justify-between items-center">
            <View>
                <Text className="text-slate-400 text-xs mb-1">{id}</Text>
                <Text className="text-white font-bold text-lg">{service}</Text>
                <Text className="text-slate-300 text-sm">{date}</Text>
            </View>
            <View className={`px-2 py-1 rounded border ${status === 'Completed' ? 'bg-emerald-500/20 border-emerald-500/50' :
                    status === 'Scheduled' ? 'bg-blue-500/20 border-blue-500/50' :
                        'bg-amber-500/20 border-amber-500/50'
                }`}>
                <Text className={`text-xs font-bold ${status === 'Completed' ? 'text-emerald-400' :
                        status === 'Scheduled' ? 'text-blue-400' :
                            'text-amber-400'
                    }`}>{status}</Text>
            </View>
        </GlassSurface>
    )
}
