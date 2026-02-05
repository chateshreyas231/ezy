// app/screens/ScanQRCodeScreen.tsx
// QR scanner for check-in
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
import { getAppointmentByQRToken } from '../../services/scheduleService';
import { createCheckin } from '../../services/checkinService';

export default function ScanQRCodeScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [qrToken, setQrToken] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [appointmentFound, setAppointmentFound] = useState(false);

  const handleScan = async () => {
    if (!qrToken.trim()) {
      Alert.alert('Error', 'Please enter QR token');
      return;
    }

    try {
      setCheckingIn(true);
      const appointment = await getAppointmentByQRToken(qrToken.trim());
      if (!appointment) {
        Alert.alert('Error', 'Appointment not found for this QR token');
        setCheckingIn(false);
        return;
      }

      setAppointmentFound(true);

      // Create check-in
      await createCheckin({
        appointment_id: appointment.id,
      });

      Alert.alert('Success', 'Checked in successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
        QR Code Check-In
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>QR Token</Text>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          Enter the QR token from the appointment
        </Text>
        <TextInput
          value={qrToken}
          onChangeText={setQrToken}
          placeholder="Enter QR token"
          autoCapitalize="none"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      {appointmentId && (
        <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Appointment ID: {appointmentId}</Text>
        </View>
      )}

      <Button
        title={checkingIn ? 'Checking In...' : 'Check In'}
        onPress={handleScan}
        disabled={checkingIn || !qrToken.trim()}
      />

      <View style={{ marginTop: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Note: In production, this would use a camera-based QR scanner. For MVP, manual token entry is supported.
        </Text>
      </View>
    </ScrollView>
  );
}

