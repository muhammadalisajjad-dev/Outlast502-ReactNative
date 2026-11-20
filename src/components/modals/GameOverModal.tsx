import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Player } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface GameOverModalProps {
  visible: boolean;
  matchWinnerId: string | null;
  players: Player[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  matchWinnerId,
  players,
  onPlayAgain,
  onGoHome,
}) => {
  if (!matchWinnerId) return null;

  const winner = players.find(p => p.id === matchWinnerId);
  const winnerName = winner ? winner.name : 'Unknown';

  // Sort players: survivors first (lowest score first), then eliminated players (lowest score first)
  const rankedPlayers = [...players].sort((a, b) => {
    if (a.id === matchWinnerId) return -1;
    if (b.id === matchWinnerId) return 1;
    if (a.isEliminated !== b.isEliminated) {
      return a.isEliminated ? 1 : -1;
    }
    return a.cumulativeScore - b.cumulativeScore;
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.title}>MATCH COMPLETE</Text>

          {/* Winner Showcase */}
          <View style={styles.winnerCard}>
            <Text style={styles.championLabel}>OUTLAST 502 CHAMPION</Text>
            <Text style={styles.winnerName}>{winnerName}</Text>
            <Text style={styles.winnerScore}>
              Final Score: {winner?.cumulativeScore ?? 0} pts
            </Text>
          </View>

          <Text style={styles.sectionHeading}>Final Standings</Text>

          <ScrollView style={styles.rankList}>
            {rankedPlayers.map((p, idx) => {
              const isFirst = p.id === matchWinnerId;
              return (
                <View
                  key={p.id}
                  style={[
                    styles.rankRow,
                    isFirst && styles.firstRow,
                    p.isEliminated && styles.eliminatedRow,
                  ]}
                >
                  <View style={styles.leftRank}>
                    <Text
                      style={[
                        styles.rankNumber,
                        isFirst && styles.firstRankNumber,
                      ]}
                    >
                      #{idx + 1}
                    </Text>
                    <View>
                      <Text style={styles.playerName}>
                        {p.name} {p.isHuman ? '(You)' : ''}
                      </Text>
                      {p.isEliminated && (
                        <Text style={styles.statusText}>💀 Eliminated (502+)</Text>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.scoreText,
                      isFirst && styles.firstScoreText,
                    ]}
                  >
                    {p.cumulativeScore} pts
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.btnRow}>
            <Button
              title="Play Again 🔄"
              variant="gold"
              size="medium"
              onPress={onPlayAgain}
              style={styles.actionBtn}
            />
            <Button
              title="Main Menu 🏠"
              variant="outline"
              size="medium"
              onPress={onGoHome}
              style={styles.actionBtn}
            />
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
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 14,
  },
  trophy: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    ...Typography.titleMedium,
    color: Colors.gold,
    letterSpacing: 2,
    marginBottom: 12,
  },
  winnerCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.gold,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  championLabel: {
    ...Typography.badge,
    color: Colors.playableLime,
    letterSpacing: 1,
  },
  winnerName: {
    ...Typography.titleLarge,
    color: Colors.goldLight,
    marginVertical: 4,
  },
  winnerScore: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sectionHeading: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  rankList: {
    width: '100%',
    marginBottom: 16,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
  firstRow: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(26, 66, 48, 0.95)',
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  leftRank: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textMuted,
    width: 32,
  },
  firstRankNumber: {
    color: Colors.gold,
  },
  playerName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 10,
    color: Colors.crimsonLight,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.goldLight,
  },
  firstScoreText: {
    color: Colors.playableLime,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
