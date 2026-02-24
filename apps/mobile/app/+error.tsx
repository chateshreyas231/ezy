import { ErrorBoundaryProps } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>⚠️</Text>
                </View>
                <Text style={styles.title}>Something went wrong</Text>
                <Text style={styles.message}>
                    An unexpected error occurred in the application.
                </Text>
                <Text style={styles.errorDetails} numberOfLines={3}>
                    {error.message}
                </Text>
                <TouchableOpacity style={styles.button} onPress={retry}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        height: 80,
        width: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        color: '#a1a1aa',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    errorDetails: {
        color: '#ef4444',
        fontSize: 12,
        textAlign: 'center',
        padding: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        marginBottom: 32,
        width: '100%',
    },
    button: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
