import React from 'react';
import { View, Platform, ViewStyle, ColorValue } from 'react-native';
import { SymbolView } from 'expo-symbols';

export type IconName =
  | 'heart'
  | 'heart-fill'
  | 'plus'
  | 'sun'
  | 'settings'
  | 'location'
  | 'camera'
  | 'photo'
  | 'flip'
  | 'flash'
  | 'flash-off'
  | 'close'
  | 'moon'
  | 'system'
  | 'chevron-right'
  | 'bell'
  | 'user'
  | 'calendar'
  | 'feed'
  | 'globe';

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: ColorValue | string;
  style?: ViewStyle;
}

const SYMBOL_MAP: Record<
  IconName,
  {
    ios: any;
    android: any;
    web: any;
  }
> = {
  heart: {
    ios: 'heart',
    android: 'favorite_border',
    web: 'favorite_border',
  },
  'heart-fill': {
    ios: 'heart.fill',
    android: 'favorite',
    web: 'favorite',
  },
  plus: {
    ios: 'plus',
    android: 'add',
    web: 'add',
  },
  sun: {
    ios: 'sun.max.fill',
    android: 'sunny',
    web: 'sunny',
  },
  settings: {
    ios: 'gearshape.fill',
    android: 'settings',
    web: 'settings',
  },
  location: {
    ios: 'location.fill',
    android: 'location_on',
    web: 'location_on',
  },
  camera: {
    ios: 'camera.fill',
    android: 'camera',
    web: 'camera',
  },
  photo: {
    ios: 'photo.fill',
    android: 'photo',
    web: 'photo',
  },
  flip: {
    ios: 'camera.rotate.fill',
    android: 'refresh',
    web: 'refresh',
  },
  flash: {
    ios: 'bolt.fill',
    android: 'flash_on',
    web: 'flash_on',
  },
  'flash-off': {
    ios: 'bolt.slash.fill',
    android: 'flash_off',
    web: 'flash_off',
  },
  close: {
    ios: 'xmark',
    android: 'close',
    web: 'close',
  },
  moon: {
    ios: 'moon.fill',
    android: 'dark_mode',
    web: 'dark_mode',
  },
  system: {
    ios: 'circle.lefthalf.filled',
    android: 'contrast',
    web: 'contrast',
  },
  'chevron-right': {
    ios: 'chevron.right',
    android: 'chevron_right',
    web: 'chevron_right',
  },
  bell: {
    ios: 'bell.fill',
    android: 'notifications',
    web: 'notifications',
  },
  user: {
    ios: 'person.fill',
    android: 'person',
    web: 'person',
  },
  calendar: {
    ios: 'calendar',
    android: 'calendar_today',
    web: 'calendar_today',
  },
  feed: {
    ios: 'square.stack.fill',
    android: 'dynamic_feed',
    web: 'dynamic_feed',
  },
  globe: {
    ios: 'globe',
    android: 'public',
    web: 'public',
  },
};

export function AppIcon({ name, size = 18, color = '#FFFFFF', style }: AppIconProps) {
  const colorStr = typeof color === 'string' ? color : '#FFFFFF';

  // Precision vector rendering on Web for flawless icons
  if (Platform.OS === 'web') {
    if (name === 'heart-fill') {
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <svg viewBox="0 0 24 24" width={size} height={size} fill={colorStr}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </View>
      );
    }
    if (name === 'heart') {
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke={colorStr}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </View>
      );
    }
    if (name === 'plus') {
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke={colorStr}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </View>
      );
    }
  }

  // Native iOS and Android rendering via SymbolView
  const symbol = SYMBOL_MAP[name];

  return (
    <View
      style={[
        { width: size, height: size, justifyContent: 'center', alignItems: 'center' },
        style,
      ]}>
      <SymbolView
        name={symbol}
        size={size}
        tintColor={color}
        weight="bold"
      />
    </View>
  );
}
