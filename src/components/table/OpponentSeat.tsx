import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../../types/game';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Shield, Skull, Layers } from 'lucide-react-native';

interface OpponentSeatProps {
  player: Player;
  isCurrentTurn: boolean;
}

const AVATAR_COLORS = ['#1e293b', '#1e3a5f', '#172554', '#1f2937', '#0f172a'];

export const OpponentSeat: React.FC<OpponentSeatProps> = ({
  player,
  isCurrentTurn,
}) => {
  const avatarBg = AVATAR_COLORS[player.avatarSeed % AVATAR_COLORS.length] || '#1e293b';

  return (
    <View
      style={[
        styles.container,
        isCurrentTurn && styles.activeTurnContainer,
        player.isEliminated && styles.eliminatedContainer,
      ]}
    >
      {/* Top Row: Avatar & Status */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: avatarBg },
            isCurrentTurn && styles.avatarActiveRing,
          ]}
        >
          <Text style={styles.avatarInitial}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Turn / Status Tag */}
        {player.isEliminated ? (
          <View style={styles.eliminatedTag}>
            <Skull size={10} color={Colors.crimsonLight} />
          </View>
        ) : player.immuneThisRound ? (
          <View style={styles.immuneTag}>
            <Shield size={10} color={Colors.textAccent} />
          </View>
        ) : isCurrentTurn ? (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>TURN</Text>
          </View>
        ) : null}
      </View>

      {/* Name */}
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

      {/* Score & Cards */}
      <View style={styles.bottomRow}>
        <Text
          style={[
            styles.scoreText,
            player.cumulativeScore >= 400 && styles.scoreDanger,
            player.isEliminated && styles.scoreEliminated,
          ]}
        >
          {player.isEliminated ? 'OUT' : `${player.cumulativeScore}p`}
        </Text>

        {!player.isEliminated && (
          <View style={styles.cardCountGroup}>
            <Layers size={10} color={Colors.textMuted} style={{ marginRight: 2 }} />
            <Text style={styles.cardCountText}>{player.hand.length}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 3,
    width: 82,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTurnContainer: {
    borderColor: Colors.cobaltLight,
    backgroundColor: 'rgba(23, 34, 60, 0.95)',
    shadowColor: Colors.cobalt,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  eliminatedContainer: {
    opacity: 0.45,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: 4,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActiveRing: {
    borderColor: Colors.cobaltLight,
    borderWidth: 1.5,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  activePill: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: Colors.cobalt,
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  activePillText: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  immuneTag: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    padding: 2,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: Colors.cobaltLight,
  },
  eliminatedTag: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    padding: 2,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: Colors.crimsonLight,
  },
  nameText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    marginBottom: 2,
  },
  nameActiveText: {
    color: Colors.silverLight,
    fontWeight: '800',
  },
  nameEliminatedText: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 2,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  scoreDanger: {
    color: Colors.crimsonLight,
  },
  scoreEliminated: {
    color: Colors.crimsonLight,
    fontWeight: '800',
  },
  cardCountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCountText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
