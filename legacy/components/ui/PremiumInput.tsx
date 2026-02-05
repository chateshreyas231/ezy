// components/ui/PremiumInput.tsx
// Premium input component with sophisticated styling
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Theme } from '../../constants/Theme';

interface PremiumInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

export default function PremiumInput({
  label,
  icon,
  error,
  helperText,
  variant = 'default',
  style,
  onFocus,
  onBlur,
  ...props
}: PremiumInputProps) {
  const [focused, setFocused] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleFocus = (e: any) => {
    setFocused(true);
    scale.value = withSpring(1.01, Theme.animations.spring);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    scale.value = withSpring(1, Theme.animations.spring);
    onBlur?.(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: Theme.colors.surface,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: focused ? Theme.colors.accent : Theme.colors.border,
        };
      default:
        return {
          backgroundColor: Theme.colors.surfaceElevated,
          borderWidth: 1,
          borderColor: focused
            ? Theme.colors.accent
            : error
            ? Theme.colors.error
            : Theme.colors.border,
        };
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          {icon && (
            <Ionicons
              name={icon}
              size={16}
              color={focused ? Theme.colors.accent : Theme.colors.textSecondary}
              style={styles.labelIcon}
            />
          )}
          <Text
            style={[
              styles.label,
              focused && styles.labelFocused,
              error && styles.labelError,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
      <Animated.View style={[animatedStyle, styles.inputWrapper]}>
        <View
          style={[
            styles.inputContainer,
            getVariantStyles(),
            focused && styles.inputFocused,
            error && styles.inputError,
          ]}
        >
          {icon && !label && (
            <Ionicons
              name={icon}
              size={20}
              color={focused ? Theme.colors.accent : Theme.colors.textTertiary}
              style={styles.inputIcon}
            />
          )}
          <TextInput
            {...props}
            style={[styles.input, style]}
            placeholderTextColor={Theme.colors.textTertiary}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </View>
      </Animated.View>
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.helperTextError]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    gap: Theme.spacing.xs,
  },
  labelIcon: {
    marginRight: Theme.spacing.xs,
  },
  label: {
    ...Theme.typography.label,
    color: Theme.colors.textSecondary,
    fontSize: 11,
  },
  labelFocused: {
    color: Theme.colors.accent,
  },
  labelError: {
    color: Theme.colors.error,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    minHeight: 52,
    ...Theme.shadows.sm,
  },
  inputFocused: {
    ...Theme.shadows.glow,
    shadowColor: Theme.colors.accent,
  },
  inputError: {
    borderColor: Theme.colors.error,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
    paddingVertical: Theme.spacing.sm,
  },
  helperText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
  helperTextError: {
    color: Theme.colors.error,
  },
});

