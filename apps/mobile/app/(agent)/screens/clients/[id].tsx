import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GradientBackground } from '../../../../components/glass/GradientBackground';
import { GlassHeader } from '../../../../components/glass/GlassHeader';
import { GlassCard } from '../../../../components/glass/GlassCard';
import { GlassButton } from '../../../../components/glass/GlassButton';

export default function ClientDetail() {
    const { id } = useLocalSearchParams();

    return (
        <GradientBackground>
            <GlassHeader title="Client Detail" showBack />

            <View style={styles.content}>
                <GlassCard className="mb-6">
                    <Text style={styles.label}>Client Name</Text>
                    <Text style={styles.value}>John Doe</Text>

                    <Text style={[styles.label, { marginTop: 16 }]}>Status</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Active Buyer</Text>
                    </View>
                </GlassCard>

                <GlassCard className="mb-6">
                    <Text style={styles.sectionTitle}>Active Intents</Text>
                    <View style={styles.listItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.listText}>Buy 3BHK in Brooklyn</Text>
                    </View>
                </GlassCard>

                <GlassCard className="mb-8">
                    <Text style={styles.sectionTitle}>AI Summary</Text>
                    <Text style={styles.summaryText}>"John is highly motivated but budget constrained. Recommend showing properties slightly below max budget to leave room for renovations."</Text>
                </GlassCard>

                <View style={styles.actions}>
                    <GlassButton title="Contact Client" variant="primary" style={{ marginBottom: 12 }} />
                    <GlassButton title="Start Deal Room" variant="glass" />
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    statusBadge: {
        backgroundColor: 'rgba(47, 92, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#6689FF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2F5CFF',
        marginRight: 10,
    },
    listText: {
        color: 'white',
        fontSize: 16,
    },
    summaryText: {
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    actions: {
        marginTop: 'auto',
        marginBottom: 40,
    },
});
