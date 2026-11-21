import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns safe-area insets that accurately account for Android status bar,
 * camera hole notches, and navigation bars on devices like Realme Note 50,
 * as well as iOS Dynamic Island/notches and web environments.
 */
export function useResponsiveInsets() {
  const insets = useSafeAreaInsets();

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 14 : 0
  );

  return {
    ...insets,
    top: topInset,
    bottom: bottomInset,
  };
}
