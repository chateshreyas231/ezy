import { View, Text, TextInput, Button, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function ClientSignup() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isBoth, setIsBoth] = useState(false);

    const handleSignup = async () => {
        // Mock signup
        await signUp(email, password, { role: 'buyer' }); // Simplified role logic for now
        router.push('/(client)/(tabs)');
    };

    return (
        <View>
            <Text>Client Signup</Text>
            <TextInput placeholder="Name" />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <View>
                <Text>I am both buyer and seller</Text>
                <Switch value={isBoth} onValueChange={setIsBoth} />
            </View>

            <Button title="Sign Up" onPress={handleSignup} />
        </View>
    );
}
