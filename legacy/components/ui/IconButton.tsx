// components/ui/IconButton.tsx
// Simplified icon button without reanimated
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Theme } from '../../constants/Theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export default function IconButton({
  icon,
  onPress,
  size = 24,
  color = Theme.colors.textPrimary,
  backgroundColor = Theme.colors.surfaceElevated,
  style,
}: IconButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor,
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
          transform: [{ scale: pressed ? 0.9 : 1 }],
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
  },
});
