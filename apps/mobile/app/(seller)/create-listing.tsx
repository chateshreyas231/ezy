// Create Listing Wizard - Seller
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, GlassPill, glassTokens } from '../../src/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/hooks/useAuth';

const propertyTypes = ['house', 'condo', 'townhouse', 'apartment', 'land'];
const features = ['garage', 'yard', 'fireplace', 'pool', 'parking', 'gym', 'balcony', 'basement'];

export default function CreateListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressPublic, setAddressPublic] = useState('');
  const [addressPrivate, setAddressPrivate] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const totalSteps = 4;

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !beds || !baths || !propertyType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          seller_id: user?.id,
          title,
          description,
          address_public: addressPublic,
          address_private: addressPrivate,
          price: parseInt(price),
          beds: parseInt(beds),
          baths: parseInt(baths),
          sqft: sqft ? parseInt(sqft) : null,
          property_type: propertyType,
          features: selectedFeatures,
          status: 'active',
          listing_verified: false, // Requires verification
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Listing created! Requesting verification...');
      router.replace('/(seller)/(tabs)/listings');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground gradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
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
        >
          <LiquidGlassCard
            title={`Create Listing (Step ${step}/${totalSteps})`}
            subtitle="Tell us about your property"
            cornerRadius={28}
            padding={24}
            elasticity={0.25}
            blurAmount={0.12}
            style={styles.card}
          >
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Beautiful 3BR House in Downtown"
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your property..."
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Text style={styles.label}>Public Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Downtown Area, San Francisco"
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={addressPublic}
                  onChangeText={setAddressPublic}
                />

                <Text style={styles.label}>Private Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full address (shown after match)"
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={addressPrivate}
                  onChangeText={setAddressPrivate}
                />
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="850000"
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Bedrooms *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="3"
                      placeholderTextColor={glassTokens.colors.text.tertiary}
                      value={beds}
                      onChangeText={setBeds}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Bathrooms *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="2"
                      placeholderTextColor={glassTokens.colors.text.tertiary}
                      value={baths}
                      onChangeText={setBaths}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Square Feet</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1800"
                  placeholderTextColor={glassTokens.colors.text.tertiary}
                  value={sqft}
                  onChangeText={setSqft}
                  keyboardType="numeric"
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.label}>Property Type *</Text>
                <View style={styles.pillContainer}>
                  {propertyTypes.map(type => (
                    <GlassPill
                      key={type}
                      label={type}
                      selected={propertyType === type}
                      onPress={() => setPropertyType(type)}
                      size="md"
                      style={styles.pill}
                    />
                  ))}
                </View>

                <Text style={styles.label}>Features</Text>
                <View style={styles.pillContainer}>
                  {features.map(feature => (
                    <GlassPill
                      key={feature}
                      label={feature}
                      selected={selectedFeatures.includes(feature)}
                      onPress={() => toggleFeature(feature)}
                      size="md"
                      style={styles.pill}
                    />
                  ))}
                </View>
              </View>
            )}

            {step === 4 && (
              <View style={styles.stepContent}>
                <Text style={styles.label}>Media Upload</Text>
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>TODO: Implement image/video upload</Text>
                  <Text style={styles.placeholderSubtext}>Upload property photos and videos</Text>
                </View>
              </View>
            )}

            <View style={styles.buttonRow}>
              {step > 1 && (
                <LiquidGlassButton
                  label="Back"
                  onPress={() => setStep(step - 1)}
                  variant="secondary"
                  size="md"
                  style={styles.backButton}
                />
              )}
              <LiquidGlassButton
                label={step < totalSteps ? 'Next' : 'Publish Listing'}
                onPress={handleNext}
                variant="primary"
                size="lg"
                fullWidth={step === 1}
                loading={loading}
                style={step === 1 ? styles.nextButtonFullWidth : styles.nextButton}
              />
            </View>
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
  stepContent: {
    gap: glassTokens.componentSpacing.sectionSpacing,
    marginBottom: glassTokens.spacing.xl,
  },
  label: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.secondary,
    marginBottom: glassTokens.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: glassTokens.radius.md,
    paddingVertical: glassTokens.componentSpacing.inputPaddingVertical,
    paddingHorizontal: glassTokens.componentSpacing.inputPaddingHorizontal,
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 52,
  },
  textArea: {
    minHeight: 120,
    paddingTop: glassTokens.componentSpacing.inputPaddingVertical,
  },
  row: {
    flexDirection: 'row',
    gap: glassTokens.spacing.md,
  },
  halfInput: {
    flex: 1,
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
  placeholderBox: {
    padding: glassTokens.componentSpacing.cardPadding,
    borderRadius: glassTokens.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    gap: glassTokens.spacing.md,
  },
  placeholderText: {
    fontSize: glassTokens.typography.fontSize.base,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
  },
  placeholderSubtext: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.tertiary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: glassTokens.spacing.md,
    marginTop: glassTokens.spacing.xl,
  },
  backButton: {
    flex: 0.3,
  },
  nextButton: {
    flex: 0.7,
  },
  nextButtonFullWidth: {
    flex: 1,
  },
});
