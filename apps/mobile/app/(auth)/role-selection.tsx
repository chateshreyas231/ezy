import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function RoleSelection() {
    const router = useRouter();

    return (
        <View>
            <Text>User Role Selection</Text>

            <View>
                <Text>I'm a Client</Text>
                <Button
                    title="Client Login / Signup"
                    onPress={() => router.push('/(auth)/client/login')}
                />
            </View>

            <View>
                <Text>I'm an Agent</Text>
                <Button
                    title="Agent Login / Signup"
                    onPress={() => router.push('/(auth)/agent/login')}
                />
            </View>

            <Button
                title="I do both (Client & Agent)"
                onPress={() => router.push('/(auth)/client/signup')}
            />
        </View>
    );
}
