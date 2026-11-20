import { Platform } from 'react-native';

/**
 * Haptic and tactile feedback abstraction.
 * Gracefully no-ops on platforms or devices without haptics.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'heavy' || type === 'warning') {
        navigator.vibrate([30, 50, 30]);
      } else {
        navigator.vibrate(20);
      }
    }
  }
}
