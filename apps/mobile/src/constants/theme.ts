/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#191c1d', // on-surface
    background: '#f8f9fa',
    backgroundElement: '#edeeef', // surface-container
    backgroundSelected: '#e7e8e9', // surface-container-high
    textSecondary: '#434654', // on-surface-variant
    primary: '#003fb1',
    primaryContainer: '#1a56db',
    onPrimary: '#ffffff',
    primaryFixed: '#dbe1ff',
    primaryFixedDim: '#b5c4ff',
    secondary: '#006c49',
    onSecondary: '#ffffff',
    secondaryContainer: '#6cf8bb',
    onSecondaryContainer: '#00714d',
    tertiary: '#694100',
    onTertiary: '#ffffff',
    tertiaryContainer: '#895600',
    onTertiaryContainer: '#ffd6a8',
    surface: '#f8f9fa',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f3f4f5',
    surfaceContainer: '#edeeef',
    surfaceContainerHigh: '#e7e8e9',
    surfaceContainerHighest: '#e1e3e4',
    onSurface: '#191c1d',
    onSurfaceVariant: '#434654',
    outline: '#737686',
    outlineVariant: '#c3c5d7',
    error: '#ba1a1a',
    inverseSurface: '#2e3132',
    surfaceTint: '#1353d8',
  },
  dark: {
    text: '#ffffff',
    background: '#191c1d', // reversed for dark mode approximation
    backgroundElement: '#2e3132',
    backgroundSelected: '#434654',
    textSecondary: '#c3c5d7',
    primary: '#b5c4ff',
    primaryContainer: '#003fb1',
    onPrimary: '#000000',
    primaryFixed: '#dbe1ff',
    primaryFixedDim: '#b5c4ff',
    secondary: '#6cf8bb',
    onSecondary: '#003823',
    secondaryContainer: '#005236',
    onSecondaryContainer: '#89fbd1',
    tertiary: '#ffb95e',
    onTertiary: '#382000',
    tertiaryContainer: '#503000',
    onTertiaryContainer: '#ffd6a8',
    surface: '#191c1d',
    surfaceContainerLowest: '#0f1112',
    surfaceContainerLow: '#191c1d',
    surfaceContainer: '#212425',
    surfaceContainerHigh: '#2b2e2f',
    surfaceContainerHighest: '#36393a',
    onSurface: '#e1e3e4',
    onSurfaceVariant: '#c3c5d7',
    outline: '#8d9099',
    outlineVariant: '#434654',
    error: '#ffb4ab',
    inverseSurface: '#e1e3e4',
    surfaceTint: '#b5c4ff',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
