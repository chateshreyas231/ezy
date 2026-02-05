import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/hooks/useAuth';
import { Task } from '@shared/types';
import { glassTokens } from '../src/ui';

interface EnhancedTasksTabProps {
  dealRoomId: string;
}

export function EnhancedTasksTab({ dealRoomId }: EnhancedTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadTasks();
    const cleanup = subscribeToTasks();
    return cleanup;
  }, [dealRoomId]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('deal_room_id', dealRoomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const subscribeToTasks = () => {
    const channel = supabase
      .channel(`enhanced-tasks:${dealRoomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `deal_room_id=eq.${dealRoomId}`,
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      console.error('Failed to update task:', error);
      return;
    }
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;

    const { error } = await supabase
      .from('tasks')
      .insert({
        deal_room_id: dealRoomId,
        assignee_profile_id: user?.id || null,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        status: 'todo',
      });

    if (error) {
      console.error('Failed to create task:', error);
      return;
    }

    setNewTitle('');
    setNewDescription('');
  };

  const renderTask = ({ item }: { item: Task }) => {
    const isAssignedToMe = item.assignee_profile_id === user?.id;

    return (
      <View style={[styles.taskCard, item.status === 'done' && styles.taskDone]}>
        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => isAssignedToMe && toggleTaskStatus(item)}
          activeOpacity={isAssignedToMe ? 0.7 : 1}
        >
          <View style={[styles.checkbox, item.status === 'done' && styles.checkboxChecked]}>
            {item.status === 'done' && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.taskTextContainer}>
            <Text style={[styles.taskTitle, item.status === 'done' && styles.taskTitleDone]}>
              {item.title}
            </Text>
            {item.description && <Text style={styles.taskDescription}>{item.description}</Text>}
            <Text style={styles.assigneeText}>
              {item.assignee_profile_id === user?.id ? 'Assigned to you' : 'Assigned'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="New task title"
          placeholderTextColor={glassTokens.colors.text.tertiary}
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.descriptionInput}
        placeholder="Description (optional)"
        placeholderTextColor={glassTokens.colors.text.tertiary}
        value={newDescription}
        onChangeText={setNewDescription}
        multiline
      />

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks yet</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tasksList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: glassTokens.colors.background.darkGrey,
    borderRadius: glassTokens.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: glassTokens.colors.text.primary,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: glassTokens.colors.background.darkGrey,
    borderRadius: glassTokens.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: glassTokens.colors.text.primary,
    marginBottom: 12,
    minHeight: 44,
  },
  addButton: {
    backgroundColor: glassTokens.colors.accent.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: glassTokens.radius.full,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tasksList: {
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  taskDone: {
    opacity: 0.6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  assigneeText: {
    marginTop: 6,
    fontSize: 12,
    color: glassTokens.colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: glassTokens.colors.text.tertiary,
  },
});

