// app/deal-room/[matchId].tsx
// Deal Room screen with Chat, Tasks, and Docs tabs

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

type Tab = 'chat' | 'tasks' | 'docs';

interface Message {
  id: string;
  content: string;
  sender_profile_id: string;
  created_at: string;
  sender?: {
    display_name: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'doing' | 'done';
  due_at: string | null;
  assignee_profile_id: string | null;
}

export default function DealRoomScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [loading, setLoading] = useState(true);
  const [dealRoom, setDealRoom] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    loadDealRoom();
  }, [matchId]);

  useEffect(() => {
    if (dealRoom?.conversation_id) {
      loadMessages();
      subscribeToMessages();
    }
  }, [dealRoom]);

  useEffect(() => {
    if (dealRoom?.id) {
      loadTasks();
      subscribeToTasks();
    }
  }, [dealRoom, activeTab]);

  const loadDealRoom = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          deal_room:deal_rooms(
            id,
            status,
            conversation:conversations(id)
          ),
          listing:listings(*)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;
      setDealRoom({
        ...data,
        conversation_id: data.deal_room?.[0]?.conversation?.[0]?.id,
      });
    } catch (error: any) {
      console.error('Failed to load deal room:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!dealRoom?.conversation_id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_profile_id_fkey(display_name)
        `)
        .eq('conversation_id', dealRoom.conversation_id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!dealRoom?.conversation_id) return;

    const subscription = supabase
      .channel(`messages:${dealRoom.conversation_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${dealRoom.conversation_id}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const loadTasks = async () => {
    if (!dealRoom?.id) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('deal_room_id', dealRoom.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
    }
  };

  const subscribeToTasks = () => {
    if (!dealRoom?.id) return;

    const subscription = supabase
      .channel(`tasks:${dealRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `deal_room_id=eq.${dealRoom.id}`,
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !dealRoom?.conversation_id || !authUser) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: dealRoom.conversation_id,
        sender_profile_id: authUser.id,
        content: messageText.trim(),
      });

      if (error) throw error;
      setMessageText('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'todo' ? 'doing' : currentStatus === 'doing' ? 'done' : 'todo';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to update task:', error);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deal Room</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TabButton
            label="Chat"
            icon="chatbubbles"
            active={activeTab === 'chat'}
            onPress={() => setActiveTab('chat')}
          />
          <TabButton
            label="Tasks"
            icon="checkmark-circle"
            active={activeTab === 'tasks'}
            onPress={() => setActiveTab('tasks')}
          />
          <TabButton
            label="Docs"
            icon="document-text"
            active={activeTab === 'docs'}
            onPress={() => setActiveTab('docs')}
          />
        </View>

        {/* Content */}
        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              renderItem={({ item }) => (
                <MessageBubble
                  message={item}
                  isOwn={item.sender_profile_id === authUser?.id}
                />
              )}
            />
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message..."
                placeholderTextColor={Theme.colors.textTertiary}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!messageText.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={messageText.trim() ? Theme.colors.accent : Theme.colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'tasks' && (
          <ScrollView style={styles.tasksContainer} contentContainerStyle={styles.tasksList}>
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={64} color={Theme.colors.textTertiary} />
                <Text style={styles.emptyText}>No tasks yet</Text>
              </View>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskStatus(task.id, task.status)}
                />
              ))
            )}
          </ScrollView>
        )}

        {activeTab === 'docs' && (
          <View style={styles.docsContainer}>
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={Theme.colors.textTertiary} />
              <Text style={styles.emptyText}>Documents coming soon</Text>
            </View>
          </View>
        )}
      </View>
    </SafeScreen>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? Theme.colors.accent : Theme.colors.textTertiary}
      />
      <Text
        style={[
          styles.tabLabel,
          active && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
      <Text style={styles.messageSender}>
        {message.sender?.display_name || 'Unknown'}
      </Text>
      <Text style={styles.messageContent}>{message.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(message.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const statusColors = {
    todo: Theme.colors.textTertiary,
    doing: Theme.colors.warning,
    done: Theme.colors.success,
  };

  return (
    <AnimatedCard style={styles.taskCard}>
      <TouchableOpacity onPress={onToggle} style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Ionicons
            name={task.status === 'done' ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={statusColors[task.status]}
          />
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.description && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}
            {task.due_at && (
              <Text style={styles.taskDue}>
                Due: {new Date(task.due_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.taskStatusBadge, { backgroundColor: statusColors[task.status] + '20' }]}>
          <Text style={[styles.taskStatusText, { color: statusColors[task.status] }]}>
            {task.status.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
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
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Theme.colors.accent,
  },
  tabLabel: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textTertiary,
  },
  tabLabelActive: {
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: Theme.spacing.md,
  },
  messageBubble: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    maxWidth: '80%',
  },
  messageBubbleOwn: {
    backgroundColor: Theme.colors.accent + '20',
    alignSelf: 'flex-end',
  },
  messageSender: {
    ...Theme.typography.caption,
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.xs,
    fontWeight: '600',
  },
  messageContent: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  messageTime: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontSize: 10,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  tasksContainer: {
    flex: 1,
  },
  tasksList: {
    padding: Theme.spacing.md,
  },
  taskCard: {
    marginBottom: Theme.spacing.md,
  },
  taskContent: {
    padding: Theme.spacing.lg,
  },
  taskHeader: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
  },
  taskInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  taskTitle: {
    ...Theme.typography.h4,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  taskDescription: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  taskDue: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  taskStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  taskStatusText: {
    ...Theme.typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  docsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
});

