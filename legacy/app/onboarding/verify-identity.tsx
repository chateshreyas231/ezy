// app/onboarding/verify-identity.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { updateVerificationLevel, uploadIdVerification } from '../../services/verificationService';

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload your ID');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take a photo of your ID');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('No image', 'Please select or take a photo of your ID first');
      return;
    }

    setUploading(true);
    try {
      await uploadIdVerification(image);
      await updateVerificationLevel(2);
      Alert.alert('Success', 'ID verification submitted. Your verification level has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload ID verification');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={48} color={Theme.colors.accent} />
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>
            Upload a photo of your government-issued ID to verify your account
          </Text>
        </View>

        <AnimatedCard delay={100}>
          <View style={styles.uploadSection}>
            {image ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.image} />
                <AnimatedButton
                  title="Change Photo"
                  onPress={pickImage}
                  variant="outline"
                  icon="refresh-outline"
                  size="small"
                  style={styles.changeButton}
                />
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="id-card-outline" size={64} color={Theme.colors.textTertiary} />
                <Text style={styles.uploadText}>No ID photo selected</Text>
                <Text style={styles.uploadHint}>
                  Take a clear photo of your government-issued ID
                </Text>
              </View>
            )}

            <View style={styles.uploadButtons}>
              <AnimatedButton
                title="Take Photo"
                onPress={takePhoto}
                variant="primary"
                icon="camera-outline"
                size="medium"
                style={styles.uploadButton}
              />
              <AnimatedButton
                title="Choose from Library"
                onPress={pickImage}
                variant="secondary"
                icon="images-outline"
                size="medium"
                style={styles.uploadButton}
              />
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="lock-closed" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Your ID is encrypted and secure</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Verification typically takes 24-48 hours</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="eye-off" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Only verified staff can view your documents</Text>
            </View>
          </View>

          <AnimatedButton
            title={uploading ? 'Uploading...' : 'Submit for Verification'}
            onPress={handleUpload}
            variant="primary"
            icon="cloud-upload-outline"
            loading={uploading}
            disabled={!image || uploading}
            size="large"
            style={styles.submitButton}
          />
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
  uploadSection: {
    marginBottom: Theme.spacing.xl,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  },
  changeButton: {
    marginTop: Theme.spacing.sm,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
    minHeight: 200,
  },
  uploadText: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  uploadHint: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  uploadButton: {
    flex: 1,
  },
  infoSection: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  infoText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  submitButton: {
    marginTop: Theme.spacing.md,
  },
});
