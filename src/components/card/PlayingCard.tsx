import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Line, G, Path, Circle } from 'react-native-svg';
import { Card, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

export const CARD_SIZES = {
  mini: { width: 34, height: 48, borderRadius: 3 },
  normal: { width: 70, height: 100, borderRadius: 5 },
  large: { width: 96, height: 138, borderRadius: 7 },
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

const CardBackArt: React.FC<{ size: CardSize }> = ({ size }) => {
  const isMini = size === 'mini';
  const lattice = Array.from({ length: 12 }).map((_, index) => index * 9);

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
          <LinearGradient id="card-back-gradient" x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor={Colors.emeraldLight} stopOpacity={1} />
            <Stop offset="0.55" stopColor={Colors.emerald} stopOpacity={1} />
            <Stop offset="1" stopColor={Colors.inkBlack} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="70" height="100" fill="url(#card-back-gradient)" />
        <G stroke={Colors.brass} strokeOpacity={0.18} strokeWidth={0.55}>
          {lattice.map(value => (
            <Line key={`d1-${value}`} x1={value} y1={0} x2={0} y2={value} />
          ))}
          {lattice.map(value => (
            <Line key={`d2-${value}`} x1={70 - value} y1={0} x2={70} y2={value} />
          ))}
          {lattice.map(value => (
            <Line key={`d3-${value}`} x1={value} y1={100} x2={0} y2={100 - value} />
          ))}
          {lattice.map(value => (
            <Line key={`d4-${value}`} x1={70 - value} y1={100} x2={70} y2={100 - value} />
          ))}
        </G>

        <Rect
          x={3.5}
          y={3.5}
          width={63}
          height={93}
          rx={2}
          fill="none"
          stroke={Colors.brass}
          strokeOpacity={0.55}
          strokeWidth={0.8}
        />
        <Rect
          x={6.5}
          y={6.5}
          width={57}
          height={87}
          rx={1}
          fill="none"
          stroke={Colors.brass}
          strokeOpacity={0.2}
          strokeWidth={0.5}
        />

        <Path
          d="M35 22 L55 50 L35 78 L15 50 Z"
          fill={Colors.emeraldDeep}
          fillOpacity={0.82}
          stroke={Colors.brass}
          strokeOpacity={0.7}
          strokeWidth={0.8}
        />
        <Path
          d="M35 27 L50 50 L35 73 L20 50 Z"
          fill="none"
          stroke={Colors.brass}
          strokeOpacity={0.38}
          strokeWidth={0.5}
        />
        <Circle cx={35} cy={50} r={11.5} fill={Colors.inkBlack} fillOpacity={0.35} />
      </Svg>

      <View style={styles.backMonogramWrap} pointerEvents="none">
        <Text
          style={[
            styles.backMonogram,
            isMini && { fontSize: 7, letterSpacing: 0.3 },
          ]}
        >
          502
        </Text>
      </View>

      {/* Tiny brass corner diamonds */}
      <View style={[styles.backCorner, styles.backCornerTL, isMini && styles.backCornerMini]} />
      <View style={[styles.backCorner, styles.backCornerTR, isMini && styles.backCornerMini]} />
      <View style={[styles.backCorner, styles.backCornerBL, isMini && styles.backCornerMini]} />
      <View style={[styles.backCorner, styles.backCornerBR, isMini && styles.backCornerMini]} />
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
  const isMini = size === 'mini';
  const isLarge = size === 'large';

  const handlePress = () => {
    if (!playable && !onPress) return;
    if (onPress) {
      triggerHaptic(playable ? 'medium' : 'light');
      onPress();
    }
  };

  const liftAnim = useRef(new Animated.Value(playable ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(liftAnim, {
      toValue: selected ? 2 : playable ? 1 : 0,
      speed: 28,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  }, [playable, selected, liftAnim]);

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (playable) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1600,
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
    outputRange: [0, -8, -15],
  });

  const scale = liftAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1.025, 1.06],
  });

  const haloOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.32, 0.85],
  });

  if (faceDown || !card) {
    return (
      <View
        style={[
          styles.cardShadowWrap,
          { width: dims.width, height: dims.height },
          style,
        ]}
      >
        <View
          style={[
            styles.cardBase,
            styles.cardFaceDown,
            dims,
            { width: dims.width, height: dims.height },
          ]}
        >
          <View style={[styles.backPaper, { borderRadius: dims.borderRadius - 1 }]}>
            <CardBackArt size={size} />
          </View>
        </View>
      </View>
    );
  }

  let specialBadge: { label: string; bg: string; textCol: string; borderCol: string } | null = null;
  if (card.rank === '7' && card.suit === 'hearts') {
    specialBadge = { label: 'WIN', bg: Colors.burgundy, textCol: Colors.brassLight, borderCol: Colors.brass };
  } else if (card.rank === 'J') {
    specialBadge = { label: 'WILD', bg: Colors.emeraldMid, textCol: Colors.ivory, borderCol: Colors.brass };
  } else if (card.rank === 'A' && card.suit === 'spades') {
    specialBadge = { label: '+5', bg: Colors.burgundy, textCol: Colors.ivory, borderCol: Colors.brass };
  } else if (card.rank === '2') {
    specialBadge = { label: '+2', bg: '#7A4A1C', textCol: Colors.ivory, borderCol: Colors.brass };
  } else if (card.rank === '8') {
    specialBadge = { label: 'SKIP', bg: Colors.emeraldDeep, textCol: Colors.brassLight, borderCol: Colors.brass };
  }

  const rankSize = isMini ? 10.5 : isLarge ? 19 : 15;
  const suitSize = isMini ? 9 : isLarge ? 14 : 11.5;
  const centerSuitSize = isMini ? 15 : isLarge ? 44 : 31;

  return (
    <Animated.View
      style={[
        styles.cardShadowWrap,
        {
          width: dims.width,
          height: dims.height,
          transform: [{ translateY }, { scale }],
          zIndex: selected ? 12 : playable ? 6 : 1,
        },
        style,
      ]}
    >
      {playable && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.playableHalo,
            {
              opacity: haloOpacity,
              borderRadius: dims.borderRadius + 3,
            },
          ]}
        />
      )}

      <TouchableOpacity
        testID={testID}
        activeOpacity={playable ? 0.82 : 1}
        onPress={handlePress}
        disabled={!onPress}
        style={[
          styles.cardBase,
          { width: dims.width, height: dims.height, borderRadius: dims.borderRadius },
          playable && styles.cardPlayable,
          selected && styles.cardSelected,
        ]}
      >
        <View
          style={[
            styles.paper,
            { borderRadius: Math.max(dims.borderRadius - 1, 1) },
          ]}
        >
          <View style={styles.paperSheen} pointerEvents="none" />
          <View style={styles.paperShade} pointerEvents="none" />

          <View style={styles.innerFrame}>
            {/* Top-left index */}
            <View style={styles.cornerIndexTop}>
              <Text
                style={[
                  Typography.cardRank,
                  {
                    color: suitColor,
                    fontSize: rankSize,
                    lineHeight: rankSize + 1,
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
                    fontSize: suitSize,
                    lineHeight: suitSize + 1,
                  },
                ]}
              >
                {suitSymbol}
              </Text>
            </View>

            {/* Centre deco emblem */}
            <View style={styles.centerEmblem} pointerEvents="none">
              {!isMini && (
                <View
                  style={[
                    styles.emblemDiamond,
                    {
                      width: isLarge ? 58 : 43,
                      height: isLarge ? 58 : 43,
                      borderColor: isRed
                        ? 'rgba(158, 47, 56, 0.24)'
                        : 'rgba(19, 32, 27, 0.18)',
                    },
                  ]}
                />
              )}
              <Text
                style={{
                  color: suitColor,
                  fontSize: centerSuitSize,
                  lineHeight: centerSuitSize + 2,
                  opacity: isMini ? 0.9 : 0.88,
                  textShadowColor: 'rgba(0,0,0,0.08)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                {suitSymbol}
              </Text>
              {isLarge && (
                <View style={styles.emblemRuleRow}>
                  <View style={styles.emblemRule} />
                  <View style={styles.emblemDot} />
                  <View style={styles.emblemRule} />
                </View>
              )}
            </View>

            {/* Bottom-right index */}
            {!isMini && (
              <View style={styles.cornerIndexBottom}>
                <Text
                  style={[
                    Typography.cardRank,
                    {
                      color: suitColor,
                      fontSize: rankSize,
                      lineHeight: rankSize + 1,
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
                      fontSize: suitSize,
                      lineHeight: suitSize + 1,
                    },
                  ]}
                >
                  {suitSymbol}
                </Text>
              </View>
            )}

            {specialBadge && !isMini && (
              <View
                style={[
                  styles.specialTab,
                  {
                    backgroundColor: specialBadge.bg,
                    borderColor: specialBadge.borderCol,
                  },
                ]}
              >
                <Text style={[styles.specialTabText, { color: specialBadge.textCol }]}>
                  {specialBadge.label}
                </Text>
              </View>
            )}

            {/* Fine deco corner ticks */}
            <View style={[styles.cornerTick, styles.cornerTickTL]} />
            <View style={[styles.cornerTick, styles.cornerTickTR]} />
            <View style={[styles.cornerTick, styles.cornerTickBL]} />
            <View style={[styles.cornerTick, styles.cornerTickBR]} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardShadowWrap: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.42,
    shadowRadius: 7,
    elevation: 6,
  },
  cardBase: {
    backgroundColor: Colors.cardIvory,
    borderColor: '#D7C7A6',
    borderWidth: 1,
    padding: 3,
    overflow: 'hidden',
  },
  paper: {
    flex: 1,
    backgroundColor: Colors.cardIvoryInner,
    overflow: 'hidden',
    position: 'relative',
  },
  paperSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
  },
  paperShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '28%',
    backgroundColor: 'rgba(176, 150, 108, 0.08)',
  },
  innerFrame: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: 'rgba(138, 108, 57, 0.34)',
    padding: 3,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerIndexTop: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    zIndex: 2,
  },
  cornerIndexBottom: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    transform: [{ rotate: '180deg' }],
    zIndex: 2,
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
  emblemDiamond: {
    position: 'absolute',
    borderWidth: 0.8,
    transform: [{ rotate: '45deg' }],
  },
  emblemRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    width: 34,
  },
  emblemRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(138, 108, 57, 0.5)',
  },
  emblemDot: {
    width: 3,
    height: 3,
    marginHorizontal: 3,
    backgroundColor: 'rgba(138, 108, 57, 0.7)',
    transform: [{ rotate: '45deg' }],
  },
  specialTab: {
    position: 'absolute',
    top: 2,
    right: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 0.6,
    borderRadius: 1,
    zIndex: 3,
  },
  specialTabText: {
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  cornerTick: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderColor: 'rgba(138, 108, 57, 0.55)',
  },
  cornerTickTL: {
    top: 1,
    left: 1,
    borderTopWidth: 0.8,
    borderLeftWidth: 0.8,
  },
  cornerTickTR: {
    top: 1,
    right: 1,
    borderTopWidth: 0.8,
    borderRightWidth: 0.8,
  },
  cornerTickBL: {
    bottom: 1,
    left: 1,
    borderBottomWidth: 0.8,
    borderLeftWidth: 0.8,
  },
  cornerTickBR: {
    bottom: 1,
    right: 1,
    borderBottomWidth: 0.8,
    borderRightWidth: 0.8,
  },
  playableHalo: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: 1.2,
    borderColor: Colors.brassLight,
    shadowColor: Colors.brass,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 9,
    elevation: 8,
  },
  cardPlayable: {
    borderColor: Colors.brassLight,
    borderWidth: 1.2,
  },
  cardSelected: {
    borderColor: Colors.brassLight,
    borderWidth: 1.5,
  },
  cardFaceDown: {
    backgroundColor: Colors.emeraldDeep,
    borderColor: 'rgba(198, 164, 96, 0.65)',
    borderWidth: 1,
    padding: 3,
  },
  backPaper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.emerald,
  },
  backMonogramWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backMonogram: {
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.brassLight,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backCorner: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderWidth: 0.7,
    borderColor: 'rgba(198, 164, 96, 0.65)',
    transform: [{ rotate: '45deg' }],
  },
  backCornerMini: {
    width: 2.5,
    height: 2.5,
  },
  backCornerTL: { top: 6, left: 6 },
  backCornerTR: { top: 6, right: 6 },
  backCornerBL: { bottom: 6, left: 6 },
  backCornerBR: { bottom: 6, right: 6 },
});
