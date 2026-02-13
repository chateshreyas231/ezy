// Clean Button Component - Neutralized
import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

export interface GlassButtonProps {
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

export const GlassButton: React.FC<GlassButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        padding: 10,
        backgroundColor: '#eee',
        borderWidth: 1,
        borderColor: '#999',
        marginVertical: 5,
        alignItems: 'center'
      }}
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

