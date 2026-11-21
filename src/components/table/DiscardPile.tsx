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
  const pulseDemandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!topCard) return;
    landingAnim.setValue(1.1);
    Animated.spring(landingAnim, {
      toValue: 1,
      speed: 26,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  }, [topCard?.id, landingAnim]);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (declaredSuit) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseDemandAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseDemandAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulseDemandAnim.setValue(0);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [declaredSuit, pulseDemandAnim]);

  const demandGlow = pulseDemandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.9],
  });

  const demandSuitColor =
    declaredSuit && SUIT_COLORS[declaredSuit] === 'red'
      ? Colors.crimsonLight
      : Colors.brassLight;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pileWrapper, { transform: [{ scale: landingAnim }] }]}>
        {count > 2 && <View style={[styles.shadowCard, styles.shadowCard2]} />}
        {count > 1 && <View style={[styles.shadowCard, styles.shadowCard1]} />}

        {topCard ? (
          <View style={styles.cardRotateWrapper}>
            <PlayingCard card={topCard} size="large" />
          </View>
        ) : (
          <View style={styles.emptyPlaceholder}>
            <View style={styles.emptyDiamond} />
            <Text style={styles.emptyText}>AWAITING</Text>
            <Text style={styles.emptyText}>OPENING CARD</Text>
          </View>
        )}

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </Animated.View>

      <Text style={styles.pileLabel}>DISCARD</Text>
      <Text style={styles.pileSubLabel}>{count === 1 ? '1 CARD PLAYED' : `${count} CARDS PLAYED`}</Text>

      {declaredSuit && (
        <Animated.View
          style={[
            styles.declaredBadge,
            {
              opacity: demandGlow,
              borderColor: demandSuitColor,
            },
          ]}
        >
          <Text style={[styles.declaredSuit, { color: demandSuitColor }]}>
            {SUIT_SYMBOLS[declaredSuit]}
          </Text>
          <Text style={[styles.declaredText, { color: demandSuitColor }]}>
            {SUIT_NAMES[declaredSuit].toUpperCase()} DEMANDED
          </Text>
        </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowCard: {
    position: 'absolute',
    width: LARGE.width,
    height: LARGE.height,
    borderRadius: LARGE.borderRadius,
    backgroundColor: Colors.emeraldDeep,
    borderWidth: 0.7,
    borderColor: 'rgba(198, 164, 96, 0.28)',
  },
  shadowCard1: {
    top: 3,
    right: -3,
    transform: [{ rotate: '3.5deg' }],
  },
  shadowCard2: {
    top: 5,
    left: -4,
    transform: [{ rotate: '-4deg' }],
    opacity: 0.75,
  },
  cardRotateWrapper: {
    transform: [{ rotate: '-1.6deg' }],
  },
  emptyPlaceholder: {
    width: LARGE.width,
    height: LARGE.height,
    borderRadius: LARGE.borderRadius,
    borderWidth: 0.8,
    borderColor: 'rgba(198, 164, 96, 0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 11, 9, 0.5)',
  },
  emptyDiamond: {
    width: 12,
    height: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(198, 164, 96, 0.45)',
    transform: [{ rotate: '45deg' }],
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.5,
    letterSpacing: 1.2,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -7,
    right: -7,
    minWidth: 22,
    height: 18,
    paddingHorizontal: 5,
    backgroundColor: Colors.inkBlack,
    borderColor: Colors.brass,
    borderWidth: 0.8,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  badgeText: {
    fontFamily: Typography.titleSmall.fontFamily,
    color: Colors.brassLight,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  pileLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    marginTop: 11,
    fontSize: 7.5,
    letterSpacing: 1.8,
  },
  pileSubLabel: {
    ...Typography.micro,
    color: 'rgba(198, 164, 96, 0.45)',
    fontSize: 6.5,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  declaredBadge: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 11, 9, 0.9)',
    borderWidth: 0.8,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  declaredSuit: {
    fontSize: 11,
    lineHeight: 13,
    marginRight: 5,
  },
  declaredText: {
    ...Typography.micro,
    fontSize: 6.5,
    letterSpacing: 1.1,
  },
});
