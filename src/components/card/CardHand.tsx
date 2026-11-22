import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import { Card } from '../../types/card';
import { PlayingCard, CARD_SIZES } from './PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

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
      speed: 18,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  }, [hand.length, dealAnim]);

  const compact = screenWidth < 380 || screenHeight < 760;
  // Reserve room for the rotated end cards so the fan never clips.
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.label}>Your hand</Text>
          <Text style={styles.count}>
            <Text style={styles.countNumber}>{hand.length}</Text>
            <Text style={styles.countUnit}> cards</Text>
          </Text>
        </View>

        <View style={styles.headerRight}>
          {isMyTurn ? (
            playableCount > 0 ? (
              <Text style={styles.hintPlayable}>
                {playableCount} {playableCount === 1 ? 'play' : 'plays'} ready
              </Text>
            ) : (
              <Text style={styles.hintQuiet}>No match · tap the deck</Text>
            )
          ) : (
            <Text style={styles.hintQuiet}>Waiting for your turn</Text>
          )}
          {typeof playerScore === 'number' && (
            <Text style={styles.score}>{playerScore} pts</Text>
          )}
        </View>
      </View>

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
    paddingTop: 12,
    paddingBottom: 2,
    width: '100%',
    backgroundColor: 'rgba(11, 16, 14, 0.94)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.line,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  label: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 8,
    letterSpacing: 1.4,
    marginRight: 10,
    textTransform: 'uppercase',
  },
  count: {
    fontFamily: Typography.numeral.fontFamily,
    fontSize: 17,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  countNumber: {
    color: Colors.textPrimary,
    fontSize: 19,
  },
  countUnit: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: Typography.bodySmall.fontFamily,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  hintPlayable: {
    ...Typography.micro,
    color: Colors.accentSoft,
    fontSize: 7.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  hintQuiet: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  score: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 7.5,
    letterSpacing: 1,
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: 'flex-end',
  },
  scrollContentLeft: {},
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardWrapper: {},
  cardWrapperPlayable: {
    marginBottom: 6,
  },
});
