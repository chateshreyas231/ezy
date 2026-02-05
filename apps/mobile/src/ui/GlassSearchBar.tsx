// GlassSearchBar - Frosted glass search bar matching the image
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { glassTokens } from './tokens';

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
  const blurIntensity = Platform.OS === 'ios' 
    ? glassTokens.blur.ios.medium
    : glassTokens.blur.android.medium;

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={blurIntensity}
        tint="light"
        style={styles.blurView}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
      >
        <View style={styles.content}>
          <Ionicons 
            name="search" 
            size={20} 
            color={glassTokens.colors.text.tertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={glassTokens.colors.text.tertiary}
            value={value}
            onChangeText={onChangeText}
          />
          {onFilterPress && (
            <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
              <Ionicons 
                name="options" 
                size={20} 
                color={glassTokens.colors.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: glassTokens.radius.xl,
    overflow: 'hidden',
    backgroundColor: glassTokens.colors.background.darkGrey,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  blurView: {
    borderRadius: glassTokens.radius.xl,
    backgroundColor: glassTokens.colors.background.darkGrey,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: glassTokens.spacing.md,
    paddingVertical: glassTokens.spacing.md,
    minHeight: 52,
  },
  searchIcon: {
    marginRight: glassTokens.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: glassTokens.typography.fontSize.base,
    color: glassTokens.colors.text.primary,
    fontWeight: glassTokens.typography.fontWeight.regular,
    padding: 0,
  },
  filterButton: {
    marginLeft: glassTokens.spacing.sm,
    padding: glassTokens.spacing.xs,
  },
});

