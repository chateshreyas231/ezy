// app/buyer-intent/create.tsx
// Create buyer intent screen

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
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

export default function CreateBuyerIntentScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bedsMin, setBedsMin] = useState('');
  const [bathsMin, setBathsMin] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState<string[]>([]);
  const [dealbreakers, setDealbreakers] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  const propertyTypeOptions = ['House', 'Condo', 'Townhouse', 'Apartment', 'Land', 'Other'];

  const togglePropertyType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter(t => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const addMustHave = () => {
    Alert.prompt(
      'Add Must Have',
      'Enter a feature you must have',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text) => {
            if (text && text.trim()) {
              setMustHaves([...mustHaves, text.trim()]);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const addDealbreaker = () => {
    Alert.prompt(
      'Add Dealbreaker',
      'Enter a feature that would be a dealbreaker',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text) => {
            if (text && text.trim()) {
              setDealbreakers([...dealbreakers, text.trim()]);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleSubmit = async () => {
    if (!authUser) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    if (!budgetMin || !budgetMax) {
      Alert.alert('Error', 'Please enter budget range');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('buyer_intents').insert({
        buyer_id: authUser.id,
        budget_min: parseInt(budgetMin),
        budget_max: parseInt(budgetMax),
        beds_min: bedsMin ? parseInt(bedsMin) : null,
        baths_min: bathsMin ? parseFloat(bathsMin) : null,
        property_types: propertyTypes,
        must_haves: mustHaves,
        dealbreakers: dealbreakers,
        active: active,
      });

      if (error) throw error;

      Alert.alert('Success', 'Buyer intent created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Failed to create buyer intent:', error);
      Alert.alert('Error', error.message || 'Failed to create buyer intent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Buyer Intent</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <AnimatedCard delay={0} style={styles.card}>
            <Text style={styles.sectionTitle}>Budget Range</Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetInput}>
                <Text style={styles.label}>Min</Text>
                <TextInput
                  style={styles.input}
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  placeholder="$0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetInput}>
                <Text style={styles.label}>Max</Text>
                <TextInput
                  style={styles.input}
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  placeholder="$0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={100} style={styles.card}>
            <Text style={styles.sectionTitle}>Property Requirements</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Min Beds</Text>
                <TextInput
                  style={styles.input}
                  value={bedsMin}
                  onChangeText={setBedsMin}
                  placeholder="0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Min Baths</Text>
                <TextInput
                  style={styles.input}
                  value={bathsMin}
                  onChangeText={setBathsMin}
                  placeholder="0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={200} style={styles.card}>
            <Text style={styles.sectionTitle}>Property Types</Text>
            <View style={styles.chipContainer}>
              {propertyTypeOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    propertyTypes.includes(type) && styles.chipActive,
                  ]}
                  onPress={() => togglePropertyType(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      propertyTypes.includes(type) && styles.chipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>

          <AnimatedCard delay={300} style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Must Haves</Text>
              <TouchableOpacity onPress={addMustHave}>
                <Ionicons name="add-circle" size={24} color={Theme.colors.accent} />
              </TouchableOpacity>
            </View>
            {mustHaves.length > 0 && (
              <View style={styles.tagContainer}>
                {mustHaves.map((item, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                    <TouchableOpacity
                      onPress={() => setMustHaves(mustHaves.filter((_, i) => i !== idx))}
                    >
                      <Ionicons name="close" size={16} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </AnimatedCard>

          <AnimatedCard delay={400} style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dealbreakers</Text>
              <TouchableOpacity onPress={addDealbreaker}>
                <Ionicons name="add-circle" size={24} color={Theme.colors.accent} />
              </TouchableOpacity>
            </View>
            {dealbreakers.length > 0 && (
              <View style={styles.tagContainer}>
                {dealbreakers.map((item, idx) => (
                  <View key={idx} style={[styles.tag, styles.tagDanger]}>
                    <Text style={styles.tagText}>{item}</Text>
                    <TouchableOpacity
                      onPress={() => setDealbreakers(dealbreakers.filter((_, i) => i !== idx))}
                    >
                      <Ionicons name="close" size={16} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </AnimatedCard>

          <AnimatedCard delay={500} style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{ false: Theme.colors.border, true: Theme.colors.accent }}
                thumbColor={Theme.colors.textPrimary}
              />
            </View>
          </AnimatedCard>

          <AnimatedButton
            title="Create Intent"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
  },
  content: {
    padding: Theme.spacing.md,
  },
  card: {
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  budgetInput: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  chipActive: {
    backgroundColor: Theme.colors.accent + '20',
    borderColor: Theme.colors.accent,
  },
  chipText: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textSecondary,
  },
  chipTextActive: {
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.success + '20',
  },
  tagDanger: {
    backgroundColor: Theme.colors.error + '20',
  },
  tagText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
});

