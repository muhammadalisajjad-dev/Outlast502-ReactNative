import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Suit, SUIT_NAMES, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { PlayingCard } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface DiscardPileProps {
  topCard: Card | null;
  declaredSuit: Suit | null;
  count: number;
}

export const DiscardPile: React.FC<DiscardPileProps> = ({
  topCard,
  declaredSuit,
  count,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.pileWrapper}>
        {/* Subtle shadow card underneath for realistic stack depth */}
        {count > 1 && <View style={styles.shadowCardUnder} />}

        {topCard ? (
          <View style={styles.cardRotateWrapper}>
            <PlayingCard card={topCard} size="large" />
          </View>
        ) : (
          <View style={styles.emptyPlaceholder}>
            <Text style={styles.emptyText}>EMPTY</Text>
          </View>
        )}

        {/* Counter Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </View>

      <Text style={styles.pileLabel}>DISCARD</Text>

      {/* Declared Suit Badge if Jack played */}
      {declaredSuit && (
        <View style={styles.declaredBadge}>
          <Text
            style={[
              styles.declaredText,
              { color: SUIT_COLORS[declaredSuit] === 'red' ? Colors.crimsonLight : Colors.cobaltLight },
            ]}
          >
            {SUIT_SYMBOLS[declaredSuit]} {SUIT_NAMES[declaredSuit].toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pileWrapper: {
    position: 'relative',
  },
  shadowCardUnder: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 84,
    height: 122,
    borderRadius: 7,
    backgroundColor: Colors.cardMidnight,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
    transform: [{ rotate: '4deg' }],
  },
  cardRotateWrapper: {
    transform: [{ rotate: '-2deg' }],
  },
  emptyPlaceholder: {
    width: 84,
    height: 122,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 20, 0.5)',
  },
  emptyText: {
    color: Colors.textMuted,
    ...Typography.labelUpper,
    fontSize: 9,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: Colors.silverLight,
    fontSize: 9.5,
    fontWeight: '800',
  },
  pileLabel: {
    ...Typography.labelUpper,
    color: Colors.textMuted,
    marginTop: 8,
    fontSize: 9.5,
  },
  declaredBadge: {
    marginTop: 4,
    backgroundColor: 'rgba(13, 21, 39, 0.95)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  declaredText: {
    ...Typography.badge,
    fontSize: 9,
  },
});
