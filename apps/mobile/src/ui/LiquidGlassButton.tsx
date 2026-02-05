// Clean Button Component - Solid colors with rounded corners
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { glassTokens } from './tokens';

export interface LiquidGlassButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const paddingVertical = size === 'sm' ? 14 : size === 'md' ? 16 : 18;
  const paddingHorizontal = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
  const fontSize = size === 'sm' ? glassTokens.typography.fontSize.sm : 
                   size === 'md' ? glassTokens.typography.fontSize.base : 
                   glassTokens.typography.fontSize.lg;
  const cornerRadius = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: glassTokens.colors.accent.primary,
          borderWidth: 1,
          borderColor: 'rgba(186, 104, 200, 0.3)', // Liquid glass border
          borderTopColor: 'rgba(255, 255, 255, 0.4)', // Light shimmer top
        };
      case 'secondary':
        return {
          backgroundColor: glassTokens.glass.background.heavy,
          borderWidth: 1,
          borderColor: 'rgba(186, 104, 200, 0.25)',
          borderTopColor: 'rgba(255, 255, 255, 0.5)',
        };
      case 'tertiary':
        return {
          backgroundColor: glassTokens.glass.background.medium,
          borderWidth: 0.5,
          borderColor: 'rgba(186, 104, 200, 0.2)',
          borderTopColor: 'rgba(255, 255, 255, 0.6)',
        };
      case 'success':
        return {
          backgroundColor: glassTokens.colors.accent.success,
          borderWidth: 1,
          borderColor: 'rgba(76, 175, 80, 0.3)',
          borderTopColor: 'rgba(255, 255, 255, 0.4)',
        };
      case 'error':
        return {
          backgroundColor: glassTokens.colors.accent.error,
          borderWidth: 1,
          borderColor: 'rgba(244, 67, 54, 0.3)',
          borderTopColor: 'rgba(255, 255, 255, 0.4)',
        };
      default:
        return {
          backgroundColor: glassTokens.colors.accent.primary,
          borderWidth: 1,
          borderColor: 'rgba(186, 104, 200, 0.3)',
          borderTopColor: 'rgba(255, 255, 255, 0.4)',
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'success':
      case 'error':
        return '#FFFFFF';
      case 'secondary':
      case 'tertiary':
        return glassTokens.colors.text.primary;
      default:
        return '#FFFFFF';
    }
  };

  const buttonStyles = getButtonStyles();
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          paddingVertical,
          paddingHorizontal,
          borderRadius: cornerRadius,
          opacity: disabled ? 0.5 : 1,
          minHeight: size === 'sm' ? 48 : size === 'md' ? 52 : 56,
          ...buttonStyles,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={textColor}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              fontSize,
              color: textColor,
              fontWeight: glassTokens.typography.fontWeight.semibold,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...glassTokens.shadow.medium,
    // Liquid glass effect
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

