// constants/Theme.ts
// Premium dark theme with sophisticated design system
import { Platform } from 'react-native';

export const Theme = {
  colors: {
    // Modern warm dark background - popular deep purple/charcoal
    background: '#0F0B1E',
    backgroundGradient: ['#0F0B1E', '#1A1625'],
    // Secondary dark surface - warm dark purple
    surface: '#1A1625',
    // Elevated surface (cards, modals) - premium warm purple
    surfaceElevated: '#25203A',
    surfaceElevated2: '#2D2545',
    // Accent color - modern vibrant purple/teal gradient (very popular)
    accent: '#8B5CF6', // Vibrant purple
    accentGradient: ['#8B5CF6', '#06B6D4'], // Purple to teal
    accentLight: '#A78BFA',
    accentDark: '#7C3AED',
    // Secondary accent - warm teal (complementary)
    secondary: '#06B6D4', // Teal
    secondaryLight: '#22D3EE',
    secondaryDark: '#0891B2',
    // Tertiary accent - warm amber (popular accent)
    tertiary: '#F59E0B', // Amber
    tertiaryLight: '#FBBF24',
    tertiaryDark: '#D97706',
    // Text colors - high contrast for readability
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E7EB', // Light gray
    textTertiary: '#9CA3AF', // Medium gray
    // Border and divider - warm purple tint
    border: '#3D3552',
    borderLight: '#4A415F',
    // Status colors - vibrant and clear
    success: '#10B981', // Emerald
    successLight: '#34D399',
    warning: '#F59E0B', // Amber
    warningLight: '#FBBF24',
    error: '#EF4444', // Red
    errorLight: '#F87171',
    info: '#06B6D4', // Teal
    infoLight: '#22D3EE',
    // Premium overlays
    overlay: 'rgba(15, 11, 30, 0.8)',
    overlayLight: 'rgba(15, 11, 30, 0.5)',
    // Glass effect with warm tint
    glass: 'rgba(37, 32, 58, 0.9)',
    glassLight: 'rgba(37, 32, 58, 0.6)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  typography: {
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      letterSpacing: -0.8,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 30,
      letterSpacing: -0.3,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      lineHeight: 18,
      letterSpacing: 0.2,
      textTransform: 'uppercase' as const,
    },
  },
  borderRadius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
    },
    // Premium glow effects
    glow: {
      shadowColor: '#818CF8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    glowAccent: {
      shadowColor: '#818CF8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  // Premium animations
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: {
      damping: 15,
      stiffness: 300,
    },
    springSmooth: {
      damping: 20,
      stiffness: 200,
    },
  },
  // Premium effects
  effects: {
    blur: Platform.OS === 'ios' ? 20 : 15,
    glassOpacity: 0.8,
  },
};
