import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { PlayingCard, CARD_SIZES } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

interface DrawPileProps {
  count: number;
  canDraw: boolean;
  onDraw: () => void;
}

const LARGE = CARD_SIZES.large;

export const DrawPile: React.FC<DrawPileProps> = ({
  count,
  canDraw,
  onDraw,
}) => {
  const drawAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (canDraw) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(0);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [canDraw, pulseAnim]);

  const handlePress = () => {
    if (!canDraw) return;
    triggerHaptic('medium');
    Animated.sequence([
      Animated.timing(drawAnim, {
        toValue: 0.94,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(drawAnim, {
        toValue: 1,
        speed: 28,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onDraw();
  };

  const auraOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.95],
  });

  const auraScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: drawAnim }] }]}>
      <TouchableOpacity
        testID="draw-pile-btn"
        activeOpacity={canDraw ? 0.8 : 1}
        onPress={handlePress}
        disabled={!canDraw}
        style={styles.pileWrapper}
      >
        {count > 3 && <View style={[styles.deckLayer, styles.deckLayer3]} />}
        {count > 2 && <View style={[styles.deckLayer, styles.deckLayer2]} />}
        {count > 1 && <View style={[styles.deckLayer, styles.deckLayer1]} />}

        {canDraw && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.canDrawAura,
              {
                opacity: auraOpacity,
                transform: [{ scale: auraScale }],
              },
            ]}
          />
        )}

        <PlayingCard faceDown size="large" />

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.pileLabel, canDraw && styles.pileLabelActive]}>
        {canDraw ? 'TAP TO DRAW' : 'THE DECK'}
      </Text>
      <Text style={styles.pileSubLabel}>
        {canDraw ? '+1 CARD' : `${count} REMAIN`}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pileWrapper: {
    position: 'relative',
    borderRadius: LARGE.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckLayer: {
    position: 'absolute',
    width: LARGE.width,
    height: LARGE.height,
    borderRadius: LARGE.borderRadius,
    backgroundColor: Colors.emeraldDeep,
    borderWidth: 0.7,
    borderColor: 'rgba(198, 164, 96, 0.35)',
  },
  deckLayer1: {
    top: 2,
    left: 2,
  },
  deckLayer2: {
    top: 4,
    left: 4,
    opacity: 0.8,
  },
  deckLayer3: {
    top: 6,
    left: 6,
    opacity: 0.6,
  },
  canDrawAura: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: LARGE.borderRadius + 4,
    borderWidth: 1.2,
    borderColor: Colors.brassLight,
    shadowColor: Colors.brass,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
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
  pileLabelActive: {
    color: Colors.brassLight,
  },
  pileSubLabel: {
    ...Typography.micro,
    color: 'rgba(198, 164, 96, 0.45)',
    fontSize: 6.5,
    letterSpacing: 1.2,
    marginTop: 2,
  },
});
