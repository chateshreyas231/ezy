// OwnerSection - Owner information section matching the image
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { glassTokens } from './tokens';

export interface OwnerSectionProps {
  ownerName: string;
  ownerRole?: string;
  ownerImageUri?: string;
  ownerDescription?: string;
  onPhonePress?: () => void;
  onChatPress?: () => void;
  style?: any;
}

export const OwnerSection: React.FC<OwnerSectionProps> = ({
  ownerName,
  ownerRole = 'Owner',
  ownerImageUri,
  ownerDescription,
  onPhonePress,
  onChatPress,
  style,
}) => {
  const blurIntensity = Platform.OS === 'ios' 
    ? glassTokens.blur.ios.medium
    : glassTokens.blur.android.medium;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Owner</Text>
      
      <View style={styles.ownerInfo}>
        <View style={styles.ownerImageContainer}>
          {ownerImageUri ? (
            <ExpoImage
              source={{ uri: ownerImageUri }}
              style={styles.ownerImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.ownerImage, styles.placeholderImage]}>
              <Ionicons name="person" size={24} color={glassTokens.colors.text.tertiary} />
            </View>
          )}
        </View>

        <View style={styles.ownerDetails}>
          <Text style={styles.ownerName}>{ownerName}</Text>
          <Text style={styles.ownerRole}>{ownerRole}</Text>
        </View>

        <View style={styles.contactButtons}>
          <TouchableOpacity
            onPress={onPhonePress}
            style={styles.contactButton}
            activeOpacity={0.7}
          >
            <BlurView
              intensity={blurIntensity}
              tint="light"
              style={styles.contactButtonBlur}
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
            >
              <Ionicons
                name="call"
                size={18}
                color={glassTokens.colors.text.primary}
              />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onChatPress}
            style={styles.contactButton}
            activeOpacity={0.7}
          >
            <BlurView
              intensity={blurIntensity}
              tint="light"
              style={styles.contactButtonBlur}
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
            >
              <Ionicons
                name="chatbubble"
                size={18}
                color={glassTokens.colors.text.primary}
              />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {ownerDescription && (
        <Text style={styles.description} numberOfLines={3}>
          {ownerDescription}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: glassTokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.md,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: glassTokens.spacing.md,
  },
  ownerImageContainer: {
    marginRight: glassTokens.spacing.md,
  },
  ownerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: glassTokens.colors.background.darkGrey,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: glassTokens.typography.fontSize.base,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
  },
  ownerRole: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: glassTokens.spacing.sm,
  },
  contactButton: {
    borderRadius: glassTokens.radius.full,
    overflow: 'hidden',
  },
  contactButtonBlur: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  description: {
    fontSize: glassTokens.typography.fontSize.sm,
    color: glassTokens.colors.text.secondary,
    lineHeight: glassTokens.typography.fontSize.sm * glassTokens.typography.lineHeight.relaxed,
  },
});

