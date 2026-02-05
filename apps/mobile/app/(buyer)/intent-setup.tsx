// Buyer Intent Setup - Liquid Glass UI version (Create or Edit)
import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useIntent } from '../../lib/hooks/useIntent';
import { ScreenBackground, LiquidGlassCard, GlassPill, LiquidGlassButton, glassTokens } from '../../src/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabaseClient';

export default function BuyerIntentSetupScreen() {
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bedsMin, setBedsMin] = useState('');
  const [bathsMin, setBathsMin] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState('');
  const [dealbreakers, setDealbreakers] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingIntent, setExistingIntent] = useState<any>(null);
  const { createIntent, getCurrentIntent, updateIntent } = useIntent();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadExistingIntent();
  }, []);

  const loadExistingIntent = async () => {
    try {
      const intent = await getCurrentIntent();
      if (intent) {
        setExistingIntent(intent);
        setBudgetMin(intent.budget_min?.toString() || '');
        setBudgetMax(intent.budget_max?.toString() || '');
        setBedsMin(intent.beds_min?.toString() || '');
        setBathsMin(intent.baths_min?.toString() || '');
        setPropertyTypes(intent.property_types || []);
        setMustHaves(intent.must_haves?.join(', ') || '');
        setDealbreakers(intent.dealbreakers?.join(', ') || '');
      }
    } catch (error) {
      console.error('Failed to load existing intent:', error);
    }
  };

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

    if (propertyTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one property type');
      return;
    }

    setLoading(true);
    try {
      // Ensure profile exists before proceeding
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated. Please sign in again.');
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found. Please complete your profile setup first.');
      }

      if (profile.role !== 'buyer') {
        throw new Error('Only buyers can create buyer intents. Please update your role.');
      }

      const intentData = {
        budget_min: parseInt(budgetMin),
        budget_max: parseInt(budgetMax),
        beds_min: parseInt(bedsMin),
        baths_min: parseInt(bathsMin),
        property_types: propertyTypes,
        must_haves: mustHaves.split(',').map(s => s.trim()).filter(Boolean),
        dealbreakers: dealbreakers.split(',').map(s => s.trim()).filter(Boolean),
        areas: [],
        commute_anchors: [],
      };

      if (existingIntent) {
        // Update existing intent
        await updateIntent(existingIntent.id, intentData);
        Alert.alert('Success', 'Your search intent has been updated!', [
          {
            text: 'OK',
            onPress: () => {
              // Always navigate to feed after updating
              router.replace('/(buyer)/(tabs)/feed');
            },
          },
        ]);
      } else {
        // Create new intent
        await createIntent(intentData);
        // Navigate to feed after successful creation
        router.replace('/(buyer)/(tabs)/feed');
      }
    } catch (error: any) {
      console.error('Intent creation error:', error);
      Alert.alert('Error', error.message || `Failed to ${existingIntent ? 'update' : 'create'} intent`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground gradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + glassTokens.componentSpacing.screenPadding,
              paddingBottom: insets.bottom + glassTokens.componentSpacing.screenPadding + 40,
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LiquidGlassCard
            title={existingIntent ? "Edit Your Search Intent" : "What are you looking for?"}
            subtitle={existingIntent ? "Update your property preferences" : "Tell us about your ideal property"}
            cornerRadius={28}
            padding={24}
            elasticity={0.25}
            blurAmount={0.12}
            style={styles.card}
          >
            {/* Budget Range */}
            <View style={styles.section}>
              <Text style={styles.label}>Budget Range *</Text>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Min ($)"
                    placeholderTextColor={glassTokens.colors.text.tertiary}
                    value={budgetMin}
                    onChangeText={setBudgetMin}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Max ($)"
                    placeholderTextColor={glassTokens.colors.text.tertiary}
                    value={budgetMax}
                    onChangeText={setBudgetMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Bedrooms & Bathrooms */}
            <View style={styles.section}>
              <Text style={styles.label}>Bedrooms (min) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2"
                placeholderTextColor={glassTokens.colors.text.tertiary}
                value={bedsMin}
                onChangeText={setBedsMin}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Bathrooms (min) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1"
                placeholderTextColor={glassTokens.colors.text.tertiary}
                value={bathsMin}
                onChangeText={setBathsMin}
                keyboardType="numeric"
              />
            </View>

            {/* Property Types */}
            <View style={styles.section}>
              <Text style={styles.label}>Property Types</Text>
              <View style={styles.pillContainer}>
                {propertyTypeOptions.map(type => (
                  <GlassPill
                    key={type}
                    label={type}
                    selected={propertyTypes.includes(type)}
                    onPress={() => togglePropertyType(type)}
                    size="md"
                    style={styles.pill}
                  />
                ))}
              </View>
            </View>

            {/* Must Haves */}
            <View style={styles.section}>
              <Text style={styles.label}>Must Haves</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., garage, pool, yard"
                placeholderTextColor={glassTokens.colors.text.tertiary}
                value={mustHaves}
                onChangeText={setMustHaves}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Dealbreakers */}
            <View style={styles.section}>
              <Text style={styles.label}>Dealbreakers</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., busy street, no parking"
                placeholderTextColor={glassTokens.colors.text.tertiary}
                value={dealbreakers}
                onChangeText={setDealbreakers}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <LiquidGlassButton
              label={existingIntent ? "Update Intent" : "Start Matching"}
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.submitButton}
            />
          </LiquidGlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
  },
  card: {
    width: '100%',
  },
  section: {
    marginBottom: glassTokens.componentSpacing.sectionSpacing,
  },
  label: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: glassTokens.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: glassTokens.radius.md,
    paddingVertical: glassTokens.componentSpacing.inputPaddingVertical,
    paddingHorizontal: glassTokens.componentSpacing.inputPaddingHorizontal,
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 52,
  },
  textArea: {
    minHeight: 100,
    paddingTop: glassTokens.componentSpacing.inputPaddingVertical,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: glassTokens.spacing.sm,
    marginTop: glassTokens.spacing.xs,
  },
  pill: {
    marginRight: glassTokens.spacing.xs,
    marginBottom: glassTokens.spacing.xs,
  },
  submitButton: {
    marginTop: glassTokens.spacing['2xl'],
  },
});
