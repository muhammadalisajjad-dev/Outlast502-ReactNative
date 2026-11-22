import { TextStyle, Platform } from 'react-native';

/**
 * Editorial type system: a confident sans for product voice, with warm serif
 * italics and numerals reserved for scores and short pull lines. No display
 * fonts are bundled; platform fonts keep the game lightweight and native.
 */
export const Fonts = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  }),
  sansMedium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  }),
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, "Times New Roman", "Palatino Linotype", serif',
  }),
};

const SANS = Fonts.sans;
const SERIF = Fonts.serif;

export const Typography: Record<string, TextStyle> = {
  // Product voice (sans)
  hero: {
    fontFamily: SANS,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.6,
    lineHeight: 52,
    color: '#F2EEE4',
  },
  heroCompact: {
    fontFamily: SANS,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 44,
    color: '#F2EEE4',
  },
  displayTitle: {
    fontFamily: SANS,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 40,
    color: '#F2EEE4',
  },
  titleLarge: {
    fontFamily: SANS,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 32,
    color: '#F2EEE4',
  },
  titleMedium: {
    fontFamily: SANS,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 26,
    color: '#F2EEE4',
  },
  titleSmall: {
    fontFamily: SANS,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 21,
    color: '#F2EEE4',
  },
  bodyLarge: {
    fontFamily: SANS,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: '#B9B7AB',
  },
  bodyMedium: {
    fontFamily: SANS,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: '#B9B7AB',
  },
  bodySmall: {
    fontFamily: SANS,
    fontSize: 11.5,
    fontWeight: '400',
    lineHeight: 16,
    color: '#B9B7AB',
  },
  labelUpper: {
    fontFamily: SANS,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#B9B7AB',
  },
  labelWide: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#B9B7AB',
  },
  micro: {
    fontFamily: SANS,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#7D867E',
  },
  badge: {
    fontFamily: SANS,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Serif accents: scores and editorial asides
  serifDisplay: {
    fontFamily: SERIF,
    fontSize: 34,
    fontWeight: '400',
    letterSpacing: -0.5,
    lineHeight: 40,
    color: '#F2EEE4',
  },
  serifHeading: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: -0.2,
    lineHeight: 30,
    color: '#F2EEE4',
  },
  serifSubheading: {
    fontFamily: SERIF,
    fontSize: 19,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 24,
    color: '#F2EEE4',
  },
  serifBody: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
    color: '#B9B7AB',
  },
  serifItalic: {
    fontFamily: SERIF,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    color: '#B9B7AB',
  },
  numeral: {
    fontFamily: SERIF,
    fontSize: 26,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 30,
    color: '#F2EEE4',
  },

  // Cards
  cardRank: {
    fontFamily: SANS,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 19,
  },
  cardSuit: {
    fontFamily: SANS,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 15,
  },
};
