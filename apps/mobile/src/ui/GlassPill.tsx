// GlassPill - Neutralized
import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

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
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component onPress={onPress}>
      <View
        style={[
          { padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', marginRight: 5, backgroundColor: selected ? '#ddd' : 'transparent' },
          style,
        ]}
      >
        <Text style={{ fontSize: 12 }}>
          {label}
        </Text>
      </View>
    </Component>
  );
};

