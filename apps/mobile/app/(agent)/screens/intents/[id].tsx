import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GradientBackground } from '../../../../components/glass/GradientBackground';
import { GlassHeader } from '../../../../components/glass/GlassHeader';
import { GlassCard } from '../../../../components/glass/GlassCard';
import { GlassButton } from '../../../../components/glass/GlassButton';

export default function AgentIntentDetail() {
    const { id } = useLocalSearchParams();

    return (
        <GradientBackground>
            <GlassHeader title="Intent Details" showBack />

            <View style={styles.content}>
                <GlassCard className="mb-6">
                    <Text style={styles.label}>Intent Title</Text>
                    <Text style={styles.value}>Chicago up to $800k</Text>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Price Point</Text>
                            <Text style={styles.subValue}>$1.2M Max</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Type</Text>
                            <Text style={styles.subValue}>Condo</Text>
                        </View>
                    </View>
                </GlassCard>

                <GlassCard className="mb-8">
                    <Text style={styles.sectionTitle}>Performance Metrics</Text>
                    <View style={styles.row}>
                        <View style={styles.metric}>
                            <Text style={styles.metricValue}>124</Text>
                            <Text style={styles.metricLabel}>Views</Text>
                        </View>
                        <View style={styles.metric}>
                            <Text style={[styles.metricValue, { color: '#6689FF' }]}>12</Text>
                            <Text style={styles.metricLabel}>Matches</Text>
                        </View>
                        <View style={styles.metric}>
                            <Text style={styles.metricValue}>3</Text>
                            <Text style={styles.metricLabel}>Tours</Text>
                        </View>
                    </View>
                </GlassCard>

                <View style={styles.actions}>
                    <GlassButton title="Publish to Network" variant="primary" style={{ marginBottom: 12 }} icon="share-outline" />
                    <GlassButton title="View Matches" variant="glass" icon="list-outline" />
                </View>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingTop: 100,
        paddingHorizontal: 20,
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    metric: {
        alignItems: 'center',
        flex: 1,
    },
    metricValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    metricLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 4,
    },
    actions: {
        marginTop: 'auto',
        marginBottom: 40,
    },
});
