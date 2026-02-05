// components/ui/PremiumButton.tsx
// Premium button with sophisticated animations and effects
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '../../constants/Theme';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  glow?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  size = 'medium',
  style,
  glow = false,
}: PremiumButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, Theme.animations.spring);
    opacity.value = withTiming(0.9, { duration: Theme.animations.fast });
    if (glow) {
      glowOpacity.value = withTiming(0.6, { duration: Theme.animations.fast });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Theme.animations.spring);
    opacity.value = withTiming(1, { duration: Theme.animations.fast });
    if (glow) {
      glowOpacity.value = withTiming(0.3, { duration: Theme.animations.fast });
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Theme.colors.accent,
          borderColor: Theme.colors.accent,
          textColor: Theme.colors.textPrimary,
        };
      case 'gradient':
        return {
          backgroundColor: Theme.colors.accent,
          borderColor: Theme.colors.accent,
          textColor: Theme.colors.textPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: Theme.colors.surfaceElevated2,
          borderColor: Theme.colors.borderLight,
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
        return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 14, iconSize: 18 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18, iconSize: 22 };
      default:
        return { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16, iconSize: 20 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        animatedStyle,
        styles.button,
        {
          backgroundColor: variant === 'outline' || variant === 'ghost' ? 'transparent' : variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === 'outline' ? 2 : variant === 'ghost' ? 0 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
        },
        glow && variant === 'primary' && Theme.shadows.glowAccent,
        variant !== 'ghost' && Theme.shadows.md,
        style,
      ]}
    >
      {glow && variant === 'primary' && (
        <Animated.View
          style={[
            styles.glowOverlay,
            glowAnimatedStyle,
            { backgroundColor: Theme.colors.accentLight + '40' },
          ]}
        />
      )}
      <View style={styles.content}>
        {icon && iconPosition === 'left' && !loading && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={variantStyles.textColor}
            style={styles.iconLeft}
          />
        )}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingDot,
                { backgroundColor: variantStyles.textColor },
              ]}
            />
          </View>
        ) : (
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
                fontWeight: variant === 'ghost' ? '500' : '600',
              },
            ]}
          >
            {title}
          </Text>
        )}
        {icon && iconPosition === 'right' && !loading && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={variantStyles.textColor}
            style={styles.iconRight}
          />
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Theme.borderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  text: {
    ...Theme.typography.bodyMedium,
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: Theme.spacing.sm,
  },
  iconRight: {
    marginLeft: Theme.spacing.sm,
  },
  loadingContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

