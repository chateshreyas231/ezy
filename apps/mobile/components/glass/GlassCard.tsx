import { BlurView } from 'expo-blur';
import { View, Text, ViewProps, StyleSheet } from 'react-native';
import { cn } from '../../lib/utils';

interface GlassCardProps extends ViewProps {
    className?: string; // Additional Tailwind classes
    intensity?: number; // Blur intensity
    tint?: 'light' | 'dark' | 'default' | 'extraLight' | 'regular' | 'prominent' | 'systemUltraThinMaterial' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'systemMaterialLight' | 'systemMaterialDark' | 'systemChromeMaterialLight' | 'systemChromeMaterialDark' | 'systemUltraThinMaterialLight' | 'systemUltraThinMaterialDark' | 'systemThinMaterialLight' | 'systemThinMaterialDark' | 'systemThickMaterialLight' | 'systemThickMaterialDark';
}

export function GlassCard({
    children,
    className,
    intensity = 20,
    tint = 'dark',
    style,
    ...props
}: GlassCardProps) {
    return (
        <View
            style={[styles.overflowHidden, style]}
            className={cn(
                "rounded-2xl border border-white/10 overflow-hidden relative",
                className
            )}
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint={tint}
                style={StyleSheet.absoluteFill}
            />
            <View className="bg-white/5 p-4 w-full h-full">
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overflowHidden: {
        overflow: 'hidden',
    },
});
