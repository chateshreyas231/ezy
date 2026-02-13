import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function BuyStep1() {
    const router = useRouter();

    return (
        <View>
            <Text>Buying Intent - Step 1: Basics</Text>
            <TextInput placeholder="Property Type (e.g. Apartment)" />
            <TextInput placeholder="Location" />
            <TextInput placeholder="Budget Range" />
            <TextInput placeholder="Bedrooms/Bathrooms" />
            <TextInput placeholder="Timeline" />

            <Button title="Next" onPress={() => router.push('/(client)/intents/buy/step2')} />
        </View>
    );
}
