import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../../types/game';
import { PlayingCard } from '../card/PlayingCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface OpponentSeatProps {
  player: Player;
  isCurrentTurn: boolean;
}

const AVATAR_COLORS = ['#3182ce', '#805ad5', '#d69e2e', '#dd6b20', '#38b2ac'];

export const OpponentSeat: React.FC<OpponentSeatProps> = ({
  player,
  isCurrentTurn,
}) => {
  const avatarBg = AVATAR_COLORS[player.avatarSeed % AVATAR_COLORS.length] || '#4a5568';
  const displayCardCount = Math.min(player.hand.length, 5);

  return (
    <View
      style={[
        styles.container,
        isCurrentTurn && styles.activeTurnContainer,
        player.isEliminated && styles.eliminatedContainer,
      ]}
    >
      {/* Avatar & Turn Indicator */}
      <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
        <Text style={styles.avatarInitial}>
          {player.name.charAt(0).toUpperCase()}
        </Text>
        {isCurrentTurn && <View style={styles.turnPulseRing} />}
      </View>

      {/* Name & Status */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.nameText,
              isCurrentTurn && styles.nameActiveText,
              player.isEliminated && styles.nameEliminatedText,
            ]}
            numberOfLines={1}
          >
            {player.name}
          </Text>
          {player.immuneThisRound && (
            <View style={styles.immunePill}>
              <Text style={styles.immuneText}>🛡️ IMMUNE</Text>
            </View>
          )}
        </View>

        <Text style={styles.scoreText}>
          {player.isEliminated ? 'ELIMINATED' : `${player.cumulativeScore} pts`}
        </Text>

        {/* Mini Card Backs */}
        {!player.isEliminated && (
          <View style={styles.miniCardsRow}>
            {Array.from({ length: displayCardCount }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.miniCardWrapper,
                  idx > 0 && { marginLeft: -18 },
                ]}
              >
                <PlayingCard faceDown size="mini" />
              </View>
            ))}
            <Text style={styles.cardCountNumber}>
              {player.hand.length}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 31, 22, 0.75)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    minWidth: 105,
    maxWidth: 135,
  },
  activeTurnContainer: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(26, 66, 48, 0.9)',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  eliminatedContainer: {
    opacity: 0.45,
    borderColor: Colors.crimson,
    backgroundColor: 'rgba(20, 10, 10, 0.8)',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 6,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  turnPulseRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
    borderColor: Colors.gold,
    borderWidth: 1.5,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 11,
  },
  nameActiveText: {
    color: Colors.goldLight,
  },
  nameEliminatedText: {
    color: Colors.crimsonLight,
    textDecorationLine: 'line-through',
  },
  immunePill: {
    marginLeft: 4,
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    paddingHorizontal: 3,
    borderRadius: 3,
  },
  immuneText: {
    fontSize: 8,
    color: Colors.playableLime,
    fontWeight: '800',
  },
  scoreText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  miniCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  miniCardWrapper: {
    zIndex: 1,
  },
  cardCountNumber: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginLeft: 3,
  },
});
