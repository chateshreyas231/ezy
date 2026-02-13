import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { GlassLayout } from '../../../components/ui/GlassLayout';

export default function DealsScreen() {
    return (
        <GlassLayout>
            <View style={styles.container}>
                <Text style={styles.text}>Deals / Activity</Text>
            </View>
        </GlassLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
