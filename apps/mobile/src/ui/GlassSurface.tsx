// GlassSurface - Base glass component with blur and border
import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { glassTokens } from './tokens';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'heavy';
  borderRadius?: number;
  borderOpacity?: number;
  tint?: 'light' | 'dark' | 'default';
  testID?: string;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  intensity = 'medium',
  borderRadius = glassTokens.radius.lg,
  borderOpacity = glassTokens.border.opacity.medium,
  tint = 'light',
  testID,
}) => {
  const blurIntensity = Platform.OS === 'ios' 
    ? glassTokens.blur.ios[intensity]
    : glassTokens.blur.android[intensity];

  const glassOpacity = glassTokens.glass.opacity[intensity];
  // Ultra-transparent liquid glass backgrounds
  const backgroundColor = intensity === 'light' 
    ? glassTokens.glass.background.light
    : intensity === 'medium'
    ? glassTokens.glass.background.medium
    : glassTokens.glass.background.heavy;

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius,
          borderWidth: glassTokens.border.width,
          borderColor: `rgba(186, 104, 200, ${borderOpacity})`, // Light purple border
        },
        glassTokens.shadow.medium,
        style,
      ]}
      testID={testID}
    >
      {/* Multi-layer blur for liquid depth */}
      <BlurView
        intensity={blurIntensity}
        tint="light"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            backgroundColor,
          },
        ]}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
      />
      {/* Subtle gradient overlay for liquid shimmer */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        ]}
      />
      <View style={[styles.content, { borderRadius }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    overflow: 'hidden',
  },
});

