// Verification Stepper Screen
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenBackground, LiquidGlassCard, LiquidGlassButton, glassTokens } from '../../src/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

const verificationSteps = {
  buyer: [
    { id: 1, title: 'Phone Verification', icon: 'call' },
    { id: 2, title: 'ID Upload', icon: 'id-card' },
    { id: 3, title: 'Pre-Approval Letter', icon: 'document' },
  ],
  seller: [
    { id: 1, title: 'Phone Verification', icon: 'call' },
    { id: 2, title: 'ID Upload', icon: 'id-card' },
    { id: 3, title: 'Ownership Proof', icon: 'key' },
  ],
  default: [
    { id: 1, title: 'Phone Verification', icon: 'call' },
    { id: 2, title: 'ID Upload', icon: 'id-card' },
  ],
};

export default function VerifyScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const role = profile?.role || 'buyer';
  const steps = verificationSteps[role as keyof typeof verificationSteps] || verificationSteps.default;
  const totalSteps = steps.length;

  const handleStepComplete = async (stepId: number) => {
    if (stepId < totalSteps) {
      setCurrentStep(stepId + 1);
    } else {
      // Complete verification
      setLoading(true);
      try {
        const updates: any = {
          verification_level: 3,
        };

        if (role === 'buyer') {
          updates.buyer_verified = true;
          updates.readiness_score = 85; // Example score
        } else if (role === 'seller') {
          updates.seller_verified = true;
        }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user?.id);

        if (error) throw error;

        // Navigate based on role and onboarding status
        if (role === 'buyer') {
          // Check if buyer has an intent
          const { data: intent } = await supabase
            .from('buyer_intents')
            .select('id')
            .eq('buyer_id', user?.id)
            .eq('active', true)
            .single();

          if (!intent) {
            router.replace('/(buyer)/intent-setup');
          } else {
            router.replace('/(buyer)/(tabs)/feed');
          }
        } else if (role === 'seller') {
          router.replace('/(seller)/(tabs)/leads');
        } else {
          router.replace('/(pro)/(tabs)/dashboard');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to complete verification');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScreenBackground gradient>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LiquidGlassCard
          title="Complete Verification"
          subtitle={`Step ${currentStep} of ${totalSteps}`}
          cornerRadius={28}
          padding={24}
          elasticity={0.25}
          blurAmount={0.12}
          style={styles.card}
        >
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={[
                  styles.stepCircle,
                  currentStep > step.id && styles.stepCircleComplete,
                  currentStep === step.id && styles.stepCircleActive,
                ]}>
                  {currentStep > step.id ? (
                    <Ionicons name="checkmark" size={20} color={glassTokens.colors.text.primary} />
                  ) : (
                    <Text style={styles.stepNumber}>{step.id}</Text>
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle,
                    currentStep === step.id && styles.stepTitleActive,
                  ]}>
                    {step.title}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    currentStep > step.id && styles.stepLineComplete,
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* Current Step Content */}
          <View style={styles.stepContentArea}>
            <Text style={styles.stepDescription}>
              {currentStep === 1 && 'Verify your phone number to secure your account.'}
              {currentStep === 2 && 'Upload a photo of your government-issued ID.'}
              {currentStep === 3 && role === 'buyer' && 'Upload your pre-approval letter or proof of funds.'}
              {currentStep === 3 && role === 'seller' && 'Upload proof of property ownership.'}
            </Text>

            {/* Placeholder for step-specific UI */}
            <View style={styles.placeholderBox}>
              <Ionicons
                name={steps[currentStep - 1].icon as any}
                size={48}
                color={glassTokens.colors.text.tertiary}
              />
              <Text style={styles.placeholderText}>
                {steps[currentStep - 1].title} UI
              </Text>
              <Text style={styles.placeholderSubtext}>
                TODO: Implement {steps[currentStep - 1].title.toLowerCase()} verification
              </Text>
            </View>
          </View>

          <LiquidGlassButton
            label={currentStep < totalSteps ? 'Continue' : 'Complete Verification'}
            onPress={() => handleStepComplete(currentStep)}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={styles.continueButton}
          />
        </LiquidGlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles: any = {};

