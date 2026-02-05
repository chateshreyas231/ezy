// GlassPill - Pill-shaped chip component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { GlassSurface } from './GlassSurface';
import { glassTokens } from './tokens';

export interface GlassPillProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const GlassPill: React.FC<GlassPillProps> = ({
  label,
  onPress,
  selected = false,
  style,
  textStyle,
  size = 'md',
}) => {
  const padding = size === 'sm' ? 6 : size === 'md' ? 10 : 14;
  const fontSize = size === 'sm' ? glassTokens.typography.fontSize.xs : 
                   size === 'md' ? glassTokens.typography.fontSize.sm : 
                   glassTokens.typography.fontSize.base;

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component onPress={onPress} activeOpacity={0.7}>
      <GlassSurface
        intensity={selected ? 'heavy' : 'light'}
        borderRadius={glassTokens.radius.full}
        borderOpacity={selected ? glassTokens.border.opacity.heavy : glassTokens.border.opacity.light}
        style={[
          styles.pill,
          { paddingHorizontal: padding, paddingVertical: padding / 2 },
          selected && styles.selected,
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize,
              color: selected ? glassTokens.colors.text.primary : glassTokens.colors.text.secondary,
              fontWeight: selected ? glassTokens.typography.fontWeight.semibold : glassTokens.typography.fontWeight.regular,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </GlassSurface>
    </Component>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    ...glassTokens.shadow.soft,
  },
  selected: {
    borderColor: glassTokens.colors.accent.tertiary,
    backgroundColor: `${glassTokens.colors.accent.primary}12`,
    ...glassTokens.shadow.glow,
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

