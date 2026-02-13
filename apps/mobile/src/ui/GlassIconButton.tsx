// Clean Icon Button - Neutralized
import React from 'react';
import { TouchableOpacity, View, ViewStyle, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface GlassIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  icon,
  onPress,
  size = 24,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Ionicons name={icon} size={size} color="black" />
    </TouchableOpacity>
  );
};

