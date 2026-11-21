import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Card, Suit, SUIT_NAMES, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { PlayingCard } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Flame } from 'lucide-react-native';

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
  const landingAnim = useRef(new Animated.Value(1)).current;
  const pulseDemandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!topCard) return;
    landingAnim.setValue(1.12);
    Animated.spring(landingAnim, {
      toValue: 1,
      speed: 28,
      bounciness: 6,
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
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseDemandAnim, {
            toValue: 0,
            duration: 1000,
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

  const demandGlowScale = pulseDemandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pileWrapper, { transform: [{ scale: landingAnim }] }]}>
        {/* Layered Cards under Discard for realistic table clutter */}
        {count > 2 && <View style={styles.shadowCardUnder2} />}
        {count > 1 && <View style={styles.shadowCardUnder1} />}

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
      </Animated.View>

      <Text style={styles.pileLabel}>DISCARD PILE</Text>

      {/* Declared Suit Badge if Jack played */}
      {declaredSuit && (
        <Animated.View
          style={[
            styles.declaredBadge,
            {
              transform: [{ scale: demandGlowScale }],
              borderColor:
                SUIT_COLORS[declaredSuit] === 'red' ? Colors.crimsonLight : Colors.cobaltLight,
            },
          ]}
        >
          <Flame
            size={11}
            color={SUIT_COLORS[declaredSuit] === 'red' ? Colors.crimsonLight : Colors.cobaltLight}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.declaredText,
              {
                color:
                  SUIT_COLORS[declaredSuit] === 'red' ? Colors.crimsonLight : Colors.playableBlue,
              },
            ]}
          >
            {SUIT_SYMBOLS[declaredSuit]} {SUIT_NAMES[declaredSuit].toUpperCase()}
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
  shadowCardUnder2: {
    position: 'absolute',
    top: 4,
    left: -3,
    width: 86,
    height: 124,
    borderRadius: 8,
    backgroundColor: '#070c16',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.1)',
    transform: [{ rotate: '-4deg' }],
  },
  shadowCardUnder1: {
    position: 'absolute',
    top: 2,
    right: -2,
    width: 86,
    height: 124,
    borderRadius: 8,
    backgroundColor: '#0c1527',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
    transform: [{ rotate: '3deg' }],
  },
  cardRotateWrapper: {
    transform: [{ rotate: '-1.5deg' }],
  },
  emptyPlaceholder: {
    width: 86,
    height: 124,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 20, 0.6)',
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
    backgroundColor: '#090f1a',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
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
    fontSize: 9,
    letterSpacing: 1,
  },
  declaredBadge: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 16, 30, 0.95)',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  declaredText: {
    ...Typography.badge,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
