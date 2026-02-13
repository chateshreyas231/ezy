import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface GlassActionModalProps {
    visible: boolean;
    onClose: () => void;
    actions: {
        icon: keyof typeof Ionicons.glyphMap;
        label: string;
        onPress: () => void;
    }[];
}

export const GlassActionModal: React.FC<GlassActionModalProps> = ({ visible, onClose, actions }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

                <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />

                <View style={styles.content}>
                    <View style={styles.actionsContainer}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionItem}
                                onPress={() => {
                                    action.onPress();
                                    onClose();
                                }}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={action.icon} size={28} color="#FFF" />
                                </View>
                                <Text style={styles.label}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={32} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        width: '100%',
        paddingBottom: 50,
        alignItems: 'center',
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 20,
    },
    actionItem: {
        alignItems: 'center',
        width: 80,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2F5CFF', // Ezriya Blue
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#2F5CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    closeButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
});
