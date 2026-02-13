import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function SellStep1() {
    const router = useRouter();

    return (
        <View>
            <Text>Selling Intent - Step 1: Property Basics</Text>
            <TextInput placeholder="Address" />
            <TextInput placeholder="Property Type" />
            <TextInput placeholder="Size / Beds / Baths" />

            <Button title="Next" onPress={() => router.push('/(client)/intents/sell/step2')} />
        </View>
    );
}
