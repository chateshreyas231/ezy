// app/chat/conversation.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import SafeScreen from '../../components/ui/SafeScreen';
import {
  getConversationMessages,
  getOrCreateConversation,
  sendConversationMessage,
} from '../../services/conversationService';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../services/supabaseClient';
import type { ConversationMessage } from '../../src/types/types';

export default function ConversationScreen() {
  const { conversationId, listingId } = useLocalSearchParams<{ conversationId?: string; listingId?: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [listingInfo, setListingInfo] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data));
  }, []);

  useEffect(() => {
    if (listingId && !conversationId) {
      // Create or get conversation for this listing
      createOrGetConversation();
    } else if (conversationId) {
      setCurrentConversationId(conversationId);
      loadConversation();
      setupRealtime();
    }
  }, [conversationId, listingId]);

  const createOrGetConversation = async () => {
    if (!listingId) return;
    
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        Alert.alert('Error', 'Please sign in to start a conversation');
        router.back();
        return;
      }

      // Get listing info
      const { data: listing } = await supabase
        .from('listing_posts')
        .select('*, agent:users!listing_posts_agent_id_fkey(id, name, email)')
        .eq('id', listingId)
        .single();

      if (listing) {
        setListingInfo(listing);
      }

      // Create or get conversation
      const conversation = await getOrCreateConversation(listingId, user.user.id);
      setCurrentConversationId(conversation.id);
      await loadConversationMessages(conversation.id);
      setupRealtimeForConversation(conversation.id);
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      Alert.alert('Error', error.message || 'Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (convId: string) => {
    try {
      const msgs = await getConversationMessages(convId);
      setMessages(msgs);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadConversation = async () => {
    if (!conversationId) return;
    try {
      await loadConversationMessages(conversationId);
      setupRealtimeForConversation(conversationId);
    } catch (error: any) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeForConversation = (convId: string) => {
    const channel = supabase
      .channel(`conversation:${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ConversationMessage]);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const setupRealtime = () => {
    if (!conversationId) return;
    setupRealtimeForConversation(conversationId);
  };

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    
    const convId = currentConversationId || conversationId;
    if (!convId) {
      Alert.alert('Error', 'Conversation not ready. Please try again.');
      return;
    }

    setSending(true);
    try {
      await sendConversationMessage(convId, messageText);
      setMessageText('');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeScreen>
    );
  }

  const convId = currentConversationId || conversationId;
  if (!convId) {
    return (
      <SafeScreen>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
          <AnimatedButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            size="medium"
            style={styles.backButton}
          />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <AnimatedButton
            title=""
            onPress={() => router.back()}
            variant="ghost"
            icon="arrow-back"
            size="small"
            style={styles.backButton}
          />
          <View style={styles.headerInfo}>
            {listingInfo && (
              <>
                <Text style={styles.headerTitle}>
                  {listingInfo.agent?.name || 'Listing Agent'}
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {listingInfo.address || listingInfo.city || 'Property'}
                </Text>
              </>
            )}
            {!listingInfo && (
              <Text style={styles.headerTitle}>Conversation</Text>
            )}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={Theme.colors.textTertiary} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                {listingInfo ? 'Start a conversation with the listing agent' : 'Start the conversation!'}
              </Text>
            </View>
          ) : (
            messages.map((message) => {
              const isMe = message.sender_id === currentUser?.user?.id;
              return (
                <View
                  key={message.id}
                  style={[styles.messageWrapper, isMe && styles.messageWrapperRight]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.messageBubbleSent : styles.messageBubbleReceived,
                    ]}
                  >
                    {message.message_label && (
                      <View style={styles.labelBadge}>
                        <Ionicons
                          name={
                            message.message_label === 'QUESTION'
                              ? 'help-circle-outline'
                              : message.message_label === 'SCHEDULING'
                              ? 'calendar-outline'
                              : message.message_label === 'OFFER'
                              ? 'document-text-outline'
                              : 'chatbubble-outline'
                          }
                          size={12}
                          color={isMe ? Theme.colors.textPrimary : Theme.colors.accent}
                        />
                        <Text
                          style={[
                            styles.labelText,
                            isMe && styles.labelTextSent,
                          ]}
                        >
                          {message.message_label}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        isMe && styles.messageTextSent,
                      ]}
                    >
                      {message.message_text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isMe && styles.messageTimeSent,
                      ]}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder={listingInfo ? "Message the listing agent..." : "Type a message..."}
              placeholderTextColor={Theme.colors.textTertiary}
              multiline
              style={styles.input}
            />
            <AnimatedButton
              title=""
              onPress={handleSend}
              disabled={!messageText.trim() || sending}
              variant="primary"
              icon={sending ? undefined : 'send'}
              loading={sending}
              size="small"
              style={styles.sendButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  errorText: {
    ...Theme.typography.body,
    color: Theme.colors.error,
    marginBottom: Theme.spacing.lg,
  },
  backButton: {
    minWidth: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  headerSubtitle: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  headerSpacer: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Theme.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  emptyText: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtext: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  messageWrapper: {
    marginBottom: Theme.spacing.md,
    alignItems: 'flex-start',
  },
  messageWrapperRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
  },
  messageBubbleSent: {
    backgroundColor: Theme.colors.accent,
    borderBottomRightRadius: Theme.borderRadius.sm,
  },
  messageBubbleReceived: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderBottomLeftRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  labelText: {
    ...Theme.typography.caption,
    color: Theme.colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  labelTextSent: {
    color: Theme.colors.textPrimary,
  },
  messageText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  messageTextSent: {
    color: Theme.colors.textPrimary,
  },
  messageTime: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontSize: 10,
  },
  messageTimeSent: {
    color: Theme.colors.textPrimary,
    opacity: 0.8,
  },
  inputContainer: {
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sendButton: {
    minWidth: 48,
    height: 48,
    borderRadius: 24,
  },
});
