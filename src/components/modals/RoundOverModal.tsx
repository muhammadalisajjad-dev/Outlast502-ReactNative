import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Player, RoundResult } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface RoundOverModalProps {
  visible: boolean;
  roundResult: RoundResult | null;
  players: Player[];
  onNextRound: () => void;
}

export const RoundOverModal: React.FC<RoundOverModalProps> = ({
  visible,
  roundResult,
  players,
  onNextRound,
}) => {
  if (!roundResult) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>ROUND {roundResult.roundNumber} OVER</Text>

          {/* Winner Banner */}
          <View style={styles.winnerBanner}>
            <Text style={styles.winnerTitle}>
              👑 {roundResult.winnerName} Won!
            </Text>
            <Text style={styles.winReason}>
              {roundResult.winReason === 'seven_of_hearts'
                ? '⚡ 7 of Hearts Instant Win'
                : '🃏 Emptied Hand'}
            </Text>
          </View>

          {/* Special Final Penalty Notice */}
          {roundResult.forcedPenaltyPlayerId && (
            <View style={styles.forcedPenaltyNotice}>
              <Text style={styles.forcedPenaltyText}>
                ⚠️ Final card was a penalty card! Next player was forced to draw{' '}
                {roundResult.forcedPenaltyCards} cards before scoring.
              </Text>
            </View>
          )}

          <Text style={styles.sectionHeading}>Round Score Summary</Text>

          {/* Player Breakdown */}
          <ScrollView style={styles.scoreList}>
            {players.map(p => {
              const isWinner = p.id === roundResult.winnerId;
              const roundScore = roundResult.playerRoundScores[p.id] ?? 0;
              const isEliminated = p.isEliminated;

              return (
                <View
                  key={p.id}
                  style={[
                    styles.playerRow,
                    isWinner && styles.winnerRow,
                    isEliminated && styles.eliminatedRow,
                  ]}
                >
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {p.name} {p.isHuman ? '(You)' : ''}
                    </Text>
                    {p.immuneThisRound && (
                      <Text style={styles.immunityBadge}>🛡️ IMMUNE THIS ROUND</Text>
                    )}
                    {isEliminated && (
                      <Text style={styles.eliminatedBadge}>💀 ELIMINATED (502+)</Text>
                    )}
                  </View>

                  <View style={styles.scoreDetails}>
                    <Text style={styles.roundScoreText}>+{roundScore} pts</Text>
                    <Text style={styles.cumulativeText}>
                      Total: {p.cumulativeScore} / 502
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Button
            title="Next Round →"
            variant="gold"
            size="large"
            onPress={onNextRound}
            style={styles.nextBtn}
          />
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
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  title: {
    ...Typography.titleMedium,
    color: Colors.gold,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  winnerBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.gold,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  winnerTitle: {
    ...Typography.titleSmall,
    color: Colors.goldLight,
  },
  winReason: {
    fontSize: 12,
    color: Colors.playableLime,
    fontWeight: '700',
    marginTop: 2,
  },
  forcedPenaltyNotice: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderColor: Colors.crimsonLight,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    width: '100%',
  },
  forcedPenaltyText: {
    fontSize: 11,
    color: '#ffcdd2',
    textAlign: 'center',
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
  scoreList: {
    width: '100%',
    marginBottom: 16,
  },
  playerRow: {
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
  winnerRow: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(26, 66, 48, 0.9)',
  },
  eliminatedRow: {
    opacity: 0.5,
    borderColor: Colors.crimson,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  immunityBadge: {
    fontSize: 10,
    color: Colors.playableLime,
    fontWeight: '800',
    marginTop: 1,
  },
  eliminatedBadge: {
    fontSize: 10,
    color: Colors.crimsonLight,
    fontWeight: '800',
    marginTop: 1,
  },
  scoreDetails: {
    alignItems: 'flex-end',
  },
  roundScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.goldLight,
  },
  cumulativeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  nextBtn: {
    width: '100%',
  },
});
