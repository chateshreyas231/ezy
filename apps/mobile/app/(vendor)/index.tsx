import { View, Text, FlatList, Button } from 'react-native';
import { useAuth } from '../../lib/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function VendorDashboard() {
    const { signOut } = useAuth();
    const router = useRouter();

    const TASKS = [
        { id: 't1', title: 'Upload Inspection Report', due: 'Today' }
    ];

    return (
        <View>
            <Text>Vendor Dashboard</Text>
            <Text>Your Tasks</Text>
            <FlatList
                data={TASKS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text>{item.title}</Text>
                        <Text>Due: {item.due}</Text>
                    </View>
                )}
            />
            <Button title="Sign Out" onPress={async () => {
                await signOut();
                router.replace('/(auth)/role-selection');
            }} />
        </View>
    );
}
