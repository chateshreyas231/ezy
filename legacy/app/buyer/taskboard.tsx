// app/buyer/taskboard.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { completeTask, getMyTasks } from '../../services/tasksService';
import type { Task } from '../../src/types/types';


export default function BuyerTaskBoardScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    try {
      const taskList = await getMyTasks();
      setTasks(taskList);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      await loadTasks();
    } catch (error: any) {
      console.error('Failed to complete task:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="checkmark-done-circle" size={32} color={Theme.colors.accent} />
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>Track your progress through the home buying process</Text>
        </View>

        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <AnimatedCard delay={100} style={styles.emptyCard}>
            <Ionicons name="clipboard-outline" size={64} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Tasks will appear here once you're in a deal
            </Text>
          </AnimatedCard>
        ) : (
          <>
            {pendingTasks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={20} color={Theme.colors.warning} />
                  <Text style={styles.sectionTitle}>To Do ({pendingTasks.length})</Text>
                </View>
                {pendingTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={() => handleCompleteTask(task.id)}
                    delay={index * 50}
                  />
                ))}
              </View>
            )}

            {completedTasks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
                  <Text style={styles.sectionTitle}>Completed ({completedTasks.length})</Text>
                </View>
                {completedTasks.map((task, index) => (
                  <AnimatedCard key={task.id} delay={index * 50} style={styles.completedTaskCard}>
                    <View style={styles.taskContent}>
                      <View style={styles.checkboxCompleted}>
                        <Ionicons name="checkmark" size={16} color={Theme.colors.textPrimary} />
                      </View>
                      <Text style={styles.taskTitleCompleted}>{task.title}</Text>
                    </View>
                  </AnimatedCard>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </SafeScreen>
  );
}

function TaskItem({ task, onComplete, delay }: { task: Task; onComplete: () => void; delay: number }) {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      onComplete();
    }, 150);
  };

  return (
    <AnimatedCard delay={delay} style={styles.taskCard}>
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.9}
        style={[styles.taskItem, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      >
        <View style={styles.taskContent}>
          <View style={styles.checkbox}>
            <Ionicons name="ellipse-outline" size={20} color={Theme.colors.accent} />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.description && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}
            <View style={styles.taskMeta}>
              {task.due_at && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Theme.colors.textTertiary} />
                  <Text style={styles.metaText}>
                    Due: {new Date(task.due_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {task.ai_generated && (
                <View style={styles.metaItem}>
                  <Ionicons name="sparkles-outline" size={14} color={Theme.colors.accent} />
                  <Text style={[styles.metaText, styles.aiBadge]}>AI Generated</Text>
                </View>
              )}
            </View>
          </View>
          <AnimatedButton
            title=""
            onPress={onComplete}
            variant="ghost"
            icon="checkmark-circle-outline"
            size="small"
            style={styles.completeButton}
          />
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
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
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    marginTop: Theme.spacing.xxl,
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
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  taskCard: {
    marginBottom: Theme.spacing.md,
    padding: 0,
  },
  taskItem: {
    padding: Theme.spacing.md,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.md,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    fontWeight: '500',
    marginBottom: Theme.spacing.xs,
  },
  taskTitleCompleted: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  metaText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  aiBadge: {
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  completeButton: {
    minWidth: 40,
  },
  completedTaskCard: {
    marginBottom: Theme.spacing.sm,
    opacity: 0.7,
  },
});
