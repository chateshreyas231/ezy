// app/onboarding/upload-preapproval.tsx
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedCard from '../../components/ui/AnimatedCard';
import SafeScreen from '../../components/ui/SafeScreen';
import { Theme } from '../../constants/Theme';
import { updateVerificationLevel, uploadPreApproval } from '../../services/verificationService';

export default function UploadPreApprovalScreen() {
  const router = useRouter();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!file || file.canceled) {
      Alert.alert('No file', 'Please select a pre-approval document');
      return;
    }

    setUploading(true);
    try {
      const selectedFile = file.assets[0];
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();
      await uploadPreApproval(blob);
      await updateVerificationLevel(2);
      Alert.alert('Success', 'Pre-approval document uploaded. Your verification is complete!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Upload failed', error.message || 'Failed to upload pre-approval document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="document-text" size={48} color={Theme.colors.accent} />
          <Text style={styles.title}>Upload Pre-Approval</Text>
          <Text style={styles.subtitle}>
            Upload your mortgage pre-approval letter to verify your buying power
          </Text>
        </View>

        <AnimatedCard delay={100}>
          <View style={styles.uploadSection}>
            {file && !file.canceled ? (
              <View style={styles.filePreview}>
                <Ionicons name="document" size={48} color={Theme.colors.accent} />
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.assets[0].name}
                </Text>
                <Text style={styles.fileSize}>
                  {(file.assets[0].size / 1024).toFixed(2)} KB
                </Text>
                <AnimatedButton
                  title="Change Document"
                  onPress={pickDocument}
                  variant="outline"
                  icon="refresh-outline"
                  size="small"
                  style={styles.changeButton}
                />
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={64} color={Theme.colors.textTertiary} />
                <Text style={styles.uploadText}>No document selected</Text>
                <Text style={styles.uploadHint}>
                  Select a PDF or image file of your pre-approval letter
                </Text>
              </View>
            )}

            <AnimatedButton
              title="Select Document"
              onPress={pickDocument}
              variant="primary"
              icon="folder-outline"
              size="large"
              style={styles.selectButton}
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="lock-closed" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Your documents are encrypted and secure</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>Accepted formats: PDF, JPG, PNG</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color={Theme.colors.success} />
              <Text style={styles.infoText}>This helps agents understand your buying power</Text>
            </View>
          </View>

          <AnimatedButton
            title={uploading ? 'Uploading...' : 'Upload Pre-Approval'}
            onPress={handleUpload}
            variant="primary"
            icon="cloud-upload-outline"
            loading={uploading}
            disabled={!file || file.canceled || uploading}
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
  filePreview: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  fileName: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
    fontWeight: '500',
  },
  fileSize: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
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
  selectButton: {
    marginTop: Theme.spacing.md,
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
