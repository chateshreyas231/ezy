// Clean Light Theme - Minimalist Card-Based Design
export const theme = {
  colors: {
    // Background colors - Light theme (white, light grey)
    background: '#FFFFFF', // Pure white base
    backgroundSecondary: '#F5F5F5', // Very light grey
    backgroundTertiary: '#FAFAFA', // Off-white for elevated surfaces
    
    // Primary colors - Accent brown and greys
    primary: '#8B5E50', // Deep reddish-brown accent
    primaryDark: '#6B4A3D', // Darker brown
    primaryLight: '#A67C6B', // Lighter brown
    primaryGlow: 'rgba(139, 94, 80, 0.2)', // Brown glow effect
    
    // Secondary accent colors
    secondary: '#595959', // Dark grey accent
    secondaryLight: '#757575', // Medium grey
    secondaryDark: '#424242', // Darker grey
    
    // Tertiary accent - Light grey for secondary elements
    tertiary: '#C8C8C8', // Light grey for secondary buttons/elements
    
    // Text colors - Dark on light background
    text: '#000000', // Black primary text
    textSecondary: 'rgba(0, 0, 0, 0.7)', // Dark grey secondary text
    textTertiary: 'rgba(0, 0, 0, 0.5)', // Medium grey tertiary text
    textLight: '#FFFFFF', // White text for dark backgrounds
    
    // Accent colors - Status colors
    success: '#10B981', // Emerald green
    error: '#EF4444', // Red
    warning: '#F59E0B', // Amber
    info: '#3B82F6', // Blue
    
    // Card colors - White cards with subtle borders
    card: '#FFFFFF', // White card background
    cardBorder: 'rgba(0, 0, 0, 0.08)', // Subtle dark border
    cardGlow: 'rgba(139, 94, 80, 0.05)', // Subtle brown glow
    
    // Glass overlay colors (for modals/overlays)
    glassLight: 'rgba(255, 255, 255, 0.9)',
    glassMedium: 'rgba(255, 255, 255, 0.95)',
    glassHeavy: '#FFFFFF',
    
    // Divider and separator - Subtle grey lines
    divider: 'rgba(0, 0, 0, 0.1)',
    separator: 'rgba(0, 0, 0, 0.05)',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Swipe actions - Brown for yes, grey for no
    swipeYes: '#8B5E50', // Brown for match
    swipeYesGlow: 'rgba(139, 94, 80, 0.3)',
    swipeNo: '#C8C8C8', // Light grey for pass
    swipeNoGlow: 'rgba(200, 200, 200, 0.3)',
    
    // Input field colors
    inputBackground: '#F5F5F5', // Light grey input background
    inputBorder: 'rgba(0, 0, 0, 0.1)',
    inputPlaceholder: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Glassmorphism effects
  glassmorphism: {
    // Blur intensity (for expo-blur)
    blurIntensity: 20,
    // Background opacity
    backgroundOpacity: 0.5,
    // Border opacity
    borderOpacity: 0.1,
    // Shadow for depth
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    // Light shadow for subtle elevation
    shadowLight: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
  },
  
  typography: {
    // Font families
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      semibold: 'System',
    },
    
    // Font sizes
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
    
    // Font weights
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // Line heights
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
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    // Glow effects - Brown accent
    glow: {
      shadowColor: '#8B5E50',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 0,
    },
    glowPrimary: {
      shadowColor: '#8B5E50',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 0,
    },
  },
  
  // Component-specific styles - Clean light theme
  components: {
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
    },
    button: {
      primary: {
        backgroundColor: '#8B5E50',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
      },
      secondary: {
        backgroundColor: '#C8C8C8',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderWidth: 0,
      },
      tertiary: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
    },
    input: {
      backgroundColor: '#F5F5F5',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      color: '#000000',
    },
  },
};

export type Theme = typeof theme;

