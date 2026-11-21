import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { Card, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  playable?: boolean;
  selected?: boolean;
  onPress?: () => void;
  size?: 'normal' | 'mini' | 'large';
  style?: ViewStyle;
  testID?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  playable = false,
  selected = false,
  onPress,
  size = 'normal',
  style,
  testID,
}) => {
  const isRed = card ? SUIT_COLORS[card.suit] === 'red' : false;
  const suitSymbol = card ? SUIT_SYMBOLS[card.suit] : '';
  const suitColor = isRed ? Colors.cardRedSuit : Colors.cardBlackSuit;

  const handlePress = () => {
    if (!playable && !onPress) return;
    if (onPress) {
      triggerHaptic(playable ? 'medium' : 'light');
      onPress();
    }
  };

  const getDimensions = () => {
    switch (size) {
      case 'mini':
        return { width: 34, height: 48, borderRadius: 4 };
      case 'large':
        return { width: 86, height: 124, borderRadius: 8 };
      case 'normal':
      default:
        return { width: 66, height: 96, borderRadius: 6 };
    }
  };

  const dims = getDimensions();
  const liftAnim = useRef(new Animated.Value(playable ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Lift animation when playable / selected
  useEffect(() => {
    Animated.spring(liftAnim, {
      toValue: selected ? 2 : playable ? 1 : 0,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [playable, selected, liftAnim]);

  // Subtle breathing pulse for playable cards
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (playable) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(0);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [playable, pulseAnim]);

  const translateY = liftAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -9, -16],
  });

  const scale = liftAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1.03, 1.07],
  });

  const playableGlowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  if (faceDown || !card) {
    return (
      <View
        style={[
          styles.cardBase,
          styles.cardFaceDown,
          dims,
          style,
        ]}
      >
        <View style={styles.cardBackPattern}>
          <View style={styles.cardBackInnerFrame}>
            <View style={styles.cardBackCornerTopLeft}>
              <Text style={styles.cardBackMiniSuit}>♠</Text>
            </View>
            <View style={styles.cardBackCornerBottomRight}>
              <Text style={styles.cardBackMiniSuit}>♦</Text>
            </View>
            <View style={styles.cardBackDiamond}>
              <View style={styles.cardBackDiamondInner}>
                <Text style={styles.cardBackText}>502</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const isMini = size === 'mini';
  const isLarge = size === 'large';

  // High-impact Special Badges
  let specialBadge: { label: string; bg: string; textCol: string; borderCol: string } | null = null;
  if (card.rank === '7' && card.suit === 'hearts') {
    specialBadge = { label: 'WIN 7♥', bg: '#991b1b', textCol: '#fef08a', borderCol: '#f59e0b' };
  } else if (card.rank === 'J') {
    specialBadge = { label: 'WILD', bg: '#1d4ed8', textCol: '#ffffff', borderCol: '#60a5fa' };
  } else if (card.rank === 'A' && card.suit === 'spades') {
    specialBadge = { label: '+5 ATK', bg: '#b91c1c', textCol: '#ffffff', borderCol: '#f87171' };
  } else if (card.rank === '2') {
    specialBadge = { label: '+2 ATK', bg: '#b45309', textCol: '#ffffff', borderCol: '#fbbf24' };
  } else if (card.rank === '8') {
    specialBadge = { label: 'SKIP', bg: '#1e293b', textCol: '#38bdf8', borderCol: '#0ea5e9' };
  }

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale }],
        zIndex: selected ? 10 : playable ? 5 : 1,
      }}
    >
      <TouchableOpacity
        testID={testID}
        activeOpacity={playable ? 0.8 : 1}
        onPress={handlePress}
        disabled={!onPress}
        style={[
          styles.cardBase,
          dims,
          playable && styles.cardPlayable,
          selected && styles.cardSelected,
          style,
        ]}
      >
        {/* Subtle breathing glow ring for playable cards */}
        {playable && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.playableGlowRing,
              { opacity: playableGlowOpacity, borderRadius: dims.borderRadius },
            ]}
          />
        )}

        {/* Inner hairline border with authentic linen styling */}
        <View style={[styles.innerCardBorder, { borderRadius: dims.borderRadius - 2 }]}>
          {/* Top-Left Corner Index */}
          <View style={styles.cornerIndexTop}>
            <Text
              style={[
                Typography.cardRank,
                {
                  color: suitColor,
                  fontSize: isMini ? 10.5 : isLarge ? 18 : 14.5,
                  lineHeight: isMini ? 11 : isLarge ? 19 : 15.5,
                },
              ]}
            >
              {card.rank}
            </Text>
            <Text
              style={[
                Typography.cardSuit,
                {
                  color: suitColor,
                  fontSize: isMini ? 9.5 : isLarge ? 13.5 : 11.5,
                  lineHeight: isMini ? 10 : isLarge ? 14 : 12,
                },
              ]}
            >
              {suitSymbol}
            </Text>
          </View>

          {/* Center Watermark Pip */}
          <View style={styles.centerEmblem}>
            <Text
              style={{
                color: suitColor,
                fontSize: isMini ? 15 : isLarge ? 40 : 29,
                opacity: isMini ? 0.88 : 0.82,
              }}
            >
              {suitSymbol}
            </Text>
          </View>

          {/* Bottom-Right Corner Index (Inverted) */}
          {!isMini && (
            <View style={styles.cornerIndexBottom}>
              <Text
                style={[
                  Typography.cardRank,
                  {
                    color: suitColor,
                    fontSize: isLarge ? 18 : 14.5,
                    lineHeight: isLarge ? 19 : 15.5,
                  },
                ]}
              >
                {card.rank}
              </Text>
              <Text
                style={[
                  Typography.cardSuit,
                  {
                    color: suitColor,
                    fontSize: isLarge ? 13.5 : 11.5,
                    lineHeight: isLarge ? 14 : 12,
                  },
                ]}
              >
                {suitSymbol}
              </Text>
            </View>
          )}

          {/* Special Card Badge */}
          {specialBadge && !isMini && (
            <View
              style={[
                styles.specialBadge,
                {
                  backgroundColor: specialBadge.bg,
                  borderColor: specialBadge.borderCol,
                },
              ]}
            >
              <Text style={[styles.specialBadgeText, { color: specialBadge.textCol }]}>
                {specialBadge.label}
              </Text>
            </View>
          )}

          {/* Subtle diagonal sheen highlight */}
          <View style={styles.cardSheen} pointerEvents="none" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: Colors.cardIvory,
    borderColor: '#e2dcd0',
    borderWidth: 1,
    padding: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  playableGlowRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: Colors.playableBlue,
  },
  innerCardBorder: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: 'rgba(0, 0, 0, 0.09)',
    backgroundColor: '#fefdfa',
    justifyContent: 'space-between',
    padding: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardFaceDown: {
    backgroundColor: '#070d18',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderWidth: 1.5,
    padding: 3,
  },
  cardBackPattern: {
    flex: 1,
    backgroundColor: '#0a1222',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    padding: 2.5,
  },
  cardBackInnerFrame: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardBackCornerTopLeft: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  cardBackCornerBottomRight: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  cardBackMiniSuit: {
    fontSize: 7,
    color: 'rgba(251, 191, 36, 0.45)',
  },
  cardBackDiamond: {
    width: '64%',
    height: '64%',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  cardBackDiamondInner: {
    width: '80%',
    height: '80%',
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackText: {
    color: '#fbbf24',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.8,
    transform: [{ rotate: '-45deg' }],
  },
  cardPlayable: {
    borderColor: Colors.playableBlue,
    borderWidth: 1.5,
    shadowColor: Colors.playableBlue,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 7,
  },
  cardSelected: {
    borderColor: Colors.goldLight,
    borderWidth: 2,
  },
  cornerIndexTop: {
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  cornerIndexBottom: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    transform: [{ rotate: '180deg' }],
  },
  centerEmblem: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  specialBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  cardSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ skewY: '-15deg' }],
  },
});
