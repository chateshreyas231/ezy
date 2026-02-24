import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '../constants/theme';

export function GlassCard({
  children,
  style,
  padding = 14,
}: {
  children: ReactNode;
  style?: ViewStyle;
  padding?: number;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <BlurView intensity={40} tint="dark" style={[styles.blur, { padding }]}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  blur: {
    borderRadius: radius.md,
  },
});
