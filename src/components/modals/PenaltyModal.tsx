import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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

/**
 * Inline penalty ticket. It sits between the felt and the hand as a burgundy
 * club notice rather than a floating dialog, so the table stays visible.
 */
export const PenaltyModal: React.FC<PenaltyModalProps> = ({
  pendingPenalty,
  hasCounterCard,
  onAcceptPenalty,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingPenalty.active) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        speed: 25,
        bounciness: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [pendingPenalty.cardsOwed, pendingPenalty.active, slideAnim]);

  if (!pendingPenalty.active || !pendingPenalty.type) {
    return null;
  }

  const getPenaltyDetails = () => {
    switch (pendingPenalty.type) {
      case 'two':
        return {
          title: `2-STACK PENALTY · ${pendingPenalty.cardsOwed} CARDS`,
          subtitle: hasCounterCard
            ? `Play a 2 to pass & stack +2, or draw ${pendingPenalty.cardsOwed} cards.`
            : `No 2 in hand. You must draw ${pendingPenalty.cardsOwed} cards.`,
          actionTitle: `Draw ${pendingPenalty.cardsOwed}`,
        };
      case 'ace':
        return {
          title: 'ACE OF SPADES · 5 CARDS',
          subtitle: hasCounterCard
            ? 'Play any Ace to pass 5 cards, or draw 5 cards.'
            : 'No Ace in hand. You must draw 5 cards.',
          actionTitle: 'Draw 5 Cards',
        };
      case 'skip':
        return {
          title: 'SKIP ACTIVE',
          subtitle: hasCounterCard
            ? 'Play an 8 to pass the skip, or forfeit your turn.'
            : 'No 8 in hand. Your turn is skipped.',
          actionTitle: 'Accept Skip',
        };
      default:
        return null;
    }
  };

  const details = getPenaltyDetails();
  if (!details) return null;

  return (
    <Animated.View
      style={[
        styles.ticket,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              }),
            },
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.97, 1],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <View style={styles.edge} pointerEvents="none" />

      <View style={styles.iconWrap}>
        <View style={styles.iconDiamond}>
          <View style={styles.iconCounter}>
            <AlertTriangle size={11} color={Colors.brassLight} />
          </View>
        </View>
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
        textStyle={styles.actionText}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: '#2A0C11',
    borderWidth: 1,
    borderColor: 'rgba(198, 164, 96, 0.42)',
    borderRadius: 3,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
    elevation: 6,
    position: 'relative',
  },
  edge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.burgundyLight,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  iconWrap: {
    marginRight: 11,
    marginLeft: 2,
  },
  iconDiamond: {
    width: 24,
    height: 24,
    borderWidth: 0.8,
    borderColor: 'rgba(198, 164, 96, 0.55)',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 31, 42, 0.55)',
  },
  iconCounter: {
    transform: [{ rotate: '-45deg' }],
  },
  contentCol: {
    flex: 1,
    marginRight: 8,
  },
  bannerTitle: {
    ...Typography.labelUpper,
    color: Colors.ivory,
    fontSize: 8.4,
    letterSpacing: 1.5,
  },
  bannerSubtitle: {
    ...Typography.serifItalic,
    color: Colors.ivoryMuted,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionText: {
    fontSize: 9.5,
    letterSpacing: 0.9,
  },
});
