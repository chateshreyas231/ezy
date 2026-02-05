// components/ui/SafeScreen.tsx
// Wrapper component for consistent SafeAreaView usage across all screens
import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../constants/Theme';

interface SafeScreenProps {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export default function SafeScreen({
  children,
  edges = ['top', 'bottom'],
  scrollable = false,
  style,
  contentContainerStyle,
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      paddingTop: edges.includes('top') ? 0 : insets.top,
      paddingBottom: edges.includes('bottom') ? 0 : insets.bottom,
      paddingLeft: edges.includes('left') ? 0 : insets.left,
      paddingRight: edges.includes('right') ? 0 : insets.right,
    },
    style,
  ];

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <View style={containerStyle}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

