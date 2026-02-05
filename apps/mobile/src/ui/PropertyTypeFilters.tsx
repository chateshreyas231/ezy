// PropertyTypeFilters - Horizontal scrollable property type pills matching the image
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { glassTokens } from './tokens';

export type PropertyType = 'house' | 'apartment' | 'hotel' | 'villa' | 'condo';

export interface PropertyTypeFiltersProps {
  selectedType?: PropertyType;
  onTypeSelect?: (type: PropertyType) => void;
  style?: any;
}

const propertyTypes: { type: PropertyType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'house', label: 'House', icon: 'home' },
  { type: 'apartment', label: 'Apartment', icon: 'business' },
  { type: 'hotel', label: 'Hotel', icon: 'bed' },
  { type: 'villa', label: 'Villa', icon: 'home-outline' },
  { type: 'condo', label: 'Condo', icon: 'business-outline' },
];

export const PropertyTypeFilters: React.FC<PropertyTypeFiltersProps> = ({
  selectedType = 'house',
  onTypeSelect,
  style,
}) => {
  const blurIntensity = Platform.OS === 'ios' 
    ? glassTokens.blur.ios.light
    : glassTokens.blur.android.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {propertyTypes.map((item) => {
        const isSelected = selectedType === item.type;
        return (
          <TouchableOpacity
            key={item.type}
            onPress={() => onTypeSelect?.(item.type)}
            style={styles.pillContainer}
            activeOpacity={0.7}
          >
            <BlurView
              intensity={blurIntensity}
              tint="light"
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
              ]}
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimez' : undefined}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={isSelected ? '#FFFFFF' : glassTokens.colors.text.primary}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                ]}
              >
                {item.label}
              </Text>
            </BlurView>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    paddingVertical: glassTokens.spacing.md,
    gap: glassTokens.spacing.sm,
  },
  pillContainer: {
    marginRight: glassTokens.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: glassTokens.spacing.lg,
    paddingVertical: glassTokens.spacing.md,
    borderRadius: glassTokens.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    ...glassTokens.shadow.soft,
  },
  pillSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  icon: {
    marginRight: glassTokens.spacing.xs,
  },
  label: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.primary,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: glassTokens.typography.fontWeight.semibold,
  },
});

