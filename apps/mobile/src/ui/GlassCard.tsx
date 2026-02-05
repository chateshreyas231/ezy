// GlassCard - Glass surface with padding and optional title
import React from 'react';
import { View, Text, ViewStyle, StyleSheet } from 'react-native';
import { GlassSurface, GlassSurfaceProps } from './GlassSurface';
import { glassTokens } from './tokens';

export interface GlassCardProps extends Omit<GlassSurfaceProps, 'children'> {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: number;
  contentStyle?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  title,
  subtitle,
  padding = glassTokens.spacing.lg,
  contentStyle,
  ...glassProps
}) => {
  return (
    <GlassSurface {...glassProps}>
      <View style={[styles.content, { padding }, contentStyle]}>
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
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  header: {
    marginBottom: glassTokens.spacing.md,
  },
  title: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.semibold,
    color: glassTokens.colors.text.primary,
    marginBottom: glassTokens.spacing.xs,
  },
  subtitle: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.regular,
    color: glassTokens.colors.text.secondary,
  },
});

