// Dark Glassmorphism Card Component
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { glassTokens } from './tokens';

export interface LiquidGlassCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: number;
  contentStyle?: ViewStyle;
  cornerRadius?: number;
  style?: ViewStyle;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  title,
  subtitle,
  padding = glassTokens.spacing.lg,
  contentStyle,
  cornerRadius = glassTokens.radius.xl,
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: cornerRadius,
        },
        style,
      ]}
    >
      {/* Primary blur layer */}
      <BlurView
        intensity={80}
        tint="light"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: cornerRadius,
            backgroundColor: glassTokens.glass.background.medium,
          },
        ]}
      />
      {/* Liquid shimmer overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: cornerRadius,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
        ]}
      />
      {/* Subtle gradient for depth */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: cornerRadius,
            backgroundColor: 'transparent',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.4)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(106, 27, 154, 0.05)',
          },
        ]}
      />
      <View
        style={[
          styles.content,
          {
            padding,
            borderRadius: cornerRadius,
          },
          contentStyle,
        ]}
      >
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && (
              <Text style={styles.title}>{title}</Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        )}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(186, 104, 200, 0.2)', // Light purple border
    ...glassTokens.shadow.medium,
  },
  content: {
    width: '100%',
    zIndex: 1,
  },
  header: {
    marginBottom: glassTokens.spacing.md,
  },
  title: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.regular,
    color: glassTokens.colors.text.secondary,
    lineHeight: glassTokens.typography.fontSize.sm * glassTokens.typography.lineHeight.normal,
  },
});

