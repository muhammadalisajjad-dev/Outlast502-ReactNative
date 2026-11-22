import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Line, G, Circle } from 'react-native-svg';
import { Card, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

export const CARD_SIZES = {
  mini: { width: 34, height: 48, borderRadius: 4 },
  normal: { width: 70, height: 100, borderRadius: 6 },
  large: { width: 96, height: 138, borderRadius: 8 },
} as const;

export type CardSize = keyof typeof CARD_SIZES;

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  playable?: boolean;
  selected?: boolean;
  onPress?: () => void;
  size?: CardSize;
  style?: ViewStyle;
  testID?: string;
}

type SpecialKind = 'win' | 'wild' | 'penalty' | 'skip';

const SPECIAL_STYLE: Record<
  SpecialKind,
  { stripe: string; label: string; chip: string; chipText: string }
> = {
  win: { stripe: Colors.accent, label: 'WIN', chip: Colors.accent, chipText: Colors.accentInk },
  wild: { stripe: Colors.tealLight, label: 'WILD', chip: Colors.teal, chipText: '#F4EFE3' },
  penalty: { stripe: Colors.danger, label: '', chip: Colors.danger, chipText: '#FFF3EF' },
  skip: { stripe: Colors.tealLight, label: 'SKIP', chip: Colors.teal, chipText: '#F4EFE3' },
};

const CardBackArt: React.FC<{ size: CardSize }> = ({ size }) => {
  const mini = size === 'mini';
  const lines = Array.from({ length: 10 }).map((_, i) => i * 14);
  const cx = 35;
  const cy = 52;

  return (
    <>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 70 100"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="card-back-gradient" x1="0" y1="0" x2="0.7" y2="1">
            <Stop offset="0" stopColor={Colors.cardBack} />
            <Stop offset="1" stopColor={Colors.cardBackDeep} />
          </LinearGradient>
          <RadialGradient id="card-back-glow" cx="50%" cy="28%" r="85%">
            <Stop offset="0" stopColor={Colors.cardBack} stopOpacity="0.95" />
            <Stop offset="0.55" stopColor={Colors.cardBack} stopOpacity="0.55" />
            <Stop offset="1" stopColor={Colors.cardBackDeep} stopOpacity="1" />
          </RadialGradient>
        </Defs>

        <Rect width="70" height="100" fill="url(#card-back-gradient)" />
        <Rect width="70" height="100" fill="url(#card-back-glow)" />

        {/* Concentric play arcs — the house motif of the table. */}
        <G fill="none" stroke={Colors.paper} strokeOpacity="0.10" strokeWidth="0.35">
          <Circle cx={cx} cy={cy} r="45" />
          <Circle cx={cx} cy={cy} r="34" />
          <Circle cx={cx} cy={cy} r="23" />
          <Circle cx={cx} cy={cy} r="12" />
        </G>

        <G stroke={Colors.paper} strokeOpacity={0.055} strokeWidth={0.6}>
          {lines.map(v => (
            <Line key={`a-${v}`} x1={v} y1={0} x2={0} y2={v} />
          ))}
          {lines.map(v => (
            <Line key={`b-${v}`} x1={70 - v} y1={0} x2={70} y2={v} />
          ))}
        </G>

        <Rect
          x={mini ? 3 : 4}
          y={mini ? 3 : 4}
          width={mini ? 64 : 62}
          height={mini ? 94 : 92}
          rx={2}
          fill="none"
          stroke={Colors.paper}
          strokeOpacity={0.22}
          strokeWidth={0.7}
        />
      </Svg>

      <View style={styles.backMarkWrap} pointerEvents="none">
        <Text style={[styles.backMark, mini && { fontSize: 7 }]}>502</Text>
        <View style={[styles.backMarkRule, mini && { width: 14 }]} />
      </View>
    </>
  );
};

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
  const dims = CARD_SIZES[size];
  const mini = size === 'mini';
  const large = size === 'large';
  const face = !faceDown && Boolean(card);

  const handlePress = () => {
    if (!onPress) return;
    triggerHaptic(playable ? 'medium' : 'light');
    onPress();
  };

  const lift = useRef(new Animated.Value(playable ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(lift, {
      toValue: selected ? 2 : playable ? 1 : 0,
      speed: 30,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }, [playable, selected, lift]);

  const translateY = lift.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -8, -15],
  });
  const scale = lift.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1.02, 1.05],
  });

  if (!face) {
    return (
      <View
        style={[
          styles.shadowWrap,
          { width: dims.width, height: dims.height },
          style,
        ]}
      >
        <View
          style={[
            styles.base,
            { width: dims.width, height: dims.height, borderRadius: dims.borderRadius },
          ]}
        >
          <View
            style={[
              styles.backPaper,
              { borderRadius: Math.max(dims.borderRadius - 2, 2) },
            ]}
          >
            <CardBackArt size={size} />
          </View>
        </View>
      </View>
    );
  }

  if (!card) return null;

  let special: SpecialKind | null = null;
  let specialLabel = '';
  if (card.rank === '7' && card.suit === 'hearts') {
    special = 'win';
    specialLabel = 'WIN';
  } else if (card.rank === 'J') {
    special = 'wild';
    specialLabel = 'WILD';
  } else if (card.rank === 'A' && card.suit === 'spades') {
    special = 'penalty';
    specialLabel = '+5';
  } else if (card.rank === '2') {
    special = 'penalty';
    specialLabel = '+2';
  } else if (card.rank === '8') {
    special = 'skip';
    specialLabel = 'SKIP';
  }

  const specialStyle = special ? SPECIAL_STYLE[special] : null;
  const rankSize = mini ? 11 : large ? 20 : 16;
  const suitSize = mini ? 9.5 : large ? 15 : 12;
  const pipSize = mini ? 15 : large ? 46 : 32;
  const faceLetterSize = mini ? 18 : large ? 42 : 30;

  return (
    <Animated.View
      style={[
        styles.shadowWrap,
        {
          width: dims.width,
          height: dims.height,
          transform: [{ translateY }, { scale }],
          zIndex: selected ? 12 : playable ? 6 : 1,
        },
        style,
      ]}
    >
      <TouchableOpacity
        testID={testID}
        activeOpacity={playable ? 0.85 : 1}
        onPress={handlePress}
        disabled={!onPress}
        style={[
          styles.base,
          {
            width: dims.width,
            height: dims.height,
            borderRadius: dims.borderRadius,
            borderColor: playable || selected ? Colors.accent : Colors.cardEdge,
            borderWidth: playable || selected ? 1.5 : 1,
          },
        ]}
      >
        <View style={[styles.paper, { borderRadius: dims.borderRadius - 2 }]}>
          <View style={styles.sheen} pointerEvents="none" />
          <View style={styles.shade} pointerEvents="none" />

          {/* Corner indices */}
          <View style={styles.cornerTop}>
            <Text
              style={[
                Typography.cardRank,
                { color: suitColor, fontSize: rankSize, lineHeight: rankSize + 1 },
              ]}
            >
              {card.rank}
            </Text>
            <Text
              style={[
                Typography.cardSuit,
                { color: suitColor, fontSize: suitSize, lineHeight: suitSize + 1 },
              ]}
            >
              {suitSymbol}
            </Text>
          </View>

          {!mini && (
            <View style={styles.cornerBottom}>
              <Text
                style={[
                  Typography.cardRank,
                  { color: suitColor, fontSize: rankSize, lineHeight: rankSize + 1 },
                ]}
              >
                {card.rank}
              </Text>
              <Text
                style={[
                  Typography.cardSuit,
                  { color: suitColor, fontSize: suitSize, lineHeight: suitSize + 1 },
                ]}
              >
                {suitSymbol}
              </Text>
            </View>
          )}

          {/* Centre artwork */}
          <View style={styles.center} pointerEvents="none">
            {card.rank === 'J' || card.rank === 'Q' || card.rank === 'K' ? (
              <>
                <Text
                  style={[
                    styles.faceLetter,
                    {
                      color: suitColor,
                      fontSize: faceLetterSize,
                      lineHeight: faceLetterSize + 2,
                    },
                  ]}
                >
                  {card.rank}
                </Text>
                <Text
                  style={{
                    color: suitColor,
                    fontSize: mini ? 8 : large ? 13 : 10,
                    lineHeight: mini ? 9 : large ? 15 : 12,
                    marginTop: 1,
                    opacity: 0.85,
                  }}
                >
                  {suitSymbol}
                  {suitSymbol}
                </Text>
              </>
            ) : (
              <Text
                style={{
                  color: suitColor,
                  fontSize: pipSize,
                  lineHeight: pipSize + 2,
                  opacity: card.rank === 'A' ? 0.95 : 0.88,
                  textShadowColor: 'rgba(0,0,0,0.06)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                {suitSymbol}
              </Text>
            )}
          </View>

          {/* Power marker: one quiet stripe instead of a badge */}
          {specialStyle && (
            <View
              style={[
                styles.powerStripe,
                {
                  backgroundColor: specialStyle.stripe,
                  right: mini ? 2 : 4,
                  top: mini ? 6 : 10,
                  bottom: mini ? 6 : 10,
                },
              ]}
              pointerEvents="none"
            />
          )}

          {specialStyle && specialLabel ? (
            <View
              style={[
                styles.powerChip,
                { backgroundColor: specialStyle.chip },
                mini && { top: 2, right: 2, paddingHorizontal: 3 },
              ]}
              pointerEvents="none"
            >
              <Text
                style={[
                  styles.powerChipText,
                  { color: specialStyle.chipText },
                  mini && { fontSize: 5.5 },
                ]}
              >
                {specialLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 6,
    elevation: 5,
  },
  base: {
    backgroundColor: Colors.cardPaper,
    padding: 2,
    overflow: 'hidden',
  },
  paper: {
    flex: 1,
    backgroundColor: Colors.cardPaperInner,
    overflow: 'hidden',
    position: 'relative',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '26%',
    backgroundColor: 'rgba(120, 100, 70, 0.05)',
  },
  cornerTop: {
    position: 'absolute',
    top: 3,
    left: 4,
    alignItems: 'center',
    zIndex: 2,
  },
  cornerBottom: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
    zIndex: 2,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceLetter: {
    fontFamily: Typography.serifHeading.fontFamily,
    fontWeight: '400',
  },
  powerStripe: {
    position: 'absolute',
    width: 2.5,
    borderRadius: 2,
  },
  powerChip: {
    position: 'absolute',
    top: 3,
    right: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
    zIndex: 3,
  },
  powerChipText: {
    fontFamily: Typography.micro.fontFamily,
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backPaper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.cardBack,
  },
  backMarkWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backMark: {
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.paper,
  },
  backMarkRule: {
    width: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.paper,
    opacity: 0.5,
    marginTop: 3,
  },
});
