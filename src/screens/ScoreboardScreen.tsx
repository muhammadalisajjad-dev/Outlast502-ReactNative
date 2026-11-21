import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ELIMINATION_THRESHOLD } from '../engine/elimination';
import { ChevronLeft, Shield, Skull, Crown, AlertCircle } from 'lucide-react-native';

interface ScoreboardScreenProps {
  onBack: () => void;
}

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({ onBack }) => {
  const { gameState } = useGame();

  if (!gameState) {
    return null;
  }

  const { players, roundResults } = gameState;

  // Sort players for standings: active players by score ascending, eliminated players last
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) {
      return a.isEliminated ? 1 : -1;
    }
    return a.cumulativeScore - b.cumulativeScore;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
          <ChevronLeft size={18} color={Colors.silverLight} style={{ marginRight: 2 }} />
          <Text style={styles.backBtnText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MATCH SCOREBOARD</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cumulative Standings Card */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>SURVIVAL STANDINGS</Text>
          <Text style={styles.sectionSubtitle}>
            Players reaching {ELIMINATION_THRESHOLD} points are eliminated. Round winners hold immunity.
          </Text>

          {sortedPlayers.map((p, idx) => {
            const progress = Math.min(p.cumulativeScore / ELIMINATION_THRESHOLD, 1);
            const isDanger = p.cumulativeScore >= 400;
            const isWarning = p.cumulativeScore >= 250 && !isDanger;

            return (
              <View
                key={p.id}
                style={[
                  styles.playerRow,
                  p.isEliminated && styles.eliminatedRow,
                  idx === 0 && !p.isEliminated && styles.leaderRow,
                ]}
              >
                <View style={styles.playerInfoRow}>
                  <View style={styles.nameBlock}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankBadgeText}>#{idx + 1}</Text>
                    </View>

                    <Text style={[styles.playerName, idx === 0 && !p.isEliminated && styles.leaderName]}>
                      {p.name} {p.isHuman ? '(You)' : ''}
                    </Text>

                    {p.immuneThisRound && (
                      <View style={styles.pillBadge}>
                        <Shield size={9} color={Colors.cobaltLight} style={{ marginRight: 3 }} />
                        <Text style={styles.immunityBadgeText}>IMMUNE</Text>
                      </View>
                    )}

                    {p.isEliminated && (
                      <View style={[styles.pillBadge, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                        <Skull size={9} color={Colors.crimsonLight} style={{ marginRight: 3 }} />
                        <Text style={styles.eliminatedBadgeText}>ELIMINATED</Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.scoreNumber,
                      isWarning && styles.scoreWarning,
                      isDanger && styles.scoreDanger,
                      p.isEliminated && styles.scoreEliminated,
                    ]}
                  >
                    {p.cumulativeScore} <Text style={styles.scoreMax}>/ 502</Text>
                  </Text>
                </View>

                {/* Progress Bar toward 502 */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progress * 100}%` },
                      isWarning && { backgroundColor: Colors.amberLight },
                      isDanger && { backgroundColor: Colors.crimsonLight },
                      p.isEliminated && { backgroundColor: Colors.crimson },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Round by Round History */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>ROUND-BY-ROUND BREAKDOWN</Text>
          <Text style={styles.sectionSubtitle}>
            Penalty points assessed to each participant at the conclusion of each round.
          </Text>

          {roundResults.length === 0 ? (
            <View style={styles.emptyRounds}>
              <Text style={styles.emptyRoundsText}>Round 1 is currently in progress.</Text>
            </View>
          ) : (
            roundResults.map(r => (
              <View key={r.roundNumber} style={styles.roundCard}>
                <View style={styles.roundCardHeader}>
                  <Text style={styles.roundCardTitle}>Round {r.roundNumber}</Text>
                  <View style={styles.roundWinnerPill}>
                    <Crown size={11} color={Colors.silverLight} style={{ marginRight: 4 }} />
                    <Text style={styles.roundWinnerText}>
                      {r.winnerName} won ({r.winReason === 'seven_of_hearts' ? '7♥ Instant' : 'Shed Hand'})
                    </Text>
                  </View>
                </View>

                <View style={styles.roundScoresGrid}>
                  {players.map(p => {
                    const score = r.playerRoundScores[p.id] ?? 0;
                    const isWinner = p.id === r.winnerId;
                    return (
                      <View key={p.id} style={styles.roundScoreCol}>
                        <Text style={styles.colPlayerName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text
                          style={[
                            styles.colScoreText,
                            isWinner && styles.colScoreWinner,
                          ]}
                        >
                          {isWinner && score === 0 ? '0' : `+${score}`}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {r.forcedPenaltyPlayerId && (
                  <View style={styles.forcedPenaltyBar}>
                    <AlertCircle size={10} color={Colors.crimsonLight} style={{ marginRight: 4 }} />
                    <Text style={styles.forcedPenaltySub}>
                      Final card forced penalty: {r.forcedPenaltyCards} cards drawn before scoring.
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.tableDeep,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(203, 213, 225, 0.12)',
    backgroundColor: 'rgba(8, 12, 20, 0.95)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    ...Typography.badge,
    color: Colors.silverLight,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    ...Typography.badge,
    color: Colors.silverLight,
    fontSize: 12,
    letterSpacing: 1.8,
  },
  container: {
    padding: 18,
    paddingBottom: 36,
  },
  cardSection: {
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.labelUpper,
    color: Colors.cobaltLight,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 14,
    lineHeight: 16,
  },
  playerRow: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leaderRow: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 6,
    padding: 8,
    paddingBottom: 8,
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  playerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 22,
    alignItems: 'flex-start',
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  playerName: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
  },
  leaderName: {
    color: Colors.silverLight,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 0.5,
    borderColor: Colors.borderSubtle,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  immunityBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.cobaltLight,
    letterSpacing: 0.4,
  },
  eliminatedBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.crimsonLight,
    letterSpacing: 0.4,
  },
  scoreNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scoreMax: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  scoreWarning: {
    color: Colors.amberLight,
  },
  scoreDanger: {
    color: Colors.crimsonLight,
  },
  scoreEliminated: {
    color: Colors.crimsonLight,
    textDecorationLine: 'line-through',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.cobaltLight,
    borderRadius: 2,
  },
  emptyRounds: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyRoundsText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  roundCard: {
    backgroundColor: 'rgba(8, 12, 20, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  roundCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 6,
  },
  roundCardTitle: {
    ...Typography.labelUpper,
    color: Colors.silverLight,
    fontSize: 10.5,
  },
  roundWinnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundWinnerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roundScoresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundScoreCol: {
    alignItems: 'center',
    flex: 1,
  },
  colPlayerName: {
    fontSize: 9.5,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  colScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.crimsonLight,
  },
  colScoreWinner: {
    color: Colors.cobaltLight,
  },
  forcedPenaltyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  forcedPenaltySub: {
    fontSize: 9,
    color: '#fca5a5',
  },
});
