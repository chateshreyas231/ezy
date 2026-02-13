// GlassSurface - Neutralized
import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'heavy';
  borderRadius?: number;
  borderOpacity?: number;
  tint?: 'light' | 'dark' | 'default';
  testID?: string;
  className?: string;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  testID,
}) => {
  return (
    <View
      style={[{ padding: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }, style]}
      testID={testID}
    >
      {children}
    </View>
  );
};

