import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useRouter } from 'expo-router';
import { GlassLayout } from '../../../components/ui/GlassLayout';
import { GlassButton } from '../../../components/glass/GlassButton'; // Reusing if available, otherwise use TouchableOpacity style
import { Ionicons } from '@expo/vector-icons';

export default function AgentProfile() {
    const { signOut, profile } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.replace('/(auth)/role-selection');
    };

    return (
        <GlassLayout>
            <View style={styles.container}>
                <Text style={styles.header}>Agent Profile</Text>

                <View style={styles.card}>
                    <View style={styles.avatar} />
                    <View>
                        <Text style={styles.name}>{profile?.display_name || 'Agent User'}</Text>
                        <Text style={styles.subText}>XYZ Realty | License #12345</Text>
                        <Text style={styles.statText}>45 Deals Closed</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Management</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(agent)/(tabs)/clients')}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="people" size={20} color="white" />
                        </View>
                        <Text style={styles.menuText}>Clients Database</Text>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(agent)/(tabs)/listings')}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="home" size={20} color="white" />
                        </View>
                        <Text style={styles.menuText}>My Listings</Text>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(agent)/(tabs)/reels')}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="videocam" size={20} color="white" />
                        </View>
                        <Text style={styles.menuText}>Content Reels</Text>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { }}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="settings-outline" size={20} color="white" />
                        </View>
                        <Text style={styles.menuText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
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
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    card: {
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    subText: {
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    statText: {
        color: '#2F5CFF',
        fontWeight: 'bold',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    menuIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    signOutButton: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    signOutText: {
        color: '#FF4444',
        fontWeight: 'bold',
    },
});
