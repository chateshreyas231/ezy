import { View, Text, FlatList, StyleSheet } from 'react-native';
import { GlassLayout } from '../../../components/ui/GlassLayout';

const TRENDING_AREAS = ['Downtown', 'Suburbs', 'Beachfront'];
const HOT_LISTINGS = [
    { id: '1', title: 'Luxury Penthouse', price: '$2.5M' },
    { id: '2', title: 'Cozy Cottage', price: '$450k' },
];

export default function Explore() {
    return (
        <GlassLayout>
            <View style={styles.container}>
                <Text style={styles.header}>Explore & Trending</Text>

                <Text style={styles.subHeader}>Trending Areas</Text>
                <FlatList
                    horizontal
                    data={TRENDING_AREAS}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>{item}</Text>
                        </View>
                    )}
                />

                <Text style={styles.subHeader}>Hot Listings</Text>
                <FlatList
                    data={HOT_LISTINGS}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardPrice}>{item.price}</Text>
                        </View>
                    )}
                />
            </View>
        </GlassLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subHeader: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
    },
    chip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    chipText: {
        color: 'white',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    cardPrice: {
        color: '#2F5CFF',
        marginTop: 4,
    },
});
