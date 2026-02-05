// LiquidGlass - Wrapper for liquid-glass-react with React Native support
import React, { useRef } from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { glassTokens } from './tokens';

// For web, use liquid-glass-react; for native, use BlurView fallback
let LiquidGlassWeb: any = null;
if (Platform.OS === 'web') {
  try {
    LiquidGlassWeb = require('liquid-glass-react');
  } catch (e) {
    console.warn('liquid-glass-react not available, using fallback');
  }
}

export interface LiquidGlassProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  displacementScale?: number;
  blurAmount?: number;
  saturation?: number;
  aberrationIntensity?: number;
  elasticity?: number;
  cornerRadius?: number;
  padding?: string | number;
  overLight?: boolean;
  onClick?: () => void;
  mode?: 'standard' | 'polar' | 'prominent' | 'shader';
  testID?: string;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  style,
  className = '',
  displacementScale = 64,
  blurAmount = 0.1,
  saturation = 130,
  aberrationIntensity = 2,
  elasticity = 0.35,
  cornerRadius = 16,
  padding,
  overLight = false,
  onClick,
  mode = 'standard',
  testID,
}) => {
  // On web, use liquid-glass-react if available
  if (Platform.OS === 'web' && LiquidGlassWeb) {
    const LiquidGlassComponent = LiquidGlassWeb.default || LiquidGlassWeb;
    const paddingValue = typeof padding === 'number' ? `${padding}px` : padding || '0px';
    
    return (
      <LiquidGlassComponent
        displacementScale={displacementScale}
        blurAmount={blurAmount}
        saturation={saturation}
        aberrationIntensity={aberrationIntensity}
        elasticity={elasticity}
        cornerRadius={cornerRadius}
        padding={paddingValue}
        overLight={overLight}
        onClick={onClick}
        mode={mode}
        className={className}
        style={style}
      >
        {children}
      </LiquidGlassComponent>
    );
  }

  // Native fallback: Enhanced BlurView with better styling
  const borderRadius = typeof cornerRadius === 'number' ? cornerRadius : 16;
  const paddingValue = typeof padding === 'number' ? padding : 
                      typeof padding === 'string' ? parseFloat(padding) || 0 : 0;

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius,
          padding: paddingValue,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
        },
        glassTokens.shadow.soft,
        style,
      ]}
      onTouchEnd={onClick}
      testID={testID}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 70 : 40}
        tint="light"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
          },
        ]}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    overflow: 'hidden',
  },
});

