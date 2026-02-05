// Clean Button Component - Solid colors with rounded corners
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { glassTokens } from './tokens';

export interface GlassButtonProps {
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

export const GlassButton: React.FC<GlassButtonProps> = ({
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
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: glassTokens.colors.accent.tertiary, // Light gray #C8C8C8
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'tertiary':
        return {
          backgroundColor: glassTokens.colors.background.darkGrey,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.1)',
        };
      case 'success':
        return {
          backgroundColor: glassTokens.colors.accent.success,
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'error':
        return {
          backgroundColor: glassTokens.colors.accent.error,
          borderWidth: 0,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: glassTokens.colors.accent.primary,
          borderWidth: 0,
          borderColor: 'transparent',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});

