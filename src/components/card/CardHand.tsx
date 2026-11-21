import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { Card } from '../../types/card';
import { PlayingCard } from './PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Sparkles, Layers } from 'lucide-react-native';

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
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {hand.map((card, index) => {
            const isPlayable = isMyTurn && playableCardIds.has(card.id);
            return (
              <View
                key={card.id}
                style={[
                  styles.cardWrapper,
                  index > 0 && styles.overlappingCard,
                ]}
              >
                <PlayingCard
                  card={card}
                  playable={isPlayable}
                  onPress={isPlayable ? () => onCardPress(card) : undefined}
                  size="normal"
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
    alignItems: 'center',
  },
  cardWrapper: {
    zIndex: 1,
  },
  overlappingCard: {
    marginLeft: -14,
  },
});
