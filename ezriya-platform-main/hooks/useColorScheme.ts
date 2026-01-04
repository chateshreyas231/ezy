import { useColorScheme as _useColorScheme } from 'react-native';

/**
 * A hook that returns the current color scheme ('light' or 'dark').
 * Falls back to 'light' if no system preference is set.
 */
export function useColorScheme(): 'light' | 'dark' {
  return _useColorScheme() ?? 'light';
}
