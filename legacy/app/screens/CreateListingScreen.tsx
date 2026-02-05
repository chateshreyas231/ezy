// app/screens/CreateListingScreen.tsx
// Premium form for creating listing posts
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { useUser } from '../context/UserContext';
import { createListingPost } from '../../services/postsService';
import type { CreateListingInput } from '../../src/types/types';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const PROPERTY_TYPES = [
  'Single Family',
  'Condo',
  'Townhouse',
  'Multi-Unit',
  'Commercial',
  'Land',
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState(user?.state ?? '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');

  const handleSubmit = async () => {
    if (!state) {
      Alert.alert('Error', 'Please select a state');
      return;
    }

    if (!listPrice) {
      Alert.alert('Error', 'Please enter list price');
      return;
    }

    try {
      setSaving(true);

      const input: CreateListingInput = {
        state,
        address: address || undefined,
        city: city || undefined,
        zip: zip || undefined,
        list_price: parseFloat(listPrice),
        property_type: propertyType || undefined,
        beds: beds ? parseInt(beds) : undefined,
        baths: baths ? parseFloat(baths) : undefined,
      };

      await createListingPost(input);
      Alert.alert('Success', 'Listing created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <AnimatedCard delay={0} style={styles.card}>
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="location" size={18} color={Theme.colors.accent} />
              <Text style={styles.label}>State *</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
              {US_STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setState(s)}
                  style={[
                    styles.stateButton,
                    state === s && styles.stateButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stateButtonText,
                      state === s && styles.stateButtonTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {state && (
              <Text style={styles.selectedText}>Selected: {state}</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="home" size={18} color={Theme.colors.accent} />
              <Text style={styles.label}>Address</Text>
            </View>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Property address"
              placeholderTextColor={Theme.colors.textTertiary}
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="business" size={18} color={Theme.colors.accent} />
              <Text style={styles.label}>City</Text>
            </View>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={Theme.colors.textTertiary}
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="mail" size={18} color={Theme.colors.accent} />
              <Text style={styles.label}>ZIP Code</Text>
            </View>
            <TextInput
              value={zip}
              onChangeText={setZip}
              placeholder="ZIP Code"
              placeholderTextColor={Theme.colors.textTertiary}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="cash" size={18} color={Theme.colors.accent} />
              <Text style={styles.label}>List Price *</Text>
            </View>
            <TextInput
              value={listPrice}
              onChangeText={setListPrice}
              placeholder="Enter list price"
              placeholderTextColor={Theme.colors.textTertiary}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Ionicons name="business-outline" size={18} color={Theme.colors.accent} />
              <Text style={styles.label}>Property Type</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {PROPERTY_TYPES.map((pt) => (
                <TouchableOpacity
                  key={pt}
                  onPress={() => setPropertyType(pt)}
                  style={[
                    styles.typeButton,
                    propertyType === pt && styles.typeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      propertyType === pt && styles.typeButtonTextActive,
                    ]}
                  >
                    {pt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {propertyType && (
              <Text style={styles.selectedText}>Selected: {propertyType}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <View style={styles.labelRow}>
                <Ionicons name="bed" size={18} color={Theme.colors.accent} />
                <Text style={styles.label}>Beds</Text>
              </View>
              <TextInput
                value={beds}
                onChangeText={setBeds}
                placeholder="0"
                placeholderTextColor={Theme.colors.textTertiary}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.labelRow}>
                <Ionicons name="water" size={18} color={Theme.colors.accent} />
                <Text style={styles.label}>Baths</Text>
              </View>
              <TextInput
                value={baths}
                onChangeText={setBaths}
                placeholder="0"
                placeholderTextColor={Theme.colors.textTertiary}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>
        </AnimatedCard>

        <AnimatedButton
          title={saving ? 'Creating Listing...' : 'Create Listing'}
          onPress={handleSubmit}
          loading={saving}
          disabled={saving || !state || !listPrice}
          icon="add-circle"
          style={styles.submitButton}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  card: {
    marginBottom: Theme.spacing.lg,
  },
  section: {
    marginBottom: Theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.xs,
  },
  label: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    color: Theme.colors.textPrimary,
    fontSize: 16,
  },
  stateScroll: {
    marginBottom: Theme.spacing.xs,
  },
  stateButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  stateButtonActive: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  stateButtonText: {
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  stateButtonTextActive: {
    color: Theme.colors.textPrimary,
  },
  typeScroll: {
    marginBottom: Theme.spacing.xs,
  },
  typeButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  typeButtonActive: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  typeButtonText: {
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  typeButtonTextActive: {
    color: Theme.colors.textPrimary,
  },
  selectedText: {
    ...Theme.typography.caption,
    color: Theme.colors.accent,
    marginTop: Theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
});
