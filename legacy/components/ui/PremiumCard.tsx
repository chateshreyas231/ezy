// components/ui/PremiumCard.tsx
// Premium card component with glassmorphism and sophisticated animations
import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '../../constants/Theme';

interface PremiumCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  delay?: number;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  glow?: boolean;
}

const AnimatedCardComponent = Animated.createAnimatedComponent(View);

export default function PremiumCard({
  children,
  style,
  onPress,
  delay = 0,
  variant = 'default',
  glow = false,
}: PremiumCardProps) {
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, Theme.animations.springSmooth);
      opacity.value = withTiming(1, { duration: Theme.animations.normal });
      if (glow) {
        glowOpacity.value = withTiming(0.3, { duration: Theme.animations.slow });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Theme.colors.surfaceElevated2,
          ...Theme.shadows.lg,
        };
      case 'glass':
        return {
          backgroundColor: Theme.colors.glass,
          borderWidth: 1,
          borderColor: Theme.colors.borderLight,
        };
      case 'gradient':
        return {
          backgroundColor: Theme.colors.surfaceElevated,
          borderWidth: 1,
          borderColor: Theme.colors.accent + '30',
        };
      default:
        return {
          backgroundColor: Theme.colors.surfaceElevated,
          ...Theme.shadows.md,
        };
    }
  };

  return (
    <AnimatedCardComponent
      style={[
        styles.card,
        getVariantStyles(),
        glow && Theme.shadows.glow,
        animatedStyle,
        style,
      ]}
      onTouchStart={onPress}
    >
      {glow && (
        <Animated.View
          style={[
            styles.glowOverlay,
            glowStyle,
            { backgroundColor: Theme.colors.accent + '20' },
          ]}
        />
      )}
      {children}
    </AnimatedCardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Theme.borderRadius.lg,
  },
});

