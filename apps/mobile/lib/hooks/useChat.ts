import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { Message } from '@shared/types';

interface UseChatOptions {
  dealRoomId: string;
}

export function useChat({ dealRoomId }: UseChatOptions) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load or create conversation
  const loadOrCreateConversation = useCallback(async () => {
    if (!dealRoomId || !user) return;

    try {
      // Try to find existing conversation
      const { data: existingConv, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .eq('deal_room_id', dealRoomId)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding conversation:', findError);
        throw findError;
      }

      if (existingConv) {
        setConversationId(existingConv.id);
        return existingConv.id;
      }

      // Create new conversation if it doesn't exist
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({ deal_room_id: dealRoomId })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw createError;
      }

      if (newConv) {
        setConversationId(newConv.id);
        return newConv.id;
      }
    } catch (err: any) {
      console.error('Failed to load/create conversation:', err);
      setError(err);
      throw err;
    }
  }, [dealRoomId, user]);

  // Load messages
  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      setMessages(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err);
      setLoading(false);
    }
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Initialize conversation and load messages
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const convId = await loadOrCreateConversation();
        if (mounted && convId) {
          await loadMessages(convId);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [dealRoomId, loadOrCreateConversation, loadMessages]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!conversationId || !user || !content.trim()) {
      throw new Error('Cannot send message: missing conversation, user, or content');
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_profile_id: user.id,
        content: content.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversationId, user]);

  return {
    messages,
    conversationId,
    loading,
    error,
    sendMessage,
    refreshMessages: () => conversationId && loadMessages(conversationId),
  };
}
