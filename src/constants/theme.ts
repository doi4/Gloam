import '@/global.css';
import { Platform } from 'react-native';

export type ThemeColor =
  | 'text'
  | 'background'
  | 'backgroundElement'
  | 'backgroundSelected'
  | 'textSecondary'
  | 'accent'
  | 'card'
  | 'border';

export type ThemePalette = Record<ThemeColor, string>;

export const Colors = {
  // BeReal-inspired True OLED Black Theme
  dark: {
    text: '#FFFFFF',
    background: '#000000', // Pure OLED True Black (0x000000)
    backgroundElement: '#121212', // Subtle matte dark card background
    backgroundSelected: '#242424', // Pill active / button background
    textSecondary: '#8E8E93', // Clean neutral secondary text
    accent: '#FF5722', // Subtle sunset orange
    card: '#121212',
    border: '#1C1C1E',
  },
  // Clean High-Contrast Light Theme
  light: {
    text: '#000000',
    background: '#FFFFFF',
    backgroundElement: '#F2F2F7',
    backgroundSelected: '#E5E5EA',
    textSecondary: '#6C6C70',
    accent: '#FF5722',
    card: '#FFFFFF',
    border: '#E5E5EA',
  },
  // Backward-compatible palette aliases
  golden: {
    text: '#FFFFFF',
    background: '#000000',
    backgroundElement: '#141414',
    backgroundSelected: '#28231D',
    textSecondary: '#A3988C',
    accent: '#FFA726',
    card: '#141414',
    border: '#28231D',
  },
  dusk: {
    text: '#FFFFFF',
    background: '#000000',
    backgroundElement: '#121212',
    backgroundSelected: '#242424',
    textSecondary: '#8E8E93',
    accent: '#FF5722',
    card: '#121212',
    border: '#1C1C1E',
  },
  twilight: {
    text: '#FFFFFF',
    background: '#000000',
    backgroundElement: '#121212',
    backgroundSelected: '#242424',
    textSecondary: '#8E8E93',
    accent: '#FF5722',
    card: '#121212',
    border: '#1C1C1E',
  },
  midnight: {
    text: '#FFFFFF',
    background: '#000000',
    backgroundElement: '#121212',
    backgroundSelected: '#242424',
    textSecondary: '#8E8E93',
    accent: '#FF5722',
    card: '#121212',
    border: '#1C1C1E',
  },
} as const satisfies Record<string, ThemePalette>;

export type ThemeType = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const TAB_BAR_HEIGHT = 55;
export const TAB_BAR_WIDTH = 372;

export function getTabBarBottomOffset(bottomInset: number = 0, platform: string = Platform.OS): number {
  return platform === 'ios' ? Math.max(bottomInset, 24) : 16;
}

export function getMenuBarClearance(bottomInset: number = 0, platform: string = Platform.OS): number {
  const bottomOffset = getTabBarBottomOffset(bottomInset, platform);
  return bottomOffset + TAB_BAR_HEIGHT + 20;
}

