import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Suit, SUITS, SUIT_NAMES, SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

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
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>🃏 Jack Declared!</Text>
          <Text style={styles.subtitle}>
            Choose a suit to demand from the next player:
          </Text>

          <View style={styles.grid}>
            {SUITS.map(suit => {
              const isRed = SUIT_COLORS[suit] === 'red';
              return (
                <TouchableOpacity
                  key={suit}
                  activeOpacity={0.8}
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
                  <Text style={styles.suitName}>{SUIT_NAMES[suit]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.goldLight,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  suitButton: {
    width: '47%',
    backgroundColor: Colors.cardIvory,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  suitSymbol: {
    fontSize: 32,
    marginBottom: 4,
  },
  suitName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
