// components/ui/AnimatedButton.tsx
// Simplified button that works reliably
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Theme } from '../../constants/Theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  size = 'medium',
  style,
}: AnimatedButtonProps) {
  const [pressed, setPressed] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Theme.colors.accent,
          borderColor: Theme.colors.accent,
          textColor: Theme.colors.textPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: Theme.colors.surfaceElevated,
          borderColor: Theme.colors.border,
          textColor: Theme.colors.textPrimary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: Theme.colors.accent,
          textColor: Theme.colors.accent,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: Theme.colors.accent,
        };
      default:
        return {
          backgroundColor: Theme.colors.accent,
          borderColor: Theme.colors.accent,
          textColor: Theme.colors.textPrimary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, iconSize: 18 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18, iconSize: 22 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, iconSize: 20 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === 'outline' ? 2 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'left' && !loading && (
          <Ionicons name={icon} size={sizeStyles.iconSize} color={variantStyles.textColor} style={styles.iconLeft} />
        )}
        {loading ? (
          <ActivityIndicator size="small" color={variantStyles.textColor} />
        ) : (
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        )}
        {icon && iconPosition === 'right' && !loading && (
          <Ionicons name={icon} size={sizeStyles.iconSize} color={variantStyles.textColor} style={styles.iconRight} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Theme.typography.body,
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: Theme.spacing.sm,
  },
  iconRight: {
    marginLeft: Theme.spacing.sm,
  },
});
