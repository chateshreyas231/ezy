// Clean Icon Button - Circular with solid background
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { glassTokens } from './tokens';
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
  color,
  backgroundColor,
  style,
  disabled = false,
  variant = 'default',
}) => {
  const buttonSize = size + 20; // Add padding

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    switch (variant) {
      case 'primary':
        return glassTokens.colors.accent.primary;
      case 'secondary':
        return glassTokens.colors.background.darkGrey;
      default:
        return glassTokens.colors.background.darkGrey;
    }
  };

  const getIconColor = () => {
    if (color) return color;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      default:
        return glassTokens.colors.text.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={style}
    >
      <View
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: getBackgroundColor(),
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Ionicons name={icon} size={size} color={getIconColor()} />
      </View>
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
    shadowRadius: 4,
    elevation: 2,
  },
});

