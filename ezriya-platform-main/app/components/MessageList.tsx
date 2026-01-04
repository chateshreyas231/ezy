// app/components/MessageList.tsx
// Message display component
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useUser } from '../context/UserContext';
import type { Message } from '../../src/types/types';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useUser();

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isOwn = item.sender_id === user?.id;
        return (
          <View
            style={{
              padding: 12,
              marginVertical: 4,
              marginHorizontal: 12,
              backgroundColor: isOwn ? '#007AFF' : '#f0f0f0',
              borderRadius: 8,
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <Text style={{ color: isOwn ? '#fff' : '#000' }}>{item.message_text}</Text>
            <Text
              style={{
                fontSize: 10,
                color: isOwn ? '#fff' : '#666',
                marginTop: 4,
              }}
            >
              {new Date(item.created_at).toLocaleTimeString()}
            </Text>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#666' }}>No messages yet</Text>
        </View>
      }
    />
  );
}

