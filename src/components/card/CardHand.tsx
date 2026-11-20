import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Card } from '../../types/card';
import { PlayingCard } from './PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

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
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.handTitle}>
          Your Hand ({hand.length} {hand.length === 1 ? 'card' : 'cards'})
        </Text>
        {isMyTurn && (
          <Text style={styles.turnHint}>
            {playableCardIds.size > 0
              ? 'Tap a glowing card to play'
              : 'No matching cards — draw from deck'}
          </Text>
        )}
      </View>

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
    marginBottom: 6,
  },
  handTitle: {
    ...Typography.bodySmall,
    color: Colors.textGold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  turnHint: {
    ...Typography.bodySmall,
    color: Colors.playableLime,
    fontWeight: '600',
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cardWrapper: {
    zIndex: 1,
  },
  overlappingCard: {
    marginLeft: -14, // Fanned card overlap effect
  },
});
