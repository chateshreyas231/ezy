import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewProps } from 'react-native';

interface GradientBackgroundProps extends ViewProps {
    variant?: 'primary' | 'dark' | 'card';
}

export function GradientBackground({ children, style, variant = 'primary', ...props }: GradientBackgroundProps) {
    const getColors = () => {
        switch (variant) {
            case 'dark':
                return ['#050510', '#0A1F5C', '#000000']; // Deep black to dark blue
            case 'card':
                return ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']; // Subtle glass
            case 'primary':
            default:
                // The signature Ezriya Blue-to-Black gradient
                return ['#050510', '#0a1025', '#0A1F5C'];
        }
    };

    return (
        <LinearGradient
            colors={getColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, style]}
            {...props}
        >
            {children}
        </LinearGradient>
    );
}
