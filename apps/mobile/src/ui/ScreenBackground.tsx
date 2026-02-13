// ScreenBackground - Neutralized
import React from 'react';
import { View, ViewStyle, ImageSourcePropType } from 'react-native';

export interface ScreenBackgroundProps {
  children?: React.ReactNode;
  imageUrl?: string | ImageSourcePropType;
  gradient?: boolean;
  overlayOpacity?: number;
  style?: ViewStyle;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[{ flex: 1, backgroundColor: 'white' }, style]}>
      {children}
    </View>
  );
};

