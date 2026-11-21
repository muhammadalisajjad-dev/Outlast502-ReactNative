import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Card } from '../../types/card';
import { PlayingCard, CARD_SIZES } from './PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BrassDiamond } from '../common/Deco';

interface CardHandProps {
  hand: Card[];
  playableCardIds: Set<string>;
  onCardPress: (card: Card) => void;
  isMyTurn: boolean;
  style?: ViewStyle;
  playerScore?: number;
  playerName?: string;
}

const CARD_WIDTH = CARD_SIZES.normal.width;
const MIN_VISIBLE_STRIP = 30;
const MAX_OVERLAP = CARD_WIDTH - MIN_VISIBLE_STRIP;

export const CardHand: React.FC<CardHandProps> = ({
  hand,
  playableCardIds,
  onCardPress,
  isMyTurn,
  style,
  playerScore,
  playerName,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const playableCount = hand.filter(c => playableCardIds.has(c.id)).length;
  const dealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dealAnim.setValue(0);
    Animated.spring(dealAnim, {
      toValue: 1,
      speed: 17,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  }, [hand.length, dealAnim]);

  const compact = screenWidth < 380 || screenHeight < 760;
  // Leave room for the rotated cards at both edges so the fan never clips.
  const availableWidth = Math.min(screenWidth - 48, 520);
  const count = hand.length;

  let overlapOffset = 0;
  if (count > 1) {
    const neededOverlap = CARD_WIDTH - (availableWidth - CARD_WIDTH) / (count - 1);
    overlapOffset = Math.min(Math.max(neededOverlap, 0), MAX_OVERLAP);
  }

  const totalFanWidth =
    count > 1
      ? CARD_WIDTH + (count - 1) * (CARD_WIDTH - overlapOffset)
      : CARD_WIDTH;
  const needsScroll = totalFanWidth > availableWidth;

  const mid = (count - 1) / 2;
  const rotationFactor = count > 1 ? Math.min(6, 22 / (count - 1)) : 0;
  const arcDepth = compact ? 7 : 11;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <View style={styles.handIdentity}>
          <Text style={styles.handKicker}>
            {playerName && playerName.trim().toLowerCase() !== 'you'
              ? `${playerName.toUpperCase()}'S HAND`
              : 'YOUR HAND'}
          </Text>
          <View style={styles.countGroup}>
            <Text style={styles.handCount}>{hand.length}</Text>
            <Text style={styles.handCountLabel}>CARDS</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isMyTurn ? (
            playableCount > 0 ? (
              <View style={styles.hintRow}>
                <BrassDiamond size={5} filled />
                <Text style={styles.hintPlayable}>
                  {playableCount} {playableCount === 1 ? 'PLAY' : 'PLAYS'} AVAILABLE
                </Text>
              </View>
            ) : (
              <Text style={styles.hintDraw}>NO MATCH · TAP DECK TO DRAW</Text>
            )
          ) : (
            <Text style={styles.hintWaiting}>AWAITING YOUR TURN</Text>
          )}
          {typeof playerScore === 'number' && (
            <Text style={styles.scoreLine}>{playerScore} PTS</Text>
          )}
        </View>
      </View>

      <View style={styles.railLine} pointerEvents="none" />

      <Animated.View
        style={{
          transform: [
            {
              translateY: dealAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [22, 0],
              }),
            },
          ],
          opacity: dealAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.25, 1],
          }),
        }}
      >
        <ScrollView
          horizontal
          scrollEnabled={needsScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            needsScroll ? styles.scrollContentLeft : styles.scrollContentCentered,
          ]}
        >
          {hand.map((card, index) => {
            const isPlayable = isMyTurn && playableCardIds.has(card.id);
            const rotation = (index - mid) * rotationFactor;
            const arc = Math.pow(Math.abs(index - mid) / Math.max(mid, 1), 2) * arcDepth;

            return (
              <View
                key={card.id}
                style={[
                  styles.cardWrapper,
                  isPlayable && styles.cardWrapperPlayable,
                  index > 0 && { marginLeft: -overlapOffset },
                  {
                    zIndex: index + 1,
                    transform: [{ rotate: `${rotation}deg` }, { translateY: arc }],
                  },
                ]}
              >
                <PlayingCard
                  card={card}
                  playable={isPlayable}
                  onPress={isPlayable ? () => onCardPress(card) : undefined}
                  size="normal"
                  testID={isPlayable ? 'playable-card' : 'card-item'}
                />
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 9,
    paddingBottom: 2,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    marginBottom: 2,
  },
  handIdentity: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  handKicker: {
    ...Typography.labelUpper,
    color: Colors.brassLight,
    fontSize: 8.5,
    letterSpacing: 2,
    marginRight: 10,
  },
  countGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  handCount: {
    ...Typography.numeral,
    fontSize: 17,
    color: Colors.ivory,
    lineHeight: 19,
    marginRight: 4,
  },
  handCountLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.5,
    letterSpacing: 1.4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintPlayable: {
    ...Typography.micro,
    color: Colors.brassLight,
    fontSize: 8,
    letterSpacing: 1.4,
    marginLeft: 5,
  },
  hintDraw: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.8,
    letterSpacing: 1.2,
  },
  hintWaiting: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.8,
    letterSpacing: 1.2,
  },
  scoreLine: {
    ...Typography.micro,
    color: Colors.ivoryMuted,
    fontSize: 7.5,
    letterSpacing: 1.3,
    marginTop: 3,
  },
  railLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 9,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198, 164, 96, 0.2)',
  },
  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 18,
    paddingBottom: 13,
    alignItems: 'flex-end',
  },
  scrollContentLeft: {},
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardWrapper: {
    // transform and zIndex set inline per card
  },
  cardWrapperPlayable: {
    marginBottom: 4,
  },
});
