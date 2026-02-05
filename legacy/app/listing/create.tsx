// app/listing/create.tsx
// Create listing screen (new schema)

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

const PROPERTY_TYPES = ['House', 'Condo', 'Townhouse', 'Apartment', 'Land', 'Other'];

export default function CreateListingScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressPublic, setAddressPublic] = useState('');
  const [addressPrivate, setAddressPrivate] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [listingVerified, setListingVerified] = useState(false);

  const addFeature = () => {
    Alert.prompt(
      'Add Feature',
      'Enter a property feature',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text) => {
            if (text && text.trim()) {
              setFeatures([...features, text.trim()]);
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

    if (!title || !price) {
      Alert.alert('Error', 'Please enter title and price');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('listings').insert({
        seller_id: authUser.id,
        title,
        description: description || null,
        address_public: addressPublic || null,
        address_private: addressPrivate || null,
        price: parseInt(price),
        beds: beds ? parseInt(beds) : null,
        baths: baths ? parseFloat(baths) : null,
        sqft: sqft ? parseInt(sqft) : null,
        property_type: propertyType || null,
        features: features,
        status: status,
        listing_verified: listingVerified,
        freshness_verified_at: listingVerified ? new Date().toISOString() : null,
      });

      if (error) throw error;

      Alert.alert('Success', 'Listing created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Failed to create listing:', error);
      Alert.alert('Error', error.message || 'Failed to create listing');
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
          <Text style={styles.title}>Create Listing</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <AnimatedCard delay={0} style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Beautiful 3BR Home"
              placeholderTextColor={Theme.colors.textTertiary}
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the property..."
              placeholderTextColor={Theme.colors.textTertiary}
              multiline
              numberOfLines={4}
            />
          </AnimatedCard>

          <AnimatedCard delay={100} style={styles.card}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.label}>Public Address</Text>
            <TextInput
              style={styles.input}
              value={addressPublic}
              onChangeText={setAddressPublic}
              placeholder="e.g., 123 Main St, City, State"
              placeholderTextColor={Theme.colors.textTertiary}
            />
            <Text style={styles.label}>Private Address (shown after match)</Text>
            <TextInput
              style={styles.input}
              value={addressPrivate}
              onChangeText={setAddressPrivate}
              placeholder="Full address with unit number"
              placeholderTextColor={Theme.colors.textTertiary}
            />
          </AnimatedCard>

          <AnimatedCard delay={200} style={styles.card}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="$0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Property Type</Text>
                <View style={styles.chipContainer}>
                  {PROPERTY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        propertyType === type && styles.chipActive,
                      ]}
                      onPress={() => setPropertyType(type)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          propertyType === type && styles.chipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Beds</Text>
                <TextInput
                  style={styles.input}
                  value={beds}
                  onChangeText={setBeds}
                  placeholder="0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Baths</Text>
                <TextInput
                  style={styles.input}
                  value={baths}
                  onChangeText={setBaths}
                  placeholder="0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sqft</Text>
                <TextInput
                  style={styles.input}
                  value={sqft}
                  onChangeText={setSqft}
                  placeholder="0"
                  placeholderTextColor={Theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={300} style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Features</Text>
              <TouchableOpacity onPress={addFeature}>
                <Ionicons name="add-circle" size={24} color={Theme.colors.accent} />
              </TouchableOpacity>
            </View>
            {features.length > 0 && (
              <View style={styles.tagContainer}>
                {features.map((item, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                    <TouchableOpacity
                      onPress={() => setFeatures(features.filter((_, i) => i !== idx))}
                    >
                      <Ionicons name="close" size={16} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </AnimatedCard>

          <AnimatedCard delay={400} style={styles.card}>
            <Text style={styles.sectionTitle}>Status & Verification</Text>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'draft' && styles.statusButtonActive]}
                  onPress={() => setStatus('draft')}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === 'draft' && styles.statusButtonTextActive,
                    ]}
                  >
                    Draft
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'active' && styles.statusButtonActive]}
                  onPress={() => setStatus('active')}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === 'active' && styles.statusButtonTextActive,
                    ]}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Listing Verified</Text>
              <Switch
                value={listingVerified}
                onValueChange={setListingVerified}
                trackColor={{ false: Theme.colors.border, true: Theme.colors.success }}
                thumbColor={Theme.colors.textPrimary}
              />
            </View>
          </AnimatedCard>

          <AnimatedButton
            title="Create Listing"
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
  label: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
    marginTop: Theme.spacing.sm,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
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
    backgroundColor: Theme.colors.accent + '20',
  },
  tagText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  statusButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statusButtonActive: {
    backgroundColor: Theme.colors.accent + '20',
    borderColor: Theme.colors.accent,
  },
  statusButtonText: {
    ...Theme.typography.bodyMedium,
    color: Theme.colors.textSecondary,
  },
  statusButtonTextActive: {
    color: Theme.colors.accent,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
});

