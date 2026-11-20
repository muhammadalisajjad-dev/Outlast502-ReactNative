import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PenaltyState } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface PenaltyModalProps {
  pendingPenalty: PenaltyState;
  hasCounterCard: boolean;
  onAcceptPenalty: () => void;
}

export const PenaltyModal: React.FC<PenaltyModalProps> = ({
  pendingPenalty,
  hasCounterCard,
  onAcceptPenalty,
}) => {
  if (!pendingPenalty.active || !pendingPenalty.type) {
    return null;
  }

  const getPenaltyDetails = () => {
    switch (pendingPenalty.type) {
      case 'two':
        return {
          title: `⚠️ 2-STACK PENALTY (${pendingPenalty.cardsOwed} CARDS)`,
          subtitle: hasCounterCard
            ? `Play a 2 from your hand to pass & add +2, or draw ${pendingPenalty.cardsOwed} cards:`
            : `You have no 2. You must draw ${pendingPenalty.cardsOwed} cards:`,
          actionTitle: `Draw ${pendingPenalty.cardsOwed} Cards`,
        };
      case 'ace':
        return {
          title: '⚠️ ACE OF SPADES PENALTY (5 CARDS)',
          subtitle: hasCounterCard
            ? 'Play any Ace from your hand to pass 5 cards, or draw 5 cards:'
            : 'You have no Ace. You must draw 5 cards:',
          actionTitle: 'Draw 5 Cards',
        };
      case 'skip':
        return {
          title: '⚠️ SKIP ACTIVATED',
          subtitle: hasCounterCard
            ? 'Play an 8 from your hand to pass the skip, or lose your turn:'
            : 'You have no 8. Your turn is skipped:',
          actionTitle: 'Accept Skip',
        };
      default:
        return null;
    }
  };

  const details = getPenaltyDetails();
  if (!details) return null;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.contentCol}>
        <Text style={styles.bannerTitle}>{details.title}</Text>
        <Text style={styles.bannerSubtitle}>{details.subtitle}</Text>
      </View>

      <Button
        title={details.actionTitle}
        variant="crimson"
        size="small"
        onPress={onAcceptPenalty}
        style={styles.actionBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: 'rgba(192, 57, 43, 0.95)',
    borderColor: Colors.crimsonLight,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.crimson,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  contentCol: {
    flex: 1,
    marginRight: 10,
  },
  bannerTitle: {
    ...Typography.bodySmall,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#fbeee6',
    marginTop: 2,
  },
  actionBtn: {
    minWidth: 100,
  },
});
