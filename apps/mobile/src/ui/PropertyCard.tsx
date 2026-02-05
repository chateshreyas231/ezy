// PropertyCard - Horizontal property card matching the image style
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { glassTokens } from './tokens';

export interface PropertyCardProps {
  imageUri?: string;
  title: string;
  location: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  onPress?: () => void;
  onHeartPress?: () => void;
  isFavorite?: boolean;
  style?: any;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  imageUri,
  title,
  location,
  price,
  rating = 4.5,
  reviewCount = 895,
  onPress,
  onHeartPress,
  isFavorite = false,
  style,
}) => {
  const blurIntensity = Platform.OS === 'ios' 
    ? glassTokens.blur.ios.medium
    : glassTokens.blur.android.medium;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, style]}
    >
      <View style={styles.imageContainer}>
        {imageUri ? (
          <ExpoImage
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="home" size={40} color={glassTokens.colors.text.tertiary} />
          </View>
        )}
        
        {/* Rating badge */}
        <View style={styles.ratingBadge}>
          <BlurView
            intensity={blurIntensity}
            tint="light"
            style={styles.ratingBlur}
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
          >
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </BlurView>
        </View>

        {/* Heart button */}
        <TouchableOpacity
          onPress={onHeartPress}
          style={styles.heartButton}
          activeOpacity={0.7}
        >
          <BlurView
            intensity={blurIntensity}
            tint="light"
            style={styles.heartBlur}
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#FF3B30' : glassTokens.colors.text.primary}
            />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Card content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={styles.locationRow}>
              <Ionicons
                name="location"
                size={12}
                color={glassTokens.colors.text.tertiary}
              />
              <Text style={styles.location} numberOfLines={1}>{location}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${price.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.arrowButton} activeOpacity={0.7}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={glassTokens.colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...glassTokens.shadow.medium,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: glassTokens.colors.background.darkGrey,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: glassTokens.spacing.md,
    left: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.md,
    overflow: 'hidden',
  },
  ratingBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: glassTokens.spacing.sm,
    paddingVertical: glassTokens.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: glassTokens.spacing.xs,
  },
  ratingText: {
    fontSize: glassTokens.typography.fontSize.xs,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
  },
  heartButton: {
    position: 'absolute',
    top: glassTokens.spacing.md,
    right: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.full,
    overflow: 'hidden',
  },
  heartBlur: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: glassTokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: glassTokens.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: glassTokens.spacing.sm,
  },
  title: {
    fontSize: glassTokens.typography.fontSize.base,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTokens.spacing.xs,
  },
  location: {
    fontSize: glassTokens.typography.fontSize.xs,
    color: glassTokens.colors.text.tertiary,
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: glassTokens.typography.fontSize.lg,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
  },
  arrowButton: {
    alignSelf: 'flex-end',
    padding: glassTokens.spacing.xs,
  },
});

