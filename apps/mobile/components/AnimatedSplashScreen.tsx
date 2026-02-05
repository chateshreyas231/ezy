// Animated Splash Screen Component - Displays GIF
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationFinish?: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onAnimationFinish,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        source={require('../assets/images/splash.gif')}
        style={styles.gif}
        resizeMode="cover"
        onLoadStart={() => {
          console.log('AnimatedSplashScreen: GIF loading started');
        }}
        onLoadEnd={() => {
          console.log('AnimatedSplashScreen: GIF loaded successfully');
          // Optional: Add a small delay before calling onAnimationFinish
          // This ensures the GIF is fully loaded
          setTimeout(() => {
            onAnimationFinish?.();
          }, 200);
        }}
        onError={(error) => {
          console.error('AnimatedSplashScreen: Error loading splash GIF:', error);
          // Still call onAnimationFinish even if there's an error
          setTimeout(() => {
            onAnimationFinish?.();
          }, 500);
        }}
      />
      {/* Fallback background in case GIF doesn't load */}
      <View style={styles.fallback} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background matching the app theme
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gif: {
    width: SCREEN_WIDTH * 0.8, // 70% of screen width
    height: SCREEN_HEIGHT * 0.35, // 70% of screen height
    position: 'absolute',
    alignSelf: 'center',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: -1,
  },
});
