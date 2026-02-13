// Clean Light Theme - Minimalist Card-Based Design
// Dark Mode First Theme - "Pointgroup" Aesthetic
export const theme = {
  colors: {
    // Background colors - Deep Black & Dark Zinc
    background: '#050505', // Deepest Black
    backgroundSecondary: '#121212', // Slightly lighter for cards/sections
    backgroundTertiary: '#1E1E1E', // For elevated surfaces

    // Primary colors - Purple/Blue Gradients
    primary: '#8B5CF6', // Vivid Purple
    primaryDark: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryGlow: 'rgba(139, 92, 246, 0.5)',

    // Secondary accent colors
    secondary: '#27272A', // Zinc-800
    secondaryLight: '#3F3F46',
    secondaryDark: '#18181B',

    // Tertiary accent
    tertiary: '#52525B',

    // Text colors - High Contrast
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    textLight: '#FFFFFF',
    textDark: '#000000', // For text on light accents

    // Status colors
    success: '#10B981', // Emerald
    error: '#EF4444', // Red
    warning: '#F59E0B', // Amber
    info: '#06B6D4', // Cyan

    // Card colors
    card: '#121212',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardGlow: 'rgba(139, 92, 246, 0.15)',

    // Glass overlay colors
    glassLight: 'rgba(255, 255, 255, 0.1)',
    glassMedium: 'rgba(20, 20, 20, 0.6)', // Dark glass
    glassHeavy: 'rgba(10, 10, 10, 0.8)',

    // Divider
    divider: 'rgba(255, 255, 255, 0.1)',
    separator: 'rgba(255, 255, 255, 0.05)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Swipe actions
    swipeYes: '#8B5CF6',
    swipeYesGlow: 'rgba(139, 92, 246, 0.4)',
    swipeNo: '#3F3F46',
    swipeNoGlow: 'rgba(63, 63, 70, 0.4)',

    // Input field colors
    inputBackground: '#18181B',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputPlaceholder: 'rgba(255, 255, 255, 0.4)',
  },

  // Glassmorphism effects
  glassmorphism: {
    blurIntensity: 30, // Increased blur
    backgroundOpacity: 0.6,
    borderOpacity: 0.15,
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 12,
    },
    shadowLight: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      semibold: 'System',
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

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  borderRadius: {
    sm: 12,
    md: 16,
    lg: 24, // Increased for softer look
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 16,
    },
    glow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 0,
    },
    glowPrimary: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 30,
      elevation: 0,
    },
  },

  components: {
    card: {
      backgroundColor: '#121212',
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    },
    button: {
      primary: {
        backgroundColor: '#8B5CF6',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 32,
      },
      secondary: {
        backgroundColor: '#27272A',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderWidth: 0,
      },
      tertiary: {
        backgroundColor: 'transparent',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    },
    input: {
      backgroundColor: '#18181B',
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
    },
  },
};

export type Theme = typeof theme;

