// app/buyer/submit-intent.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { generateMatchesForBuyerNeed } from '../../services/matchesService';
import { supabase } from '../../services/supabaseClient';

export default function SubmitIntentScreen() {
  const router = useRouter();
  const [intentText, setIntentText] = useState('');
  const [city, setCity] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [beds, setBeds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!intentText.trim()) {
      Alert.alert('Required', 'Please describe what you\'re looking for');
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.user.id)
        .single();

      if (!userProfile?.state) {
        Alert.alert('Setup required', 'Please set your state in your profile first');
        router.push('/(tabs)/account');
        return;
      }

      let parsedCriteria: any = {};
      try {
        const { data: aiResult } = await supabase.functions.invoke('parse-intent', {
          body: { text: intentText },
        });
        parsedCriteria = aiResult || {};
      } catch (err) {
        console.warn('AI parsing failed, using manual inputs:', err);
      }

      const buyerNeed = {
        state: userProfile.state,
        city: city || parsedCriteria.city || null,
        price_max: priceMax ? parseFloat(priceMax) : parsedCriteria.price_max || null,
        beds: beds ? parseInt(beds, 10) : parsedCriteria.beds || null,
        property_type: parsedCriteria.property_type || null,
      };

      const buyerNeedPost = await supabase
        .from('buyer_need_posts')
        .insert({
          agent_id: user.user.id,
          ...buyerNeed,
        })
        .select()
        .single();

      if (buyerNeedPost.error) throw buyerNeedPost.error;

      await generateMatchesForBuyerNeed(buyerNeedPost.data.id);
      router.push('/buyer/matches');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit intent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="search" size={48} color={Theme.colors.accent} />
          <Text style={styles.title}>Describe Your Dream Home</Text>
          <Text style={styles.subtitle}>
            Tell us what you're looking for in natural language, or fill in the details below
          </Text>
        </View>

        <AnimatedCard delay={100}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={Theme.colors.textSecondary} />
                <Text style={styles.label}>What are you looking for?</Text>
              </View>
              <TextInput
                placeholder="E.g., 'I want a 3-bedroom house in San Francisco under $800k with a backyard'"
                placeholderTextColor={Theme.colors.textTertiary}
                value={intentText}
                onChangeText={setIntentText}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="location-outline" size={18} color={Theme.colors.textSecondary} />
                <Text style={styles.label}>City (Optional)</Text>
              </View>
              <TextInput
                placeholder="Enter city name"
                placeholderTextColor={Theme.colors.textTertiary}
                value={city}
                onChangeText={setCity}
                style={styles.input}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <View style={styles.labelRow}>
                  <Ionicons name="cash-outline" size={18} color={Theme.colors.textSecondary} />
                  <Text style={styles.label}>Max Price</Text>
                </View>
                <TextInput
                  placeholder="$500,000"
                  placeholderTextColor={Theme.colors.textTertiary}
                  value={priceMax}
                  onChangeText={setPriceMax}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={[styles.inputGroup, styles.inputHalf]}>
                <View style={styles.labelRow}>
                  <Ionicons name="bed-outline" size={18} color={Theme.colors.textSecondary} />
                  <Text style={styles.label}>Beds</Text>
                </View>
                <TextInput
                  placeholder="3"
                  placeholderTextColor={Theme.colors.textTertiary}
                  value={beds}
                  onChangeText={setBeds}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <AnimatedButton
              title="Find Matches"
              onPress={handleSubmit}
              variant="primary"
              icon="search-outline"
              loading={loading}
              size="large"
              style={styles.submitButton}
            />
          </View>
        </AnimatedCard>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: Theme.spacing.lg,
  },
  inputGroup: {
    gap: Theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  label: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  textArea: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minHeight: 120,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  submitButton: {
    marginTop: Theme.spacing.md,
  },
});
