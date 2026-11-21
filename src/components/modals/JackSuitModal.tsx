import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Suit, SUITS, SUIT_NAMES, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';
import { DecoModal } from '../common/DecoModal';
import { OrnamentDivider } from '../common/Deco';

interface JackSuitModalProps {
  visible: boolean;
  onSelectSuit: (suit: Suit) => void;
}

export const JackSuitModal: React.FC<JackSuitModalProps> = ({
  visible,
  onSelectSuit,
}) => {
  const handleSelect = (suit: Suit) => {
    triggerHaptic('medium');
    onSelectSuit(suit);
  };

  return (
    <DecoModal visible={visible} maxWidth={330}>
      <Text style={styles.kicker}>THE JACK IS WILD</Text>
      <Text style={styles.title}>Name the Suit</Text>
      <Text style={styles.subtitle}>
        The next player must follow your demand, answer with a Jack or 7♥, or draw.
      </Text>

      <OrnamentDivider compact style={styles.divider} />

      <View style={styles.grid}>
        {SUITS.map(suit => {
          const isRed = SUIT_COLORS[suit] === 'red';
          return (
            <TouchableOpacity
              key={suit}
              testID={`suit-select-${suit}`}
              activeOpacity={0.78}
              style={styles.suitButton}
              onPress={() => handleSelect(suit)}
            >
              <Text
                style={[
                  styles.suitSymbol,
                  { color: isRed ? Colors.cardRedSuit : Colors.cardBlackSuit },
                ]}
              >
                {SUIT_SYMBOLS[suit]}
              </Text>
              <Text style={styles.suitName}>{SUIT_NAMES[suit].toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </DecoModal>
  );
};

const styles = StyleSheet.create({
  kicker: {
    ...Typography.micro,
    color: Colors.brass,
    fontSize: 7,
    letterSpacing: 2.2,
    textAlign: 'center',
  },
  title: {
    ...Typography.serifHeading,
    color: Colors.ivory,
    fontSize: 23,
    textAlign: 'center',
    marginTop: 3,
  },
  subtitle: {
    ...Typography.serifItalic,
    color: Colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 5,
  },
  divider: {
    width: 160,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  suitButton: {
    width: '48.5%',
    backgroundColor: Colors.cardIvoryInner,
    borderColor: Colors.cardBorder,
    borderWidth: 0.8,
    borderRadius: 3,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  suitSymbol: {
    fontSize: 30,
    lineHeight: 33,
    marginBottom: 1,
  },
  suitName: {
    ...Typography.micro,
    color: Colors.cardBlackSuit,
    fontSize: 7,
    letterSpacing: 1.4,
  },
});
