import React, { createContext, useContext, ReactNode } from 'react';

// Simplified / no-op theme
const dummyTheme = {};

const ThemeContext = createContext<any>(dummyTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={dummyTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return dummyTheme;
}

