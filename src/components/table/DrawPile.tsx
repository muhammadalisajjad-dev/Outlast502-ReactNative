import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { PlayingCard } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

interface DrawPileProps {
  count: number;
  canDraw: boolean;
  onDraw: () => void;
}

export const DrawPile: React.FC<DrawPileProps> = ({
  count,
  canDraw,
  onDraw,
}) => {
  const drawAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Breathing pulse when it's player's turn to draw
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (canDraw) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1100,
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
        toValue: 0.93,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(drawAnim, {
        toValue: 1,
        speed: 30,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
    onDraw();
  };

  const drawGlowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.95],
  });

  const drawGlowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: drawAnim }] }]}>
      <TouchableOpacity
        testID="draw-pile-btn"
        activeOpacity={canDraw ? 0.78 : 1}
        onPress={handlePress}
        disabled={!canDraw}
        style={styles.pileWrapper}
      >
        {/* Layered Deck 3D Stepped Rims */}
        {count > 3 && <View style={styles.deckLayer3} />}
        {count > 2 && <View style={styles.deckLayer2} />}
        {count > 1 && <View style={styles.deckLayer1} />}

        {/* Breathing aura when canDraw */}
        {canDraw && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.canDrawAura,
              {
                opacity: drawGlowOpacity,
                transform: [{ scale: drawGlowScale }],
              },
            ]}
          />
        )}

        <PlayingCard faceDown size="large" />

        {/* Deck Count Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.pileLabel, canDraw && styles.pileLabelActive]}>
        {canDraw ? 'TAP TO DRAW (+1)' : 'DRAW PILE'}
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckLayer3: {
    position: 'absolute',
    top: 4.5,
    left: 4.5,
    width: 86,
    height: 124,
    borderRadius: 8,
    backgroundColor: '#050a12',
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.1)',
  },
  deckLayer2: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 86,
    height: 124,
    borderRadius: 8,
    backgroundColor: '#08101e',
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.18)',
  },
  deckLayer1: {
    position: 'absolute',
    top: 1.5,
    left: 1.5,
    width: 86,
    height: 124,
    borderRadius: 8,
    backgroundColor: '#0c1628',
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.28)',
  },
  canDrawAura: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.playableBlue,
    shadowColor: Colors.playableBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
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
  pileLabelActive: {
    color: Colors.playableBlue,
    fontWeight: '800',
  },
});
