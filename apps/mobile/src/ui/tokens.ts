// Glass Design System - Design Tokens
// Matches the frosted glass / glassmorphism aesthetic

export const glassTokens = {
  // Border radius - Ultra rounded for liquid feel
  radius: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
    '3xl': 40,
    full: 9999,
  },

  // Border styles - Softer, more fluid
  border: {
    width: 0.5, // Thinner for liquid feel
    opacity: {
      light: 0.12,
      medium: 0.18,
      heavy: 0.25,
    },
    color: 'rgba(106, 27, 154, 0.15)', // Softer purple border
  },

  // Glass opacity levels - More transparent for liquid effect
  glass: {
    opacity: {
      light: 0.08,
      medium: 0.15,
      heavy: 0.25,
    },
    // Background tint colors - Ultra-transparent liquid glass
    background: {
      light: 'rgba(255, 255, 255, 0.4)', // Very light liquid glass
      medium: 'rgba(255, 255, 255, 0.65)', // Medium liquid glass
      heavy: 'rgba(255, 255, 255, 0.85)', // Heavy liquid glass
    },
  },

  // Blur intensity - Stronger for liquid glass effect
  blur: {
    ios: {
      light: 60,
      medium: 80,
      heavy: 100,
    },
    android: {
      light: 35,
      medium: 50,
      heavy: 65,
    },
  },

  // Shadows - Softer, more diffused for liquid glass
  shadow: {
    soft: {
      shadowColor: '#6A1B9A', // Purple shadow
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 3,
    },
    medium: {
      shadowColor: '#6A1B9A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 6,
    },
    large: {
      shadowColor: '#6A1B9A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
      elevation: 10,
    },
    glow: {
      shadowColor: '#BA68C8', // Light purple glow
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
  },

  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing scale - Perfect 8px grid system
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
    '5xl': 64,
    '6xl': 80,
  },
  
  // Component-specific spacing
  componentSpacing: {
    cardPadding: 20,
    cardPaddingLarge: 24,
    buttonPaddingVertical: 16,
    buttonPaddingHorizontal: 32,
    inputPaddingVertical: 16,
    inputPaddingHorizontal: 16,
    screenPadding: 20,
    screenPaddingLarge: 24,
    sectionSpacing: 32,
    itemSpacing: 16,
  },

  // Colors - Bone White & Dark Purple Theme
  colors: {
    // Text - Dark on light background
    text: {
      primary: '#2C1810', // Dark brown/charcoal for readability on bone white
      secondary: 'rgba(44, 24, 16, 0.7)', // Muted dark
      tertiary: 'rgba(44, 24, 16, 0.5)', // More muted
      disabled: 'rgba(44, 24, 16, 0.3)', // Disabled state
      dark: '#2C1810',
      darkSecondary: 'rgba(44, 24, 16, 0.7)',
      light: '#FFFFFF', // For text on dark purple
    },
    // Background - Liquid white theme with subtle gradients
    background: {
      dark: '#FAFAFA', // Subtle off-white base
      darkGrey: '#F8F8F8', // Very light grey
      mediumGrey: '#F5F5F5', // Light grey
      lightGrey: '#F0F0F0', // Lighter grey
      white: '#FFFFFF', // Pure white
      overlay: 'rgba(255, 255, 255, 0.92)', // Soft white overlay
      overlayLight: 'rgba(255, 255, 255, 0.75)',
      overlayWhite: 'rgba(255, 255, 255, 0.95)', // White overlay
      overlayDark: 'rgba(74, 20, 140, 0.85)', // Dark purple overlay
      // Liquid glass backgrounds - ultra-transparent
      glassDark: 'rgba(255, 255, 255, 0.5)', // Light liquid glass
      glassMedium: 'rgba(255, 255, 255, 0.7)', // Medium liquid glass
      glassHeavy: 'rgba(255, 255, 255, 0.85)', // Heavy liquid glass
    },
    // Accent - Dark Purple theme
    accent: {
      primary: '#6A1B9A', // Dark purple primary
      primaryDark: '#4A148C', // Deeper dark purple
      secondary: '#9C27B0', // Medium purple
      tertiary: '#BA68C8', // Light purple
      success: '#4CAF50', // Green
      error: '#F44336', // Red
      warning: '#FF9800', // Orange
    },
    // Grey scale
    grey: {
      '50': '#FAFAFA',
      '100': '#F5F5F5',
      '200': '#EEEEEE',
      '300': '#E0E0E0',
      '400': '#BDBDBD',
      '500': '#9E9E9E',
      '600': '#757575',
      '700': '#616161',
      '800': '#424242',
      '900': '#212121',
    },
  },
} as const;

export type GlassTokens = typeof glassTokens;

