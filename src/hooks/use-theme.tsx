import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { Colors, ThemePalette, ThemeType } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ManualMode = 'light' | 'dark';

export type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  oledMode: boolean;
  setOledMode: (enabled: boolean) => void;
  isAuto: boolean;
  setIsAuto: (isAuto: boolean) => void;
  manualMode: ManualMode;
  setManualMode: (mode: ManualMode) => void;
  isDark: boolean;
  colors: ThemePalette;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [oledMode, setOledMode] = useState<boolean>(true); // True OLED is the default and only option for dark mode
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<ManualMode>('dark');
  const [theme, setTheme] = useState<ThemeType>('dark');

  // Compute active dark state
  const isDark =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  useEffect(() => {
    if (themeMode === 'system') {
      const active = systemColorScheme === 'dark' ? 'dark' : 'light';
      setTheme(active);
      setManualMode(active);
    } else {
      setTheme(themeMode);
      setManualMode(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  // Dark mode is always Pure True OLED Black (#000000)
  const basePalette = Colors[theme] || Colors.dark;
  const colors: ThemePalette = {
    ...basePalette,
    background: isDark ? '#000000' : '#FFFFFF',
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeMode,
        setThemeMode,
        oledMode: true,
        setOledMode: () => {},
        isAuto,
        setIsAuto,
        manualMode,
        setManualMode,
        isDark,
        colors,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useGloamTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      setTheme: () => {},
      themeMode: 'dark',
      setThemeMode: () => {},
      oledMode: true,
      setOledMode: () => {},
      isAuto: false,
      setIsAuto: () => {},
      manualMode: 'dark',
      setManualMode: () => {},
      isDark: true,
      colors: Colors.dark as ThemePalette,
    };
  }
  return context;
}

export function useTheme(): ThemePalette {
  const { colors } = useGloamTheme();
  return colors;
}
