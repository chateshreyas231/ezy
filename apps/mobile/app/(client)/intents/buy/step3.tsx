import { View, Text, Button, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function BuyStep3() {
    const router = useRouter();

    return (
        <View>
            <Text>Buying Intent - Step 3: Uploads & Notes</Text>
            <Button title="Upload References" onPress={() => { }} />
            <TextInput placeholder="Notes: What matters most?" multiline />
            <View><Text>Allow AI Auto-adjust</Text><Switch value={true} /></View>

            <Button title="Generate Intent Report" onPress={() => router.push('/(client)/intents/new-id-123')} />
            <Button title="Back" onPress={() => router.back()} />
        </View>
    );
}
