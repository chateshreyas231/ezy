// app/(tabs)/inbox.tsx
// Inbox screen - shows all conversations

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

interface Conversation {
  id: string;
  deal_room_id: string;
  created_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_profile_id: string;
  };
  deal_room?: {
    match_id: string;
    status: string;
    match?: {
      listing_id: string;
      listing?: {
        title: string;
        price: number;
      };
    };
  };
}

export default function InboxScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [authUser]);

  const loadConversations = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      
      // Get deal rooms user is part of
      const { data: dealRooms, error: dealRoomsError } = await supabase
        .from('deal_participants')
        .select('deal_room_id')
        .eq('profile_id', authUser.id);

      if (dealRoomsError) throw dealRoomsError;

      const dealRoomIds = dealRooms?.map(dr => dr.deal_room_id) || [];

      if (dealRoomIds.length === 0) {
        setConversations([]);
        return;
      }

      // Get conversations for these deal rooms
      const { data: convos, error } = await supabase
        .from('conversations')
        .select(`
          *,
          deal_room:deal_rooms(
            match_id,
            status,
            match:matches(
              listing_id,
              listing:listings(id, title, price)
            )
          )
        `)
        .in('deal_room_id', dealRoomIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get last message for each conversation
      const conversationsWithMessages: Conversation[] = [];
      for (const convo of convos || []) {
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convo.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        conversationsWithMessages.push({
          ...convo,
          last_message: messages || undefined,
        });
      }

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inbox</Text>
            <Text style={styles.subtitle}>
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search-outline" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No conversations</Text>
            <Text style={styles.emptySubtitle}>
              Start matching to begin conversations!
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <AnimatedCard delay={index * 50} style={styles.conversationCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/deal-room/${item.deal_room?.match_id}`)}
                  style={styles.conversationContent}
                >
                  <View style={styles.conversationHeader}>
                    <View style={styles.conversationIcon}>
                      <Ionicons name="chatbubble" size={24} color={Theme.colors.accent} />
                    </View>
                    <View style={styles.conversationInfo}>
                      <Text style={styles.conversationTitle}>
                        {item.deal_room?.match?.listing?.title || 'Property Conversation'}
                      </Text>
                      {item.deal_room?.match?.listing?.price && (
                        <Text style={styles.conversationPrice}>
                          ${item.deal_room.match.listing.price.toLocaleString()}
                        </Text>
                      )}
                      {item.last_message && (
                        <Text style={styles.lastMessage} numberOfLines={1}>
                          {item.last_message.content}
                        </Text>
                      )}
                    </View>
                    {item.last_message && (
                      <Text style={styles.messageTime}>
                        {new Date(item.last_message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </AnimatedCard>
            )}
          />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.md,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
  },
  list: {
    padding: Theme.spacing.md,
  },
  conversationCard: {
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.lg,
  },
  conversationContent: {
    padding: Theme.spacing.lg,
  },
  conversationHeader: {
    flexDirection: 'row',
  },
  conversationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  conversationPrice: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.xs,
  },
  lastMessage: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
  },
  messageTime: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});

