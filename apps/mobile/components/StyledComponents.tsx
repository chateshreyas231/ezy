import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../lib/ThemeContext';

// Glassmorphism Card Component
export function Card({ children, style, intensity = 20 }: { 
  children: React.ReactNode; 
  style?: ViewStyle;
  intensity?: number;
}) {
  const theme = useTheme();
  return (
    <View style={[{
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      ...theme.glassmorphism.shadow,
    }, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
        }}
      >
        {children}
      </BlurView>
    </View>
  );
}

// Glassmorphism Button Component
export function Button({
  children,
  onPress,
  variant = 'primary',
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  style?: ViewStyle;
}) {
  const theme = useTheme();
  
  const variantStyles = {
    primary: { 
      backgroundColor: theme.colors.primary,
      ...theme.shadows.glowPrimary,
    },
    secondary: { 
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    success: { 
      backgroundColor: theme.colors.success,
      ...theme.shadows.glow,
    },
    error: { 
      backgroundColor: theme.colors.error,
      ...theme.shadows.glow,
    },
  };

  return (
    <TouchableOpacity
      style={[{
        ...variantStyles[variant],
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{
        color: '#FFFFFF',
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

// Heading Component
export function Heading({
  children,
  level = 1,
  style,
}: {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  style?: TextStyle;
}) {
  const theme = useTheme();
  
  const levelStyles = {
    1: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
    },
    2: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
    },
    3: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.semibold,
    },
  };

  return (
    <Text style={[{
      color: theme.colors.text,
      ...levelStyles[level],
    }, style]}>
      {children}
    </Text>
  );
}

// Body Text Component
export function BodyText({
  children,
  variant = 'primary',
  style,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  style?: TextStyle;
}) {
  const theme = useTheme();
  
  const variantStyles = {
    primary: { color: theme.colors.text },
    secondary: { color: theme.colors.textSecondary },
    tertiary: { color: theme.colors.textTertiary },
  };

  return (
    <Text style={[{
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
      ...variantStyles[variant],
    }, style]}>
      {children}
    </Text>
  );
}

// Divider Component
export function Divider({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View style={[{
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.md,
    }, style]} />
  );
}

// Transaction/Item Row Component (like in banking app)
export function ItemRow({
  icon,
  title,
  subtitle,
  amount,
  amountColor,
  onPress,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  amount?: string;
  amountColor?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && (
        <View style={{ marginRight: theme.spacing.md }}>
          {icon}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            marginTop: 4,
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {amount && (
        <Text style={{
          color: amountColor || theme.colors.text,
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
        }}>
          {amount}
        </Text>
      )}
    </Component>
  );
}

