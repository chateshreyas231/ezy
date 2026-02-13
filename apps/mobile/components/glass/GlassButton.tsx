import { Pressable, Text, PressableProps, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '../../lib/utils';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassButtonProps extends PressableProps {
    title?: string;
    variant?: 'primary' | 'secondary' | 'glass' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    className?: string;
    textClassName?: string;
    icon?: React.ReactNode;
}

export function GlassButton({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    className,
    textClassName,
    icon,
    disabled,
    children,
    ...props
}: GlassButtonProps) {
    const baseStyles = "rounded-full flex-row items-center justify-center overflow-hidden";

    const sizeStyles = {
        sm: "px-4 py-2",
        md: "px-6 py-3",
        lg: "px-8 py-4",
    };

    const textSizes = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    const content = (
        <>
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? 'white' : 'white'} className="mr-2" />
            ) : icon ? (
                <>{icon}</>
            ) : null}
            {title && (
                <Text
                    className={cn(
                        "font-semibold text-center",
                        textSizes[size],
                        variant === 'outline' ? 'text-white' : 'text-white',
                        textClassName
                    )}
                >
                    {title}
                </Text>
            )}
            {children}
        </>
    );

    if (variant === 'primary') {
        return (
            <Pressable
                className={cn(baseStyles, sizeStyles[size], "active:opacity-90", className)}
                disabled={disabled || loading}
                {...props}
            >
                <LinearGradient
                    colors={['#2F5CFF', '#0A1F5C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />
                {content}
            </Pressable>
        );
    }

    // Secondary/Glass variants use BlurView
    return (
        <Pressable
            className={cn(
                baseStyles,
                "border-[1px] border-white/20",
                sizeStyles[size],
                "active:bg-white/10",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            <BlurView
                intensity={20}
                tint="dark"
                style={{ position: 'absolute', width: '120%', height: '120%' }}
            />
            {/* Background overlay for tint */}
            <Pressable className="absolute inset-0 bg-white/5 w-full h-full" />
            {content}
        </Pressable>
    );
}
