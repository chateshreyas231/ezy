// components/ui/Logo.tsx
// Simplified logo without reanimated
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../constants/Theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export default function Logo({ size = 'medium', animated = true }: LogoProps) {
  const sizeStyles = {
    small: { iconSize: 24, fontSize: 18 },
    medium: { iconSize: 32, fontSize: 24 },
    large: { iconSize: 48, fontSize: 32 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="home"
          size={currentSize.iconSize}
          color={Theme.colors.accent}
        />
      </View>
      <Text style={[styles.text, { fontSize: currentSize.fontSize }]}>
        EZRIYA
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
