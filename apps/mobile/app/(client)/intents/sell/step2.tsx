import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function SellStep2() {
    const router = useRouter();

    return (
        <View>
            <Text>Selling Intent - Step 2: Media & Floorplans</Text>
            <Button title="Upload Photos/Videos" onPress={() => { }} />
            <Text>AI Tip: Rough layouts work too!</Text>

            <Button title="Next" onPress={() => router.push('/(client)/intents/sell/step3')} />
            <Button title="Back" onPress={() => router.back()} />
        </View>
    );
}
