import { View, Text, Switch, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function SellStep4() {
    const router = useRouter();

    return (
        <View>
            <Text>Selling Intent - Step 4: Vendors & Agents</Text>
            <Text>Choose services:</Text>
            <View><Text>Agent</Text><Switch value={true} /></View>
            <View><Text>Lawyer</Text><Switch value={true} /></View>
            <View><Text>Stager</Text><Switch value={false} /></View>

            <Button title="Generate Intent Report" onPress={() => router.push('/(client)/intents/new-sell-id')} />
            <Button title="Back" onPress={() => router.back()} />
        </View>
    );
}
