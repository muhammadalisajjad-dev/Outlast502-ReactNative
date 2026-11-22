import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { useGame } from '../context/GameContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ELIMINATION_THRESHOLD } from '../engine/elimination';
import { Shield, Skull, Crown, AlertCircle } from 'lucide-react-native';
import { Atmosphere, ScreenHeader, SectionHeading, Divider } from '../components/common/Chrome';

interface ScoreboardScreenProps {
  onBack: () => void;
}

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({ onBack }) => {
  const { gameState } = useGame();
  const insets = useResponsiveInsets();

  if (!gameState) return null;

  const { players, roundResults } = gameState;

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) return a.isEliminated ? 1 : -1;
    return a.cumulativeScore - b.cumulativeScore;
  });

  return (
    <View style={styles.safeArea}>
      <Atmosphere variant="screen" />
      <ScreenHeader title="Standings" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + 28, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>Survival ledger</Text>
          <Text style={styles.pageTitle}>Match standings</Text>
          <Text style={styles.pageSub}>
            Points are a debt. At {ELIMINATION_THRESHOLD}, you are out.
          </Text>

          <Divider style={styles.divider} />

          <SectionHeading index="01" title="Survival" subtitle="Lowest score leads. Round winners are immune for the round they win." />

          {sortedPlayers.map((p, idx) => {
            const progress = Math.min(p.cumulativeScore / ELIMINATION_THRESHOLD, 1);
            const isDanger = p.cumulativeScore >= 400;
            const isWarning = p.cumulativeScore >= 250 && !isDanger;
            const isLeader = idx === 0 && !p.isEliminated;

            return (
              <View
                key={p.id}
                style={[styles.playerRow, isLeader && styles.leaderRow, p.isEliminated && styles.eliminatedRow]}
              >
                <View style={styles.playerTopLine}>
                  <Text style={[styles.rank, isLeader && styles.rankLeader]}>{String(idx + 1).padStart(2, '0')}</Text>

                  <View style={styles.playerIdentity}>
                    <View style={styles.nameLine}>
                      <Text style={[styles.playerName, isLeader && styles.leaderName, p.isEliminated && styles.eliminatedName]}>
                        {p.name}
                        {p.isHuman && p.name.trim().toLowerCase() !== 'you' ? ' · You' : ''}
                      </Text>
                      {isLeader && <View style={styles.leaderDot} />}
                      {p.immuneThisRound && <Shield size={10} color={Colors.tealLight} style={styles.metaIcon} />}
                      {p.isEliminated && <Skull size={10} color={Colors.danger} style={styles.metaIcon} />}
                    </View>
                    <Text style={styles.playerMeta}>
                      {p.isEliminated
                        ? 'Eliminated'
                        : p.immuneThisRound
                        ? 'Immune this round'
                        : isDanger
                        ? 'Danger · near the limit'
                        : isWarning
                        ? 'Caution · past midpoint'
                        : 'In the match'}
                    </Text>
                  </View>

                  <Text style={[styles.scoreNumber, isWarning && styles.scoreWarning, isDanger && styles.scoreDanger, p.isEliminated && styles.scoreEliminated]}>
                    {p.cumulativeScore}
                    <Text style={styles.scoreMax}> / {ELIMINATION_THRESHOLD}</Text>
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progress * 100}%` },
                      isWarning && { backgroundColor: Colors.warning },
                      isDanger && { backgroundColor: Colors.danger },
                      p.isEliminated && { backgroundColor: Colors.dangerDeep },
                    ]}
                  />
                </View>
              </View>
            );
          })}

          <SectionHeading index="02" title="Round by round" subtitle="The debt assessed at the close of each hand." style={styles.sectionSpacing} />

          {roundResults.length === 0 ? (
            <View style={styles.emptyRounds}>
              <Text style={styles.emptyRoundsText}>The first hand is still in play.</Text>
            </View>
          ) : (
            roundResults.map(r => (
              <View key={r.roundNumber} style={styles.roundCard}>
                <View style={styles.roundCardHeader}>
                  <Text style={styles.roundCardTitle}>Round {r.roundNumber}</Text>
                  <View style={styles.roundWinnerPill}>
                    <Crown size={10} color={Colors.accentSoft} style={{ marginRight: 4 }} />
                    <Text style={styles.roundWinnerText}>
                      {r.winnerName} · {r.winReason === 'seven_of_hearts' ? 'Seven of hearts' : 'Shed hand'}
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
                        <Text style={[styles.colScoreText, isWinner && styles.colScoreWinner]}>
                          {isWinner && score === 0 ? '0' : `+${score}`}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {r.forcedPenaltyPlayerId && (
                  <View style={styles.forcedPenaltyBar}>
                    <AlertCircle size={9} color={Colors.danger} style={{ marginRight: 5 }} />
                    <Text style={styles.forcedPenaltySub}>
                      Final card forced {r.forcedPenaltyCards} cards before scoring
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.ink },
  container: { paddingHorizontal: 20, paddingTop: 18 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  pageKicker: { ...Typography.micro, color: Colors.textMuted, fontSize: 8, letterSpacing: 1.6, marginBottom: 4 },
  pageTitle: { ...Typography.titleLarge, color: Colors.textPrimary, fontSize: 28, letterSpacing: -0.8 },
  pageSub: { ...Typography.bodyMedium, color: Colors.textSecondary, fontSize: 13.5, lineHeight: 20, marginTop: 4, maxWidth: 440 },
  divider: { marginTop: 18, marginBottom: 20 },
  sectionSpacing: { marginTop: 24 },
  playerRow: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  leaderRow: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  eliminatedRow: { opacity: 0.5 },
  playerTopLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  rank: {
    fontFamily: Typography.cardRank.fontFamily,
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    width: 26,
  },
  rankLeader: { color: Colors.accent },
  playerIdentity: { flex: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playerName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  leaderName: { color: Colors.accentSoft },
  eliminatedName: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  leaderDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent },
  metaIcon: { marginLeft: 4 },
  playerMeta: { ...Typography.micro, color: Colors.textMuted, fontSize: 7, letterSpacing: 1, marginTop: 2 },
  scoreNumber: {
    fontFamily: Typography.numeral.fontFamily,
    fontSize: 20,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  scoreMax: { fontFamily: Typography.bodySmall.fontFamily, fontSize: 9, color: Colors.textMuted, letterSpacing: 0.4 },
  scoreWarning: { color: Colors.warning },
  scoreDanger: { color: Colors.danger },
  scoreEliminated: { color: Colors.danger, textDecorationLine: 'line-through' },
  progressTrack: { height: 2, backgroundColor: Colors.line, marginLeft: 26, overflow: 'hidden', borderRadius: 1 },
  progressBar: { height: '100%', backgroundColor: Colors.accent, borderRadius: 1 },
  emptyRounds: { paddingVertical: 18, alignItems: 'center' },
  emptyRoundsText: { ...Typography.micro, color: Colors.textMuted, fontSize: 8, letterSpacing: 1.4 },
  roundCard: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.line },
  roundCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  roundCardTitle: { ...Typography.bodySmall, color: Colors.textPrimary, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  roundWinnerPill: { flexDirection: 'row', alignItems: 'center' },
  roundWinnerText: { ...Typography.micro, color: Colors.textSecondary, fontSize: 7.5, letterSpacing: 0.8 },
  roundScoresGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  roundScoreCol: { alignItems: 'center', flex: 1 },
  colPlayerName: { ...Typography.micro, color: Colors.textMuted, fontSize: 7, letterSpacing: 0.6, marginBottom: 3 },
  colScoreText: { fontFamily: Typography.numeral.fontFamily, fontSize: 14, color: Colors.danger },
  colScoreWinner: { color: Colors.accent },
  forcedPenaltyBar: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.line },
  forcedPenaltySub: { ...Typography.micro, color: Colors.danger, fontSize: 7, letterSpacing: 1 },
});
