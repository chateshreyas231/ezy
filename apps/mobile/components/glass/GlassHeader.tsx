import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GlassHeaderProps {
    title?: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
    className?: string;
}

export function GlassHeader({ title, showBack = false, rightElement, className }: GlassHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View className={cn("absolute top-0 left-0 right-0 z-50 overflow-hidden border-b border-white/5", className)}>
            <BlurView intensity={20} tint="dark" style={{ position: 'absolute', width: '100%', height: '100%' }} />
            <View
                className="flex-row items-center justify-between px-4 pb-3"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row items-center flex-1">
                    {showBack && (
                        <Pressable
                            onPress={() => router.back()}
                            className="mr-3 w-8 h-8 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
                        >
                            <Ionicons name="chevron-back" size={20} color="white" />
                        </Pressable>
                    )}
                    {title && (
                        <Text className="text-white text-lg font-semibold" numberOfLines={1}>
                            {title}
                        </Text>
                    )}
                </View>

                {rightElement && (
                    <View>
                        {rightElement}
                    </View>
                )}
            </View>
        </View>
    );
}
