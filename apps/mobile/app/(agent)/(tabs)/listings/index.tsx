import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const LISTINGS = [
    { id: 'l1', address: '123 Main St', price: '$1.2M', status: 'Active' },
];

export default function AgentListings() {
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <Text>My Listings & Intents</Text>
            <FlatList
                data={LISTINGS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/(agent)/screens/intents/${item.id}`)}
                        style={{ padding: 10, borderBottomWidth: 1 }}
                    >
                        <Text>{item.address}</Text>
                        <Text>{item.price} - {item.status}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
