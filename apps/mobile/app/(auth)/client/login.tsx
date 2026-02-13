import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function ClientLogin() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // Mock login for now or attach to real auth
        await signIn(email, password);
        router.replace('/(client)/(tabs)');
    };

    return (
        <View>
            <Text>Client Login</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <Button title="Login" onPress={handleLogin} />
            <Button title="Forgot Password?" onPress={() => router.push('/(auth)/reset-password')} />
            <Button title="Create Account" onPress={() => router.push('/(auth)/client/signup')} />
        </View>
    );
}
