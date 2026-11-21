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
import { PlayingCard } from './PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Sparkles, Layers } from 'lucide-react-native';

// Card dimensions must match PlayingCard size="normal" dimensions
const CARD_WIDTH = 66;
const CARD_HEIGHT = 96;
// Minimum visible strip of each overlapped card (rank + suit in top-left corner)
const MIN_VISIBLE_STRIP = 28;
// Maximum overlap - never obscure more than this
const MAX_OVERLAP = CARD_WIDTH - MIN_VISIBLE_STRIP; // 38

interface CardHandProps {
  hand: Card[];
  playableCardIds: Set<string>;
  onCardPress: (card: Card) => void;
  isMyTurn: boolean;
  style?: ViewStyle;
}

export const CardHand: React.FC<CardHandProps> = ({
  hand,
  playableCardIds,
  onCardPress,
  isMyTurn,
  style,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const playableCount = hand.filter(c => playableCardIds.has(c.id)).length;
  const dealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dealAnim.setValue(0);
    Animated.spring(dealAnim, {
      toValue: 1,
      speed: 16,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }, [hand.length, dealAnim]);

  // Compute adaptive overlap so the entire hand fits within screen width.
  // Available horizontal space = screen width minus side padding (2×16) and scroll indicator margin.
  const availableWidth = screenWidth - 32;
  const count = hand.length;

  let overlapOffset = 0; // negative marginLeft applied to cards after the first
  if (count > 1) {
    // Total width if no overlap: count * CARD_WIDTH
    // With overlap: CARD_WIDTH + (count - 1) * (CARD_WIDTH - overlap)
    // Solve for overlap so total fits in availableWidth:
    //   CARD_WIDTH + (count - 1) * (CARD_WIDTH - overlap) <= availableWidth
    //   (CARD_WIDTH - overlap) <= (availableWidth - CARD_WIDTH) / (count - 1)
    //   overlap >= CARD_WIDTH - (availableWidth - CARD_WIDTH) / (count - 1)
    const neededOverlap = CARD_WIDTH - (availableWidth - CARD_WIDTH) / (count - 1);
    overlapOffset = Math.min(Math.max(neededOverlap, 0), MAX_OVERLAP);
  }

  // If the hand still can't fit (very large hands), enable horizontal scroll
  const totalFanWidth = count > 1
    ? CARD_WIDTH + (count - 1) * (CARD_WIDTH - overlapOffset)
    : CARD_WIDTH;
  const needsScroll = totalFanWidth > availableWidth;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Layers size={13} color={Colors.textAccent} style={{ marginRight: 6 }} />
          <Text style={styles.handTitle}>
            HAND ({hand.length})
          </Text>
        </View>

        {isMyTurn && (
          <View style={styles.hintGroup}>
            {playableCount > 0 ? (
              <>
                <Sparkles size={12} color={Colors.playableBlue} style={{ marginRight: 4 }} />
                <Text style={styles.turnHintPlayable}>
                  {playableCount} playable {playableCount === 1 ? 'card' : 'cards'}
                </Text>
              </>
            ) : (
              <Text style={styles.turnHintDraw}>
                No matches — tap deck to draw
              </Text>
            )}
          </View>
        )}
      </View>

      <Animated.View
        style={{
          transform: [
            {
              translateY: dealAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
          opacity: dealAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        }}
      >
        <ScrollView
          horizontal
          scrollEnabled={needsScroll}
          showsHorizontalScrollIndicator={needsScroll}
          contentContainerStyle={[
            styles.scrollContent,
            // When scrolling, left-align; when fitting, centre
            needsScroll ? styles.scrollContentLeft : styles.scrollContentCentered,
          ]}
        >
          {hand.map((card, index) => {
            const isPlayable = isMyTurn && playableCardIds.has(card.id);
            return (
              <View
                key={card.id}
                style={[
                  styles.cardWrapper,
                  // Raise playable cards slightly so they're visually accessible
                  isPlayable && styles.cardWrapperPlayable,
                  index > 0 && { marginLeft: -overlapOffset },
                  // Stagger z-index so later cards render on top (last card fully visible)
                  { zIndex: index + 1 },
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
        {needsScroll && (
          <Text style={styles.scrollHint}>← scroll to see all cards →</Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handTitle: {
    ...Typography.labelUpper,
    color: Colors.silverLight,
  },
  hintGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnHintPlayable: {
    ...Typography.bodySmall,
    color: Colors.playableBlue,
    fontWeight: '700',
    fontSize: 11,
  },
  turnHintDraw: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: 'flex-end', // bottom-align so elevated cards rise upward
  },
  scrollContentLeft: {
    // scroll mode: left-aligned, natural flow
  },
  scrollContentCentered: {
    // fan mode: justify content to center of container
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardWrapper: {
    // zIndex set inline per card index
  },
  cardWrapperPlayable: {
    // Extra bottom margin so the lift animation isn't clipped
    marginBottom: 4,
  },
  scrollHint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    paddingBottom: 4,
    letterSpacing: 0.5,
  },
});
