// Dark Glassmorphism Card Component - Neutralized
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

export interface LiquidGlassCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: number;
  contentStyle?: ViewStyle;
  cornerRadius?: number;
  elasticity?: number;
  blurAmount?: number;
  style?: ViewStyle;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  title,
  subtitle,
  style,
}) => {
  return (
    <View
      style={[
        {
          padding: 10,
          borderWidth: 1,
          borderColor: '#ccc',
          marginBottom: 10
        },
        style,
      ]}
    >
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

