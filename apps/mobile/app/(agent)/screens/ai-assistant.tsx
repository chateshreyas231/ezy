import { View, Text, TextInput, Button, ScrollView } from 'react-native';

export default function AgentAIAssistant() {
    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <Text>AI Productivity Assistant</Text>
                <Text>AI: You have 3 follow-ups today.</Text>
                <Text>AI: Drafted message for John Doe.</Text>
            </ScrollView>

            <View style={{ flexDirection: 'row' }}>
                <TextInput placeholder="Ask AI..." style={{ flex: 1, borderWidth: 1 }} />
                <Button title="Send" onPress={() => { }} />
            </View>
        </View>
    );
}
