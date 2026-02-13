// GlassCard - Neutralized
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { GlassSurfaceProps } from './GlassSurface';

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
}) => {
  return (
    <View style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc' }}>
      {(title || subtitle) && (
        <View style={{ marginBottom: 5 }}>
          {title && (
            <Text style={{ fontWeight: 'bold' }}>{title}</Text>
          )}
          {subtitle && (
            <Text style={{ fontSize: 12 }}>{subtitle}</Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
};

