import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PenaltyState } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { AlertTriangle } from 'lucide-react-native';

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
          title: `2-STACK PENALTY (${pendingPenalty.cardsOwed} CARDS)`,
          subtitle: hasCounterCard
            ? `Play a 2 to pass & stack +2, or draw ${pendingPenalty.cardsOwed} cards:`
            : `No 2 in hand. Must draw ${pendingPenalty.cardsOwed} cards:`,
          actionTitle: `Draw ${pendingPenalty.cardsOwed}`,
        };
      case 'ace':
        return {
          title: 'ACE OF SPADES (5 CARDS)',
          subtitle: hasCounterCard
            ? 'Play any Ace to pass 5 cards, or draw 5 cards:'
            : 'No Ace in hand. Must draw 5 cards:',
          actionTitle: 'Draw 5 Cards',
        };
      case 'skip':
        return {
          title: 'SKIP ACTIVE',
          subtitle: hasCounterCard
            ? 'Play an 8 to pass the skip, or forfeit turn:'
            : 'No 8 in hand. Turn is skipped:',
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
      <View style={styles.iconCol}>
        <AlertTriangle size={18} color="#ffffff" />
      </View>

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
    backgroundColor: 'rgba(185, 28, 28, 0.95)',
    borderColor: 'rgba(239, 68, 68, 0.6)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconCol: {
    marginRight: 10,
  },
  contentCol: {
    flex: 1,
    marginRight: 10,
  },
  bannerTitle: {
    ...Typography.badge,
    color: '#ffffff',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  bannerSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginTop: 1,
  },
  actionBtn: {
    backgroundColor: '#7f1d1d',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
  },
});
