// components/ui/AnimatedCard.tsx
// Simplified card that works reliably
import React, { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Theme } from '../../constants/Theme';

interface AnimatedCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  delay?: number;
}

export default function AnimatedCard({ children, style, onPress, delay = 0 }: AnimatedCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        {
          opacity: visible ? 1 : 0,
          transform: [{ scale: visible ? 1 : 0.95 }],
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});
