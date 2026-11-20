import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  titleMedium: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: '700',
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardRank: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  cardSuit: {
    fontSize: 14,
    lineHeight: 16,
  },
};
