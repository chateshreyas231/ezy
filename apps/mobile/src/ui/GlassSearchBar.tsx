// GlassSearchBar - Neutralized
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface GlassSearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  style?: any;
}

export const GlassSearchBar: React.FC<GlassSearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onFilterPress,
  style,
}) => {
  return (
    <View style={[{ padding: 10, borderWidth: 1, borderColor: '#ccc', flexDirection: 'row', alignItems: 'center' }, style]}>
      <Ionicons name="search" size={20} color="black" style={{ marginRight: 10 }} />
      <TextInput
        style={{ flex: 1 }}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress}>
          <Ionicons name="options" size={20} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};

