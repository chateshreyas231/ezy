// app/screens/AppointmentDetailScreen.tsx
// Show appointment + QR code
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, Text, View } from 'react-native';
import { getAppointmentById } from '../../services/scheduleService';
import { getCheckinsForAppointment, hasCheckedIn } from '../../services/checkinService';
import { Theme } from '../../constants/Theme';
import type { Appointment, Checkin } from '../../src/types/types';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [userCheckedIn, setUserCheckedIn] = useState(false);

  const loadData = async () => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [appointmentData, checkinsData, userCheckedInData] = await Promise.all([
        getAppointmentById(appointmentId),
        getCheckinsForAppointment(appointmentId),
        hasCheckedIn(appointmentId),
      ]);

      setAppointment(appointmentData);
      setCheckins(checkinsData);
      setUserCheckedIn(userCheckedInData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [appointmentId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Appointment not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
        Appointment Details
      </Text>

      <View style={{ marginBottom: 20, padding: 16, backgroundColor: Theme.colors.surface, borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Scheduled Time
        </Text>
        <Text>{new Date(appointment.scheduled_time).toLocaleString()}</Text>
      </View>

      {appointment.location && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Location
          </Text>
          <Text>{appointment.location}</Text>
        </View>
      )}

      {appointment.qr_token && (
        <View style={{ marginBottom: 20, padding: 16, backgroundColor: Theme.colors.surface, borderRadius: 8, borderWidth: 2, borderColor: Theme.colors.accent }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
            QR Code Token
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 8 }}>
            {appointment.qr_token}
          </Text>
          <Text style={{ fontSize: 12, color: Theme.colors.textTertiary, textAlign: 'center' }}>
            Share this token for check-in
          </Text>
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Check-ins
        </Text>
        {checkins.length > 0 ? (
          checkins.map((checkin) => (
            <View key={checkin.id} style={{ padding: 12, marginBottom: 8, backgroundColor: Theme.colors.surfaceElevated, borderRadius: 8 }}>
              <Text style={{ fontWeight: '600' }}>User: {checkin.user_id}</Text>
              <Text style={{ color: Theme.colors.textTertiary }}>
                Checked in: {new Date(checkin.checked_in_at).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: Theme.colors.textTertiary }}>No check-ins yet</Text>
        )}
      </View>

      {userCheckedIn && (
        <View style={{ marginBottom: 20, padding: 16, backgroundColor: '#d4edda', borderRadius: 8 }}>
          <Text style={{ fontWeight: '600', color: '#155724' }}>✓ You have checked in</Text>
        </View>
      )}

      <Button
        title="Scan QR Code to Check In"
        onPress={() => router.push(`/screens/ScanQRCodeScreen?appointmentId=${appointmentId}`)}
      />
    </ScrollView>
  );
}

