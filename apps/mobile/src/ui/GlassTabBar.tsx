// Floating Blurred Pill Tab Bar - Dark glassmorphism style
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { glassTokens } from './tokens';

export const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={styles.container}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={100}
        tint="light"
        style={styles.blurContainer}
      >
        <View style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom ?? 0, 12), // 12 by default, but adapts for safe areas
          },
        ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = isFocused ? glassTokens.colors.accent.primary : glassTokens.colors.text.tertiary;
          const labelColor = isFocused ? glassTokens.colors.accent.primary : glassTokens.colors.text.tertiary;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {options.tabBarIcon && (
                <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                  {options.tabBarIcon({
                    focused: isFocused,
                    color: iconColor,
                    size: isFocused ? 26 : 24,
                  })}
                </View>
              )}
              <Text
                style={[
                  styles.label,
                  { color: labelColor },
                  isFocused && styles.labelFocused,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {typeof label === 'string' ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: glassTokens.componentSpacing.screenPadding,
  },
  blurContainer: {
    width: '100%',
    borderRadius: 50, // Ultra-rounded pill
    overflow: 'hidden',
    backgroundColor: glassTokens.glass.background.heavy,
    borderWidth: 0.5,
    borderColor: 'rgba(186, 104, 200, 0.3)', // Light purple border
    ...glassTokens.shadow.large,
    // Liquid glass effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: glassTokens.spacing.sm,
    minHeight: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    height: 55,
    maxWidth: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
    borderRadius: 23,
    marginBottom: 1,
  },
  iconContainerActive: {
    backgroundColor: `${glassTokens.colors.accent.primary}15`,
    borderWidth: 1.5,
    borderColor: `${glassTokens.colors.accent.tertiary}60`,
    ...glassTokens.shadow.glow,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '100%',
    marginTop: 2,
  },
  labelFocused: {
    fontWeight: '700',
  },
});

