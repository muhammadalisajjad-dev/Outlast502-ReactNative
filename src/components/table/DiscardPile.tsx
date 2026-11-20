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
        {topCard ? (
          <PlayingCard card={topCard} size="large" />
        ) : (
          <View style={styles.emptyPlaceholder}>
            <Text style={styles.emptyText}>Empty</Text>
          </View>
        )}

        {/* Counter Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </View>

      <Text style={styles.pileLabel}>Discard</Text>

      {/* Declared Suit Badge if Jack played */}
      {declaredSuit && (
        <View style={styles.declaredBadge}>
          <Text
            style={[
              styles.declaredText,
              { color: SUIT_COLORS[declaredSuit] === 'red' ? Colors.crimsonLight : Colors.goldLight },
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
  emptyPlaceholder: {
    width: 78,
    height: 112,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  emptyText: {
    color: Colors.textMuted,
    ...Typography.bodySmall,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.gold,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: Colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
  },
  pileLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  declaredBadge: {
    marginTop: 4,
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.gold,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  declaredText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
