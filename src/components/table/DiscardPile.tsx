import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Card, Suit, SUIT_NAMES, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { PlayingCard, CARD_SIZES } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface DiscardPileProps {
  topCard: Card | null;
  declaredSuit: Suit | null;
  count: number;
}

const LARGE = CARD_SIZES.large;

export const DiscardPile: React.FC<DiscardPileProps> = ({
  topCard,
  declaredSuit,
  count,
}) => {
  const landingAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!topCard) return;
    landingAnim.setValue(1.06);
    Animated.spring(landingAnim, {
      toValue: 1,
      speed: 28,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }, [topCard?.id, landingAnim]);

  const demandColor =
    declaredSuit && SUIT_COLORS[declaredSuit] === 'red'
      ? Colors.cardRedSuit
      : Colors.tealLight;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wrapper, { transform: [{ scale: landingAnim }] }]}>
        {count > 2 && <View style={[styles.shadowCard, styles.shadowCard2]} />}
        {count > 1 && <View style={[styles.shadowCard, styles.shadowCard1]} />}

        {topCard ? (
          <View style={styles.cardTilt}>
            <PlayingCard card={topCard} size="large" />
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyGlyph} />
            <Text style={styles.emptyText}>Awaiting</Text>
            <Text style={styles.emptyText}>opening card</Text>
          </View>
        )}

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </Animated.View>

      <Text style={styles.label}>Discard</Text>
      <Text style={styles.subLabel}>
        {count === 1 ? '1 played' : `${count} played`}
      </Text>

      {declaredSuit && (
        <View style={[styles.demand, { borderColor: demandColor }]}>
          <Text style={[styles.demandSuit, { color: demandColor }]}>
            {SUIT_SYMBOLS[declaredSuit]}
          </Text>
          <Text style={[styles.demandText, { color: demandColor }]}>
            {SUIT_NAMES[declaredSuit]}
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
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowCard: {
    position: 'absolute',
    width: LARGE.width,
    height: LARGE.height,
    borderRadius: LARGE.borderRadius,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
  },
  shadowCard1: {
    top: 3,
    right: -3,
    transform: [{ rotate: '3deg' }],
  },
  shadowCard2: {
    top: 5,
    left: -4,
    transform: [{ rotate: '-3.5deg' }],
    opacity: 0.7,
  },
  cardTilt: {
    transform: [{ rotate: '-1.5deg' }],
  },
  empty: {
    width: LARGE.width,
    height: LARGE.height,
    borderRadius: LARGE.borderRadius,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 16, 14, 0.5)',
  },
  emptyGlyph: {
    width: 10,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7,
    letterSpacing: 1.2,
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    backgroundColor: Colors.inkRaised,
    borderColor: Colors.lineStrong,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: Typography.cardRank.fontFamily,
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    ...Typography.micro,
    color: Colors.textMuted,
    marginTop: 12,
    fontSize: 7.5,
    letterSpacing: 1.4,
  },
  subLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.5,
    letterSpacing: 1,
    marginTop: 2,
    opacity: 0.8,
  },
  demand: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.paperFaint,
  },
  demandSuit: {
    fontSize: 11,
    lineHeight: 13,
    marginRight: 5,
  },
  demandText: {
    ...Typography.micro,
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
