import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
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
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popAnim.setValue(0);
      Animated.spring(popAnim, {
        toValue: 1,
        speed: 25,
        bounciness: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, popAnim]);

  const handleSelect = (suit: Suit) => {
    triggerHaptic('medium');
    onSelectSuit(suit);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              transform: [
                {
                  scale: popAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              opacity: popAnim,
            },
          ]}
        >
          <Text style={styles.title}>JACK DECLARED</Text>
          <Text style={styles.subtitle}>
            Select a suit to demand from the next player:
          </Text>

          <View style={styles.grid}>
            {SUITS.map(suit => {
              const isRed = SUIT_COLORS[suit] === 'red';
              return (
                <TouchableOpacity
                  key={suit}
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
        </Animated.View>
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
    borderColor: Colors.borderSubtle,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.silverLight,
    letterSpacing: 1.5,
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
    width: '48%',
    backgroundColor: Colors.cardIvory,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  suitSymbol: {
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 2,
  },
  suitName: {
    ...Typography.badge,
    color: Colors.cardBlackSuit,
    fontSize: 9.5,
  },
});
