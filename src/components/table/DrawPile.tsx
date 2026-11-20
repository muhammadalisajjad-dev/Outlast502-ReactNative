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
        activeOpacity={canDraw ? 0.8 : 1}
        onPress={handlePress}
        disabled={!canDraw}
        style={[
          styles.pileWrapper,
          canDraw && styles.canDrawGlow,
        ]}
      >
        <PlayingCard faceDown size="large" />

        {/* Deck Count Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.pileLabel}>
        {canDraw ? 'Tap to Draw' : 'Draw Deck'}
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
    borderRadius: 8,
  },
  canDrawGlow: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.gold,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: Colors.goldLight,
    fontSize: 10,
    fontWeight: '800',
  },
  pileLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
