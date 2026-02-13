import { View, Text, TextInput, Switch, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function SellStep3() {
    const router = useRouter();

    return (
        <View>
            <Text>Selling Intent - Step 3: Pricing & Condition</Text>
            <TextInput placeholder="Ask Price / Range" />
            <Button title="Ask AI to Estimate" onPress={() => { }} />

            <View><Text>Opt-in for 3D Tour</Text><Switch value={false} /></View>
            <View><Text>Opt-in for Staging</Text><Switch value={false} /></View>

            <Button title="Next" onPress={() => router.push('/(client)/intents/sell/step4')} />
            <Button title="Back" onPress={() => router.back()} />
        </View>
    );
}
