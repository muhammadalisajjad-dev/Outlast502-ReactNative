import { TextStyle, Platform } from 'react-native';

const FONT_SANS = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

const FONT_SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, serif',
});

export const Typography: Record<string, TextStyle> = {
  displayTitle: {
    fontFamily: FONT_SANS,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#f8fafc',
  },
  displaySubtitle: {
    fontFamily: FONT_SANS,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  titleLarge: {
    fontFamily: FONT_SANS,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  titleMedium: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleSmall: {
    fontFamily: FONT_SANS,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bodyLarge: {
    fontFamily: FONT_SANS,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  bodySmall: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 15,
  },
  labelUpper: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  badge: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardRank: {
    fontFamily: FONT_SERIF,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 19,
  },
  cardSuit: {
    fontSize: 13,
    lineHeight: 15,
  },
};
