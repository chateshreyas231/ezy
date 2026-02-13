import { View, Text, Switch, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function BuyStep2() {
    const router = useRouter();

    return (
        <View>
            <Text>Buying Intent - Step 2: Preferences</Text>
            <View><Text>New vs Resale</Text><Switch value={false} /></View>
            <View><Text>Flexible Location</Text><Switch value={true} /></View>

            <Button title="Next" onPress={() => router.push('/(client)/intents/buy/step3')} />
            <Button title="Back" onPress={() => router.back()} />
        </View>
    );
}
