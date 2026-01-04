// app/components/MessageInput.tsx
// Message input component
import React, { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';
import { sendMessage } from '../../services/messagesService';

interface MessageInputProps {
  offerRoomId: string;
  onMessageSent?: () => void;
}

export default function MessageInput({ offerRoomId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      await sendMessage({
        offer_room_id: offerRoomId,
        message_text: message.trim(),
      });
      setMessage('');
      onMessageSent?.();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderColor: '#eee' }}>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        multiline
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          maxHeight: 100,
        }}
      />
      <Button
        title={sending ? '...' : 'Send'}
        onPress={handleSend}
        disabled={sending || !message.trim()}
      />
    </View>
  );
}

