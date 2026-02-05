// app/screens/ActivityFeedScreen.tsx
// Display activity timeline
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';
import { Theme } from '../../constants/Theme';
import { getMyActivityLogs } from '../../services/activityLogService';
import type { ActivityLog } from '../../src/types/types';

export default function ActivityFeedScreen() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getMyActivityLogs(100);
      setActivities(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '600', fontSize: 16 }}>
              {item.action.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text style={{ marginTop: 4, color: Theme.colors.textTertiary }}>
              {item.entity_type}: {item.entity_id || 'N/A'}
            </Text>
            {Object.keys(item.meta).length > 0 && (
              <Text style={{ marginTop: 4, fontSize: 12, color: Theme.colors.textTertiary }}>
                {JSON.stringify(item.meta)}
              </Text>
            )}
            <Text style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: Theme.colors.textTertiary }}>No activities yet</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadActivities}
      />
    </View>
  );
}

