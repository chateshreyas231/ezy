import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/hooks/useAuth';
import { Task } from '@shared/types';

interface TasksTabProps {
  dealRoomId: string;
}

export function TasksTab({ dealRoomId }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadTasks();
    subscribeToTasks();
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
      .channel(`tasks:${dealRoomId}`)
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

  const renderTask = ({ item }: { item: Task }) => {
    const isAssignedToMe = item.assignee_profile_id === user?.id;

    return (
      <View style={[styles.taskCard, item.status === 'done' && styles.taskDone]}>
        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => toggleTaskStatus(item)}
          disabled={!isAssignedToMe}
        >
          <View style={[styles.checkbox, item.status === 'done' && styles.checkboxChecked]}>
            {item.status === 'done' && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.taskTextContainer}>
            <Text style={[styles.taskTitle, item.status === 'done' && styles.taskTitleDone]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={styles.taskDescription}>{item.description}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
  },
  tasksList: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

