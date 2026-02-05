import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSwipes } from '../../lib/hooks/useSwipes';
import { Swipe } from '@shared/types';

export default function ArchivedScreen() {
  const [archived, setArchived] = useState<Swipe[]>([]);
  const { fetchArchived } = useSwipes();

  useEffect(() => {
    loadArchived();
  }, []);

  const loadArchived = async () => {
    try {
      const archivedData = await fetchArchived();
      setArchived(archivedData);
    } catch (error) {
      console.error('Failed to load archived:', error);
    }
  };

  const renderArchived = ({ item }: { item: Swipe }) => (
    <View style={styles.archivedCard}>
      <Text style={styles.archivedType}>
        {item.target_type === 'listing' ? 'Listing' : 'Buyer Intent'}
      </Text>
      <Text style={styles.archivedDirection}>
        {item.direction === 'no' ? 'Passed' : 'Liked'}
      </Text>
      <Text style={styles.archivedDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Archived</Text>
      {archived.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No archived items</Text>
        </View>
      ) : (
        <FlatList
          data={archived}
          renderItem={renderArchived}
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
  archivedCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  archivedType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  archivedDirection: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  archivedDate: {
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
  },
});

