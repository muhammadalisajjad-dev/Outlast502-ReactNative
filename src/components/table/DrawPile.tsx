import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { PlayingCard } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { triggerHaptic } from '../../utils/haptics';

interface DrawPileProps {
  count: number;
  canDraw: boolean;
  onDraw: () => void;
}

export const DrawPile: React.FC<DrawPileProps> = ({
  count,
  canDraw,
  onDraw,
}) => {
  const handlePress = () => {
    if (!canDraw) return;
    triggerHaptic('medium');
    onDraw();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={canDraw ? 0.78 : 1}
        onPress={handlePress}
        disabled={!canDraw}
        style={[
          styles.pileWrapper,
          canDraw && styles.canDrawGlow,
        ]}
      >
        {/* Layered Deck Effect */}
        {count > 2 && <View style={styles.deckLayer2} />}
        {count > 1 && <View style={styles.deckLayer1} />}

        <PlayingCard faceDown size="large" />

        {/* Deck Count Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.pileLabel, canDraw && styles.pileLabelActive]}>
        {canDraw ? 'DRAW (+1)' : 'DECK'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pileWrapper: {
    position: 'relative',
    borderRadius: 7,
  },
  deckLayer2: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 84,
    height: 122,
    borderRadius: 7,
    backgroundColor: '#090f1a',
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.15)',
  },
  deckLayer1: {
    position: 'absolute',
    top: 1.5,
    left: 1.5,
    width: 84,
    height: 122,
    borderRadius: 7,
    backgroundColor: '#0c1424',
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  canDrawGlow: {
    shadowColor: Colors.cobaltGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: Colors.silverLight,
    fontSize: 9.5,
    fontWeight: '800',
  },
  pileLabel: {
    ...Typography.labelUpper,
    color: Colors.textMuted,
    marginTop: 8,
    fontSize: 9.5,
  },
  pileLabelActive: {
    color: Colors.cobaltLight,
    fontWeight: '800',
  },
});
