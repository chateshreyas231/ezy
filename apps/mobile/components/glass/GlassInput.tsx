import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '../../lib/utils';

interface GlassInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function GlassInput({
    label,
    error,
    containerClassName,
    className,
    leftIcon,
    rightIcon,
    placeholderTextColor = "rgba(255, 255, 255, 0.4)",
    ...props
}: GlassInputProps) {
    return (
        <View className={cn("w-full mb-4", containerClassName)}>
            {label && (
                <Text className="text-white/70 text-sm mb-1.5 ml-1 font-medium">
                    {label}
                </Text>
            )}

            <View className="rounded-xl overflow-hidden border border-white/10 h-12 relative flex-row items-center">
                <BlurView
                    intensity={15}
                    tint="dark"
                    className="absolute inset-0 w-full h-full"
                />
                <View className="absolute inset-0 bg-white/5" />

                {leftIcon && (
                    <View className="pl-4 pr-2">
                        {leftIcon}
                    </View>
                )}

                <TextInput
                    className={cn(
                        "flex-1 text-white h-full px-4 text-base",
                        leftIcon ? "pl-0" : "",
                        rightIcon ? "pr-0" : "",
                        className
                    )}
                    placeholderTextColor={placeholderTextColor}
                    {...props}
                />

                {rightIcon && (
                    <View className="pr-4 pl-2">
                        {rightIcon}
                    </View>
                )}
            </View>

            {error && (
                <Text className="text-red-400 text-xs mt-1 ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
}
