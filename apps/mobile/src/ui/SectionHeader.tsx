// SectionHeader - Section title with "View all" link matching the image
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { glassTokens } from './tokens';

export interface SectionHeaderProps {
  title: string;
  onViewAllPress?: () => void;
  showViewAll?: boolean;
  style?: any;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onViewAllPress,
  showViewAll = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAllPress} activeOpacity={0.7}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
    paddingVertical: glassTokens.spacing.md,
  },
  title: {
    fontSize: glassTokens.typography.fontSize.xl,
    fontWeight: glassTokens.typography.fontWeight.bold,
    color: glassTokens.colors.text.primary,
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: glassTokens.typography.fontSize.sm,
    fontWeight: glassTokens.typography.fontWeight.medium,
    color: glassTokens.colors.text.secondary,
  },
});

