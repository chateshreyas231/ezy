import { View, Text, Button, FlatList } from 'react-native';

const REELS = [
    { id: 'r1', title: 'Virtual Tour: 3BHK' },
    { id: 'r2', title: 'Market Update: Feb' },
];

export default function AgentReels() {
    return (
        <View style={{ flex: 1 }}>
            <Text>Agent Reels</Text>
            <Button title="Upload New Reel" onPress={() => { }} />

            <FlatList
                data={REELS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ height: 200, borderWidth: 1, margin: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{item.title}</Text>
                        <Text>(Video Placeholder)</Text>
                    </View>
                )}
            />
        </View>
    );
}
