// app/screens/OfferRoomScreen.tsx
// Full offer room UI with messages, intent, and compensation
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
import { getOfferRoomForMatch } from '../../services/offerRoomsService';
import { getMessages, sendMessage } from '../../services/messagesService';
import { getIntentEntries, createIntent } from '../../services/intentService';
import { getCompensationDeclarations, createCompensation } from '../../services/compensationService';
import { useUser } from '../context/UserContext';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import type { OfferRoom, Message, IntentEntry, CompensationDeclaration } from '../../src/types/types';

export default function OfferRoomScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [offerRoom, setOfferRoom] = useState<OfferRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [intents, setIntents] = useState<IntentEntry[]>([]);
  const [compensations, setCompensations] = useState<CompensationDeclaration[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'intent' | 'compensation'>('messages');
  const [intentText, setIntentText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [compensationRole, setCompensationRole] = useState('');
  const [compensationDesc, setCompensationDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const room = await getOfferRoomForMatch(matchId);
      if (!room) {
        Alert.alert('Error', 'Offer room not found');
        setLoading(false);
        return;
      }

      setOfferRoom(room);

      const [messagesData, intentsData, compensationsData] = await Promise.all([
        getMessages(room.id),
        getIntentEntries(room.id),
        getCompensationDeclarations(room.id),
      ]);

      setMessages(messagesData);
      setIntents(intentsData);
      setCompensations(compensationsData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load offer room');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!offerRoom) return;

    try {
      await sendMessage({
        offer_room_id: offerRoom.id,
        message_text: messageText,
      });
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
    }
  };

  const handleCreateIntent = async () => {
    if (!offerRoom) return;

    try {
      setSaving(true);
      await createIntent({
        offer_room_id: offerRoom.id,
        intent_text: intentText || undefined,
        offer_amount: offerAmount ? parseFloat(offerAmount) : undefined,
      });
      setIntentText('');
      setOfferAmount('');
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create intent');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCompensation = async () => {
    if (!offerRoom || !compensationRole) {
      Alert.alert('Error', 'Please enter a role');
      return;
    }

    try {
      setSaving(true);
      await createCompensation({
        offer_room_id: offerRoom.id,
        role: compensationRole,
        description: compensationDesc || undefined,
      });
      setCompensationRole('');
      setCompensationDesc('');
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create compensation declaration');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [matchId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!offerRoom) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Offer room not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', padding: 16, gap: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
        <Button
          title="Messages"
          onPress={() => setActiveTab('messages')}
          color={activeTab === 'messages' ? '#007AFF' : '#ccc'}
        />
        <Button
          title="Intent"
          onPress={() => setActiveTab('intent')}
          color={activeTab === 'intent' ? '#007AFF' : '#ccc'}
        />
        <Button
          title="Compensation"
          onPress={() => setActiveTab('compensation')}
          color={activeTab === 'compensation' ? '#007AFF' : '#ccc'}
        />
      </View>

      {activeTab === 'messages' && (
        <View style={{ flex: 1 }}>
          <MessageList messages={messages} />
          <MessageInput offerRoomId={offerRoom.id} onMessageSent={loadData} />
        </View>
      )}

      {activeTab === 'intent' && (
        <ScrollView style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Intent Entries</Text>

          {intents.map((intent) => (
            <View key={intent.id} style={{ padding: 16, marginBottom: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              {intent.intent_text && <Text style={{ marginBottom: 4 }}>{intent.intent_text}</Text>}
              {intent.offer_amount && (
                <Text style={{ fontWeight: '600', fontSize: 18 }}>
                  ${intent.offer_amount.toLocaleString()}
                </Text>
              )}
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {new Date(intent.created_at).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={{ marginTop: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
            <Text style={{ fontWeight: '600', marginBottom: 12 }}>Create Intent Entry</Text>
            <TextInput
              value={intentText}
              onChangeText={setIntentText}
              placeholder="Intent description"
              multiline
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12, minHeight: 80 }}
            />
            <TextInput
              value={offerAmount}
              onChangeText={setOfferAmount}
              placeholder="Offer amount"
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 }}
            />
            <Button
              title={saving ? 'Creating...' : 'Create Intent'}
              onPress={handleCreateIntent}
              disabled={saving}
            />
          </View>
        </ScrollView>
      )}

      {activeTab === 'compensation' && (
        <ScrollView style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Compensation Declarations</Text>

          {compensations.map((comp) => (
            <View key={comp.id} style={{ padding: 16, marginBottom: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <Text style={{ fontWeight: '600', marginBottom: 4 }}>Role: {comp.role}</Text>
              {comp.description && <Text style={{ marginTop: 4 }}>{comp.description}</Text>}
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {new Date(comp.created_at).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={{ marginTop: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
            <Text style={{ fontWeight: '600', marginBottom: 12 }}>Create Compensation Declaration</Text>
            <TextInput
              value={compensationRole}
              onChangeText={setCompensationRole}
              placeholder="Role (e.g., buyerAgent, listingAgent)"
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 }}
            />
            <TextInput
              value={compensationDesc}
              onChangeText={setCompensationDesc}
              placeholder="Compensation description (e.g., I expect 2.5% buyer agent comp)"
              multiline
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12, minHeight: 80 }}
            />
            <Button
              title={saving ? 'Creating...' : 'Create Declaration'}
              onPress={handleCreateCompensation}
              disabled={saving || !compensationRole}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

