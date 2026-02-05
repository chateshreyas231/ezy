import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMatches } from '../../lib/hooks/useMatches';
import { Match } from '@shared/types';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const { fetchMatches } = useMatches();
  const router = useRouter();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const matchesData = await fetchMatches();
      setMatches(matchesData);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const handleMatchPress = (match: Match) => {
    router.push(`/deal/${match.id}`);
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleMatchPress(item)}
    >
      <Text style={styles.matchTitle}>Match #{item.id.slice(0, 8)}</Text>
      <Text style={styles.matchScore}>Score: {item.match_score}</Text>
      <Text style={styles.matchExplanation}>{item.explanation}</Text>
      <Text style={styles.matchDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>Start swiping to find matches!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
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
  matchCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchScore: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  matchExplanation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  matchDate: {
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

