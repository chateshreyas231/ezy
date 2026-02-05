// IMPORTANT: react-native-gesture-handler must be imported first
import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/hooks/useAuth';
import { ThemeProvider } from '../lib/ThemeContext';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import '../lib/supabaseClient';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [splashVisible, setSplashVisible] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Hide native splash screen immediately to show our custom one
    SplashScreen.hideAsync().catch(() => {
      // Ignore errors
    });
    console.log('Splash screen: Native splash hidden, showing custom splash');
    
    // Start minimum time timer immediately
    const minTimer = setTimeout(() => {
      console.log('Splash screen: Minimum time elapsed');
      setMinTimeElapsed(true);
    }, 2500); // Minimum 2.5 seconds

    return () => clearTimeout(minTimer);
  }, []);

  useEffect(() => {
    // Hide splash when both conditions are met: fonts loaded AND minimum time elapsed
    if ((loaded || error) && minTimeElapsed && splashVisible) {
      console.log('Splash screen: Both conditions met, hiding splash');
      const hideTimer = setTimeout(() => {
        setSplashVisible(false);
      }, 500); // Small delay for smooth transition

      return () => clearTimeout(hideTimer);
    }
  }, [loaded, error, minTimeElapsed, splashVisible]);

  if (splashVisible) {
    return (
      <AnimatedSplashScreen
        onAnimationFinish={() => {
          // This callback is optional - the splash will hide based on the timer logic above
          console.log('AnimatedSplashScreen: Animation finished callback called');
        }}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBar style="dark" />
        <AuthProvider>
          <Stack screenOptions={{ 
            headerShown: false, 
            contentStyle: { 
              backgroundColor: '#FFFFFF',
            },
            animation: 'fade',
          }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(buyer)" />
            <Stack.Screen name="(seller)" />
            <Stack.Screen name="(pro)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="explore" />
            <Stack.Screen name="deal/[dealId]" />
            <Stack.Screen name="profile" />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

