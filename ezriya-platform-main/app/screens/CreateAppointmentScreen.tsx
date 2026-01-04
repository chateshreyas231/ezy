// app/screens/CreateAppointmentScreen.tsx
// Schedule appointment
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
import { createAppointment } from '../../services/scheduleService';

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const { matchId, offerRoomId } = useLocalSearchParams<{ matchId?: string; offerRoomId?: string }>();
  const [saving, setSaving] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async () => {
    if (!scheduledTime) {
      Alert.alert('Error', 'Please enter scheduled time');
      return;
    }

    try {
      setSaving(true);
      await createAppointment({
        related_match_id: matchId || undefined,
        offer_room_id: offerRoomId || undefined,
        scheduled_time: scheduledTime,
        location: location || undefined,
      });
      Alert.alert('Success', 'Appointment created', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create appointment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
        Create Appointment
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Scheduled Time *</Text>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          Format: YYYY-MM-DDTHH:MM:SS (e.g., 2026-02-01T14:00:00)
        </Text>
        <TextInput
          value={scheduledTime}
          onChangeText={setScheduledTime}
          placeholder="2026-02-01T14:00:00"
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontWeight: '500' }}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Meeting location or address"
          multiline
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, minHeight: 80 }}
        />
      </View>

      {matchId && (
        <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Related Match: {matchId}</Text>
        </View>
      )}

      {offerRoomId && (
        <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Offer Room: {offerRoomId}</Text>
        </View>
      )}

      <Button
        title={saving ? 'Creating...' : 'Create Appointment'}
        onPress={handleSubmit}
        disabled={saving || !scheduledTime}
      />
    </ScrollView>
  );
}

