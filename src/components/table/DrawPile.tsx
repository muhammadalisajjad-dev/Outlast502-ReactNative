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
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
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
      Animated.timing(drawAnim, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.spring(drawAnim, {
        toValue: 1,
        speed: 28,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onDraw();
  };

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.022],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: drawAnim }] }]}>
      <TouchableOpacity
        testID="draw-pile-btn"
        activeOpacity={canDraw ? 0.85 : 1}
        onPress={handlePress}
        disabled={!canDraw}
        style={styles.wrapper}
      >
        <Animated.View
          style={[
            styles.activeRing,
            {
              borderRadius: LARGE.borderRadius + 6,
              opacity: canDraw ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] }) : 0,
              transform: [{ scale }],
            },
          ]}
          pointerEvents="none"
        />

        {count > 3 && <View style={[styles.layer, styles.layer3]} />}
        {count > 2 && <View style={[styles.layer, styles.layer2]} />}
        {count > 1 && <View style={[styles.layer, styles.layer1]} />}

        <PlayingCard faceDown size="large" />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.label, canDraw && styles.labelActive]}>
        {canDraw ? 'Tap to draw' : 'Deck'}
      </Text>
      <Text style={styles.subLabel}>
        {canDraw ? '+1 card' : `${count} remain`}
      </Text>
    </Animated.View>
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
  layer: {
    position: 'absolute',
    width: LARGE.width,
    height: LARGE.height,
    borderRadius: LARGE.borderRadius,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
  },
  layer1: { top: 2, left: 2 },
  layer2: { top: 4, left: 4, opacity: 0.8 },
  layer3: { top: 6, left: 6, opacity: 0.55 },
  activeRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderWidth: 1.2,
    borderColor: Colors.accent,
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
  labelActive: {
    color: Colors.accentSoft,
  },
  subLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.5,
    letterSpacing: 1,
    marginTop: 2,
    opacity: 0.8,
  },
});
