// Clean Button Component - Neutralized
import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

export interface LiquidGlassButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{ padding: 10, backgroundColor: '#eee', borderWidth: 1, borderColor: '#999', marginVertical: 5, alignItems: 'center' }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Text style={{ color: '#000' }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

