import { TextStyle, Platform } from 'react-native';

/**
 * Club typography: a serif display voice for names, numerals and headlines,
 * paired with a restrained sans for labels and supporting copy.
 */
export const Fonts = {
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, "Times New Roman", "Palatino Linotype", serif',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  }),
  sansMedium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  }),
};

const FONT_SANS = Fonts.sans;
const FONT_SERIF = Fonts.display;

export const Typography: Record<string, TextStyle> = {
  // Display serif
  displayTitle: {
    fontFamily: FONT_SERIF,
    fontSize: 40,
    fontWeight: '400',
    letterSpacing: 5,
    color: '#F2E8D5',
  },
  displaySubtitle: {
    fontFamily: FONT_SANS,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 3.4,
    textTransform: 'uppercase',
  },
  serifDisplay: {
    fontFamily: FONT_SERIF,
    fontSize: 34,
    fontWeight: '400',
    letterSpacing: 1,
    color: '#F2E8D5',
  },
  serifHeading: {
    fontFamily: FONT_SERIF,
    fontSize: 23,
    fontWeight: '400',
    letterSpacing: 0.6,
    color: '#F2E8D5',
  },
  serifSubheading: {
    fontFamily: FONT_SERIF,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: '#F2E8D5',
  },
  serifBody: {
    fontFamily: FONT_SERIF,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
    color: '#C9B99A',
  },
  serifItalic: {
    fontFamily: FONT_SERIF,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    color: '#C9B99A',
  },
  numeral: {
    fontFamily: FONT_SERIF,
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: '#E6CE96',
  },

  // UI sans
  titleLarge: {
    fontFamily: FONT_SERIF,
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0.8,
  },
  titleMedium: {
    fontFamily: FONT_SERIF,
    fontSize: 19,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  titleSmall: {
    fontFamily: FONT_SERIF,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  bodyLarge: {
    fontFamily: FONT_SANS,
    fontSize: 15,
    fontWeight: '400',
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
    lineHeight: 16,
  },
  labelUpper: {
    fontFamily: FONT_SANS,
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  labelWide: {
    fontFamily: FONT_SANS,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  micro: {
    fontFamily: FONT_SANS,
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  badge: {
    fontFamily: FONT_SANS,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardRank: {
    fontFamily: FONT_SERIF,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 19,
  },
  cardSuit: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    lineHeight: 15,
  },
};
