import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
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
        return { width: 78, height: 112, borderRadius: 8 };
      case 'normal':
      default:
        return { width: 62, height: 90, borderRadius: 7 };
    }
  };

  const dims = getDimensions();

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
          <View style={styles.cardBackDiamond}>
            <Text style={styles.cardBackText}>502</Text>
          </View>
        </View>
      </View>
    );
  }

  const isMini = size === 'mini';

  return (
    <TouchableOpacity
      activeOpacity={playable ? 0.75 : 1}
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
      {/* Top-Left Corner Index */}
      <View style={styles.cornerIndexTop}>
        <Text style={[Typography.cardRank, { color: suitColor, fontSize: isMini ? 11 : 14 }]}>
          {card.rank}
        </Text>
        <Text style={[Typography.cardSuit, { color: suitColor, fontSize: isMini ? 9 : 12 }]}>
          {suitSymbol}
        </Text>
      </View>

      {/* Center Large Emblem */}
      <View style={styles.centerEmblem}>
        <Text style={{ color: suitColor, fontSize: isMini ? 14 : size === 'large' ? 36 : 28 }}>
          {suitSymbol}
        </Text>
      </View>

      {/* Bottom-Right Corner Index (Inverted) */}
      {!isMini && (
        <View style={styles.cornerIndexBottom}>
          <Text style={[Typography.cardRank, { color: suitColor, fontSize: 14 }]}>
            {card.rank}
          </Text>
          <Text style={[Typography.cardSuit, { color: suitColor, fontSize: 12 }]}>
            {suitSymbol}
          </Text>
        </View>
      )}

      {/* Special Card Badges */}
      {card.rank === '7' && card.suit === 'hearts' && (
        <View style={styles.wildBadge}>
          <Text style={styles.wildBadgeText}>WIN</Text>
        </View>
      )}
      {card.rank === 'J' && (
        <View style={[styles.wildBadge, { backgroundColor: Colors.gold }]}>
          <Text style={[styles.wildBadgeText, { color: '#1a1406' }]}>WILD</Text>
        </View>
      )}
      {card.rank === 'A' && card.suit === 'spades' && (
        <View style={[styles.wildBadge, { backgroundColor: Colors.crimson }]}>
          <Text style={styles.wildBadgeText}>+5</Text>
        </View>
      )}
      {card.rank === '2' && (
        <View style={[styles.wildBadge, { backgroundColor: Colors.amber }]}>
          <Text style={styles.wildBadgeText}>+2</Text>
        </View>
      )}
      {card.rank === '8' && (
        <View style={[styles.wildBadge, { backgroundColor: Colors.surfaceElevated }]}>
          <Text style={styles.wildBadgeText}>SKIP</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: Colors.cardIvory,
    borderColor: Colors.cardBorder,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    padding: 3,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardFaceDown: {
    backgroundColor: Colors.cardBack,
    borderColor: Colors.gold,
    borderWidth: 1.5,
    padding: 3,
  },
  cardBackPattern: {
    flex: 1,
    backgroundColor: '#0d2238',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackDiamond: {
    width: '65%',
    height: '65%',
    borderWidth: 1,
    borderColor: Colors.gold,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  cardBackText: {
    color: Colors.goldLight,
    fontWeight: '900',
    fontSize: 9,
    transform: [{ rotate: '-45deg' }],
  },
  cardPlayable: {
    borderColor: Colors.playableLime,
    borderWidth: 2,
    shadowColor: Colors.playableLime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ translateY: -6 }],
  },
  cardSelected: {
    borderColor: Colors.gold,
    borderWidth: 2.5,
    transform: [{ translateY: -10 }],
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
    opacity: 0.85,
  },
  wildBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.playableLime,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  wildBadgeText: {
    color: Colors.textPrimary,
    fontSize: 7,
    fontWeight: '900',
  },
});
