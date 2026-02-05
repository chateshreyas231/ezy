import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../lib/hooks/useAuth';
import { useChat } from '../lib/hooks/useChat';
import { Message } from '@shared/types';
import { Ionicons } from '@expo/vector-icons';
import { glassTokens } from '../src/ui';

interface ChatTabProps {
  dealRoomId: string;
}

export function ChatTab({ dealRoomId }: ChatTabProps) {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useChat({ dealRoomId });
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Could show an error toast here
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_profile_id === user?.id;

    return (
      <View style={[styles.messageContainer, isOwn && styles.ownMessage]}>
        <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
          {String(item.content || '')}
        </Text>
        <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
          {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading conversation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>Error loading conversation: {error.message}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.emptyMessagesList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={glassTokens.colors.text.tertiary} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={glassTokens.colors.text.tertiary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={newMessage.trim() ? '#fff' : glassTokens.colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: glassTokens.colors.background.white,
  },
  messagesList: {
    padding: glassTokens.spacing.md,
    paddingBottom: glassTokens.spacing.lg,
  },
  emptyMessagesList: {
    flexGrow: 1,
  },
  messageContainer: {
    backgroundColor: glassTokens.colors.background.darkGrey,
    borderRadius: glassTokens.radius.lg,
    padding: glassTokens.spacing.md,
    marginBottom: glassTokens.spacing.sm,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  ownMessage: {
    backgroundColor: glassTokens.colors.accent.primary,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    lineHeight: glassTokens.typography.fontSize.base * glassTokens.typography.lineHeight.normal,
  },
  ownMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.tertiary,
    marginTop: glassTokens.spacing.xs,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: glassTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: glassTokens.colors.background.white,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: glassTokens.colors.background.darkGrey,
    borderRadius: glassTokens.radius.xl,
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.sm,
    marginRight: glassTokens.spacing.sm,
    maxHeight: 100,
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
  },
  sendButton: {
    backgroundColor: glassTokens.colors.accent.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: glassTokens.colors.background.darkGrey,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: glassTokens.spacing.xl,
  },
  emptyText: {
    fontSize: glassTokens.typography.fontSize.lg,
    color: glassTokens.colors.text.secondary,
    marginTop: glassTokens.spacing.md,
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
  emptySubtext: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    marginTop: glassTokens.spacing.xs,
  },
  errorText: {
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.accent.error,
    textAlign: 'center',
  },
});

