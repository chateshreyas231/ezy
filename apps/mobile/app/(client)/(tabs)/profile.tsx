import { View, Text, Button, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useRouter } from 'expo-router';
import { GlassLayout } from '../../../components/ui/GlassLayout';

export default function ClientProfile() {
    const { signOut, profile } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.replace('/(auth)/role-selection');
    };

    return (
        <GlassLayout>
            <View style={styles.container}>
                <Text style={styles.header}>Profile</Text>

                <View style={styles.profileCard}>
                    <View style={styles.avatar} />
                    <View>
                        <Text style={styles.name}>{profile?.display_name || 'User'}</Text>
                        <Text style={styles.role}>{profile?.role}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <View style={styles.row}>
                        <Text style={styles.rowText}>Buyer Mode</Text>
                        <Switch value={true} trackColor={{ false: "#767577", true: "#2F5CFF" }} />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.rowText}>Seller Mode</Text>
                        <Switch value={false} trackColor={{ false: "#767577", true: "#2F5CFF" }} />
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => { }}>
                    <Text style={styles.buttonText}>Manage Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.signOut]} onPress={handleSignOut}>
                    <Text style={[styles.buttonText, { color: '#FF4444' }]}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </GlassLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2F5CFF',
        marginRight: 15,
    },
    name: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    role: {
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 15,
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    rowText: {
        color: 'white',
        fontSize: 16,
    },
    button: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    signOut: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
    }
});
