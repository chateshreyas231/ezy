import { Stack } from 'expo-router';

export default function VendorLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Vendor Dashboard' }} />
        </Stack>
    );
}
