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
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  playable = false,
  selected = false,
  onPress,
  size = 'normal',
  style,
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
        return { width: 32, height: 46, borderRadius: 4 };
      case 'large':
        return { width: 84, height: 122, borderRadius: 7 };
      case 'normal':
      default:
        return { width: 64, height: 94, borderRadius: 6 };
    }
  };

  const dims = getDimensions();
  const liftAnim = useRef(new Animated.Value(playable ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(liftAnim, {
      toValue: selected ? 2 : playable ? 1 : 0,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [playable, selected, liftAnim]);

  const translateY = liftAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -8, -14],
  });

  const scale = liftAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1.02, 1.05],
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
            <View style={styles.cardBackDiamond}>
              <Text style={styles.cardBackText}>502</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const isMini = size === 'mini';
  const isLarge = size === 'large';

  // Special card tag in Midnight Lounge styling
  let specialBadge: { label: string; bg: string; textCol: string } | null = null;
  if (card.rank === '7' && card.suit === 'hearts') {
    specialBadge = { label: 'WIN', bg: Colors.crimson, textCol: '#ffffff' };
  } else if (card.rank === 'J') {
    specialBadge = { label: 'WILD', bg: Colors.cobalt, textCol: '#ffffff' };
  } else if (card.rank === 'A' && card.suit === 'spades') {
    specialBadge = { label: '+5', bg: Colors.crimson, textCol: '#ffffff' };
  } else if (card.rank === '2') {
    specialBadge = { label: '+2', bg: Colors.amber, textCol: '#ffffff' };
  } else if (card.rank === '8') {
    specialBadge = { label: 'SKIP', bg: Colors.surfaceElevated, textCol: Colors.textAccent };
  }

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale }],
        zIndex: selected ? 10 : playable ? 5 : 1,
      }}
    >
      <TouchableOpacity
        activeOpacity={playable ? 0.78 : 1}
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
        {/* Inner hairline border for authentic card look */}
        <View style={[styles.innerCardBorder, { borderRadius: dims.borderRadius - 2 }]}>
          {/* Top-Left Corner Index */}
          <View style={styles.cornerIndexTop}>
            <Text
              style={[
                Typography.cardRank,
                {
                  color: suitColor,
                  fontSize: isMini ? 10 : isLarge ? 17 : 14,
                  lineHeight: isMini ? 11 : isLarge ? 18 : 15,
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
                  fontSize: isMini ? 9 : isLarge ? 13 : 11,
                  lineHeight: isMini ? 10 : isLarge ? 14 : 12,
                },
              ]}
            >
              {suitSymbol}
            </Text>
          </View>

          {/* Center Watermark Emblem */}
          <View style={styles.centerEmblem}>
            <Text
              style={{
                color: suitColor,
                fontSize: isMini ? 14 : isLarge ? 38 : 28,
                opacity: isMini ? 0.85 : 0.8,
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
                    fontSize: isLarge ? 17 : 14,
                    lineHeight: isLarge ? 18 : 15,
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
                    fontSize: isLarge ? 13 : 11,
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
            <View style={[styles.specialBadge, { backgroundColor: specialBadge.bg }]}>
              <Text style={[styles.specialBadgeText, { color: specialBadge.textCol }]}>
                {specialBadge.label}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: Colors.cardIvory,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  innerCardBorder: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'space-between',
    padding: 2.5,
    position: 'relative',
  },
  cardFaceDown: {
    backgroundColor: Colors.cardBack,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderWidth: 1,
    padding: 2.5,
  },
  cardBackPattern: {
    flex: 1,
    backgroundColor: '#0c162b',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    padding: 2,
  },
  cardBackInnerFrame: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(203, 213, 225, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackDiamond: {
    width: '60%',
    height: '60%',
    borderWidth: 0.75,
    borderColor: Colors.cobaltLight,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  cardBackText: {
    color: Colors.silverLight,
    fontWeight: '800',
    fontSize: 8.5,
    letterSpacing: 0.5,
    transform: [{ rotate: '-45deg' }],
  },
  cardPlayable: {
    borderColor: Colors.playableBlue,
    borderWidth: 1.5,
    shadowColor: Colors.playableBlue,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  cardSelected: {
    borderColor: Colors.cobaltLight,
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
    top: 2.5,
    right: 2.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  specialBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
