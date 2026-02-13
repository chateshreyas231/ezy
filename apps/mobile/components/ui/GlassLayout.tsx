import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface GlassLayoutProps {
    children: React.ReactNode;
    showGradient?: boolean;
}

export const GlassLayout: React.FC<GlassLayoutProps> = ({ children, showGradient = true }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {showGradient && (
                <LinearGradient
                    colors={['#050510', '#0a1f5c', '#050510']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050510',
    },
    content: {
        flex: 1,
    },
});
