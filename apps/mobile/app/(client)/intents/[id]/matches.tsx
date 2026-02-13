import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const MATCHES = [
    { id: 'm1', title: 'Lovely 3 Bed Condo', score: '95%' },
    { id: 'm2', title: 'Brownstone Fixer Upper', score: '88%' },
];

export default function IntentMatches() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <Text>Matches for Intent {id}</Text>
            <FlatList
                data={MATCHES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text>{item.title}</Text>
                        <Text>Match Score: {item.score}</Text>
                        <Text>Status: Under Review</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
