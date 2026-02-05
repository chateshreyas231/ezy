import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '../../lib/hooks/useConversations';
import { Conversation } from '@shared/types';

export default function InboxScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { fetchConversations } = useConversations();
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const conversationsData = await fetchConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/deal/${conversation.deal_room_id}`);
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => handleConversationPress(item)}
    >
      <Text style={styles.conversationId}>Deal Room: {item.deal_room_id.slice(0, 8)}</Text>
      <Text style={styles.conversationDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbox</Text>
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Matches will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  conversationCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

