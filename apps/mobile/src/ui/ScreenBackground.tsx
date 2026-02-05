// ScreenBackground - Dark gradient background with soft teal/blue glows
import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glassTokens } from './tokens';

export interface ScreenBackgroundProps {
  children?: React.ReactNode;
  imageUrl?: string | ImageSourcePropType;
  gradient?: boolean;
  overlayOpacity?: number;
  style?: ViewStyle;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  children,
  imageUrl,
  gradient = false,
  overlayOpacity = 0.6,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {imageUrl ? (
        <>
          <Image
            source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` },
            ]}
          />
        </>
      ) : gradient ? (
        <>
          {/* Base liquid gradient - subtle color shift */}
          <LinearGradient
            colors={[
              '#FAFAFA', // Soft off-white
              '#FFFFFF', // Pure white
              '#F8F8F8', // Subtle grey
              '#FFFFFF', // Pure white
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Liquid purple glow blob - top right */}
          <View style={styles.glowBlob1}>
            <LinearGradient
              colors={[
                'rgba(186, 104, 200, 0.12)', // Light purple
                'rgba(156, 39, 176, 0.08)',  // Medium purple
                'rgba(106, 27, 154, 0.04)',  // Dark purple
                'transparent'
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          {/* Liquid purple glow blob - bottom left */}
          <View style={styles.glowBlob2}>
            <LinearGradient
              colors={[
                'rgba(156, 39, 176, 0.1)',   // Medium purple
                'rgba(106, 27, 154, 0.06)',  // Dark purple
                'rgba(74, 20, 140, 0.03)',   // Deeper purple
                'transparent'
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 1, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
          </View>
          {/* Additional liquid glow - center right */}
          <View style={styles.glowBlob3}>
            <LinearGradient
              colors={[
                'rgba(186, 104, 200, 0.08)',
                'rgba(156, 39, 176, 0.04)',
                'transparent'
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
          </View>
        </>
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: glassTokens.colors.background.dark },
          ]}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowBlob1: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 450,
    height: 450,
    borderRadius: 225,
    opacity: 0.8,
  },
  glowBlob2: {
    position: 'absolute',
    bottom: -180,
    left: -180,
    width: 550,
    height: 550,
    borderRadius: 275,
    opacity: 0.7,
  },
  glowBlob3: {
    position: 'absolute',
    top: '40%',
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.6,
  },
});

