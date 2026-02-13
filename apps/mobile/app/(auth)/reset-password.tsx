import { View, Text, TextInput, Button } from 'react-native';

export default function ResetPassword() {
    return (
        <View>
            <Text>Reset Password</Text>
            <TextInput placeholder="Email" />
            <Button title="Send Reset Link" onPress={() => console.log('Reset')} />
        </View>
    );
}
