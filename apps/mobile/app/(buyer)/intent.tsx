import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useIntent } from '../../lib/hooks/useIntent';

export default function BuyerIntentScreen() {
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bedsMin, setBedsMin] = useState('');
  const [bathsMin, setBathsMin] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState('');
  const [dealbreakers, setDealbreakers] = useState('');
  const [loading, setLoading] = useState(false);
  const { createIntent } = useIntent();
  const router = useRouter();

  const propertyTypeOptions = ['house', 'condo', 'townhouse', 'apartment', 'land'];

  const togglePropertyType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter(t => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const handleSubmit = async () => {
    if (!budgetMin || !budgetMax || !bedsMin || !bathsMin) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createIntent({
        budget_min: parseInt(budgetMin),
        budget_max: parseInt(budgetMax),
        beds_min: parseInt(bedsMin),
        baths_min: parseInt(bathsMin),
        property_types: propertyTypes,
        must_haves: mustHaves.split(',').map(s => s.trim()).filter(Boolean),
        dealbreakers: dealbreakers.split(',').map(s => s.trim()).filter(Boolean),
        areas: [],
        commute_anchors: [],
      });
      router.replace('/(tabs)/feed');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create intent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>What are you looking for?</Text>

      <Text style={styles.label}>Budget Range</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Min ($)"
          value={budgetMin}
          onChangeText={setBudgetMin}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Max ($)"
          value={budgetMax}
          onChangeText={setBudgetMax}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Bedrooms (min)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 2"
        value={bedsMin}
        onChangeText={setBedsMin}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Bathrooms (min)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1"
        value={bathsMin}
        onChangeText={setBathsMin}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Property Types</Text>
      <View style={styles.chipContainer}>
        {propertyTypeOptions.map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              propertyTypes.includes(type) && styles.chipSelected
            ]}
            onPress={() => togglePropertyType(type)}
          >
            <Text style={[
              styles.chipText,
              propertyTypes.includes(type) && styles.chipTextSelected
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Must Haves (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., garage, pool, yard"
        value={mustHaves}
        onChangeText={setMustHaves}
        multiline
      />

      <Text style={styles.label}>Dealbreakers (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., busy street, no parking"
        value={dealbreakers}
        onChangeText={setDealbreakers}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Start Matching</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

