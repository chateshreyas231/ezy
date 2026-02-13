import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function AgentSignup() {
    const router = useRouter();
    const { signUp } = useAuth(); // Assuming signUp exists in useAuth hook
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        await signUp(email, password, { role: 'agent' });
        router.replace('/(agent)/(tabs)');
    };

    return (
        <View>
            <Text>Agent Signup</Text>
            <TextInput placeholder="Name" />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput placeholder="Brokerage Name" />

            <Button title="Sign Up" onPress={handleSignup} />
        </View>
    );
}
