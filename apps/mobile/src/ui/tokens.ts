export const glassTokens = {
  // Border radius - Neutralized
  radius: {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    xxl: 0,
    '2xl': 0,
    '3xl': 0,
    full: 0,
  },

  // Border styles
  border: {
    width: 0,
    opacity: {
      light: 0,
      medium: 0,
      heavy: 0,
    },
    color: 'transparent',
  },

  // Glass opacity levels
  glass: {
    opacity: {
      light: 0,
      medium: 0,
      heavy: 0,
    },
    background: {
      light: 'transparent',
      medium: 'transparent',
      heavy: 'transparent',
    },
  },

  // Blur intensity
  blur: {
    ios: {
      light: 0,
      medium: 0,
      heavy: 0,
    },
    android: {
      light: 0,
      medium: 0,
      heavy: 0,
    },
  },

  // Colors - Neutralized
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#ffffff',
      darkGrey: '#ffffff',
      overlay: 'transparent',
      white: '#ffffff',
      dark: '#ffffff',
    },

    accent: {
      primary: '#000000', // Basic black for visibility
      secondary: '#000000',
      tertiary: '#000000',
      glow: 'transparent',
      success: '#000000',
      error: '#000000',
      warning: '#000000',
    },

    text: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#000000',
      inverse: '#000000',
      light: '#000000',
      dark: '#000000',
    },

    // Status
    status: {
      success: '#000000',
      warning: '#000000',
      error: '#000000',
      info: '#000000',
      successGlow: 'transparent',
      errorGlow: 'transparent',
    }
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
      xxl: 24,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
      display: 32,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '400' as const,
      semibold: '400' as const,
      bold: '400' as const,
    },
    lineHeight: {
      tight: 1,
      normal: 1,
      relaxed: 1,
    },
  },

  // Spacing - Minimal or 0
  spacing: {
    xs: 0,
    sm: 5,
    md: 10,
    lg: 15,
    xl: 20,
    xxl: 25,
    '2xl': 25,
    '3xl': 30,
    '4xl': 35,
    '5xl': 40,
  },

  // Component spacing
  componentSpacing: {
    screenPadding: 0,
    cardPadding: 0,
    inputPaddingHorizontal: 0,
    inputPaddingVertical: 0,
    buttonPaddingHorizontal: 0,
    buttonPaddingVertical: 0,
    sectionSpacing: 0,
    itemSpacing: 0,
  },

  // Shadows - None
  shadows: {
    sm: { shadowOpacity: 0, elevation: 0 },
    md: { shadowOpacity: 0, elevation: 0 },
    lg: { shadowOpacity: 0, elevation: 0 },
    glow: { shadowOpacity: 0, elevation: 0 },
    soft: { shadowOpacity: 0, elevation: 0 },
  },

  // Compatibility
  shadow: {
    soft: { shadowOpacity: 0, elevation: 0 },
    medium: { shadowOpacity: 0, elevation: 0 },
    large: { shadowOpacity: 0, elevation: 0 },
    glow: { shadowOpacity: 0, elevation: 0 },
  }
} as const;

export type GlassTokens = typeof glassTokens;
