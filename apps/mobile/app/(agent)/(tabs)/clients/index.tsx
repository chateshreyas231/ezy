import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const CLIENTS = [
    { id: 'c1', name: 'John Doe', type: 'Buyer', urgency: 'High' },
    { id: 'c2', name: 'Jane Smith', type: 'Seller', urgency: 'Medium' },
];

export default function ClientsList() {
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <Text>My Clients</Text>
            <FlatList
                data={CLIENTS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/(agent)/screens/clients/${item.id}`)}
                        style={{ padding: 10, borderBottomWidth: 1 }}
                    >
                        <Text>{item.name} ({item.type})</Text>
                        <Text>Urgency: {item.urgency}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
