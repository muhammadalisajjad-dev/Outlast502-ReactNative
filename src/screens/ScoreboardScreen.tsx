import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { useGame } from '../context/GameContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ELIMINATION_THRESHOLD } from '../engine/elimination';
import { Shield, Skull, Crown, AlertCircle } from 'lucide-react-native';
import {
  DecoBackdrop,
  ClubHeader,
  LedgerSection,
  OrnamentDivider,
  BrassDiamond,
} from '../components/common/Deco';

interface ScoreboardScreenProps {
  onBack: () => void;
}

const toRoman = (value: number): string => {
  const numerals: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remaining = Math.max(1, Math.floor(value));
  let result = '';
  numerals.forEach(([amount, numeral]) => {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  });
  return result;
};

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({ onBack }) => {
  const { gameState } = useGame();
  const insets = useResponsiveInsets();

  if (!gameState) {
    return null;
  }

  const { players, roundResults } = gameState;

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) {
      return a.isEliminated ? 1 : -1;
    }
    return a.cumulativeScore - b.cumulativeScore;
  });

  return (
    <View style={styles.safeArea}>
      <DecoBackdrop variant="screen" />
      <ClubHeader title="MATCH SCOREBOARD" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>THE LEDGER · SURVIVAL</Text>
          <Text style={styles.pageTitle}>Standings</Text>
          <Text style={styles.pageSub}>
            Points are a debt. At {ELIMINATION_THRESHOLD}, the house asks you to leave.
          </Text>

          <OrnamentDivider style={styles.divider} />

          <LedgerSection
            first
            numeral="I"
            title="SURVIVAL STANDINGS"
            subtitle="Lowest score leads. Round winners hold immunity for the round they win."
          >
            {sortedPlayers.map((p, idx) => {
              const progress = Math.min(p.cumulativeScore / ELIMINATION_THRESHOLD, 1);
              const isDanger = p.cumulativeScore >= 400;
              const isWarning = p.cumulativeScore >= 250 && !isDanger;
              const isLeader = idx === 0 && !p.isEliminated;

              return (
                <View
                  key={p.id}
                  style={[
                    styles.playerRow,
                    isLeader && styles.leaderRow,
                    p.isEliminated && styles.eliminatedRow,
                  ]}
                >
                  <View style={styles.playerTopLine}>
                    <Text style={[styles.rank, isLeader && styles.rankLeader]}>
                      {toRoman(idx + 1)}
                    </Text>

                    <View style={styles.playerIdentity}>
                      <View style={styles.nameLine}>
                        <Text
                          style={[
                            styles.playerName,
                            isLeader && styles.leaderName,
                            p.isEliminated && styles.eliminatedName,
                          ]}
                        >
                          {p.name}
                          {p.isHuman && p.name.trim().toLowerCase() !== 'you'
                            ? ' · YOU'
                            : ''}
                        </Text>
                        {isLeader && <BrassDiamond size={4} filled style={{ marginLeft: 6 }} />}
                        {p.immuneThisRound && (
                          <Shield
                            size={9}
                            color={Colors.brassLight}
                            style={{ marginLeft: 6 }}
                          />
                        )}
                        {p.isEliminated && (
                          <Skull
                            size={9}
                            color={Colors.crimsonLight}
                            style={{ marginLeft: 6 }}
                          />
                        )}
                      </View>
                      <Text style={styles.playerMeta}>
                        {p.isEliminated
                          ? 'ELIMINATED'
                          : p.immuneThisRound
                          ? 'IMMUNE THIS ROUND'
                          : isDanger
                          ? 'DANGER · NEAR THE LIMIT'
                          : isWarning
                          ? 'CAUTION · PAST MIDPOINT'
                          : 'IN THE MATCH'}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.scoreNumber,
                        isWarning && styles.scoreWarning,
                        isDanger && styles.scoreDanger,
                        p.isEliminated && styles.scoreEliminated,
                      ]}
                    >
                      {p.cumulativeScore}
                      <Text style={styles.scoreMax}> / {ELIMINATION_THRESHOLD}</Text>
                    </Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${progress * 100}%` },
                        isWarning && { backgroundColor: Colors.amberLight },
                        isDanger && { backgroundColor: Colors.crimsonLight },
                        p.isEliminated && { backgroundColor: Colors.burgundyLight },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </LedgerSection>

          <LedgerSection
            numeral="II"
            title="ROUND-BY-ROUND"
            subtitle="The debt assessed at the close of each hand."
          >
            {roundResults.length === 0 ? (
              <View style={styles.emptyRounds}>
                <BrassDiamond size={5} />
                <Text style={styles.emptyRoundsText}>THE FIRST HAND IS STILL IN PLAY</Text>
              </View>
            ) : (
              roundResults.map(r => (
                <View key={r.roundNumber} style={styles.roundCard}>
                  <View style={styles.roundCardHeader}>
                    <Text style={styles.roundCardTitle}>ROUND {toRoman(r.roundNumber)}</Text>
                    <View style={styles.roundWinnerPill}>
                      <Crown size={10} color={Colors.brassLight} style={{ marginRight: 4 }} />
                      <Text style={styles.roundWinnerText}>
                        {r.winnerName} · {r.winReason === 'seven_of_hearts' ? 'SEVEN OF HEARTS' : 'SHED HAND'}
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
                      <AlertCircle size={9} color={Colors.crimsonLight} style={{ marginRight: 5 }} />
                      <Text style={styles.forcedPenaltySub}>
                        FINAL CARD FORCED {r.forcedPenaltyCards} CARDS BEFORE SCORING
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </LedgerSection>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  content: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  pageKicker: {
    ...Typography.micro,
    color: Colors.brass,
    fontSize: 7.2,
    letterSpacing: 2.6,
  },
  pageTitle: {
    ...Typography.serifDisplay,
    color: Colors.ivory,
    fontSize: 32,
    marginTop: 4,
  },
  pageSub: {
    ...Typography.serifItalic,
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 420,
  },
  divider: {
    marginTop: 16,
    marginBottom: 18,
  },
  playerRow: {
    paddingVertical: 12,
    paddingLeft: 9,
    borderLeftWidth: 1.5,
    borderLeftColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.13)',
  },
  leaderRow: {
    borderLeftColor: Colors.brass,
    backgroundColor: 'rgba(198, 164, 96, 0.035)',
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  playerTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  rank: {
    ...Typography.serifBody,
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    width: 26,
  },
  rankLeader: {
    color: Colors.brassLight,
  },
  playerIdentity: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    ...Typography.serifSubheading,
    color: Colors.ivory,
    fontSize: 17,
  },
  leaderName: {
    color: Colors.brassLight,
  },
  eliminatedName: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  playerMeta: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.3,
    letterSpacing: 1.1,
    marginTop: 1,
  },
  scoreNumber: {
    fontFamily: Typography.numeral.fontFamily,
    fontSize: 22,
    color: Colors.ivory,
    lineHeight: 25,
  },
  scoreMax: {
    fontFamily: Typography.bodySmall.fontFamily,
    fontSize: 8.5,
    color: Colors.textMuted,
    letterSpacing: 0.4,
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
    height: 2,
    backgroundColor: 'rgba(198, 164, 96, 0.12)',
    marginLeft: 26,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.brass,
  },
  emptyRounds: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emptyRoundsText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.8,
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  roundCard: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.13)',
  },
  roundCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  roundCardTitle: {
    ...Typography.labelUpper,
    color: Colors.brassLight,
    fontSize: 8.5,
    letterSpacing: 1.8,
  },
  roundWinnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundWinnerText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 6.4,
    letterSpacing: 0.9,
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
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.2,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  colScoreText: {
    fontFamily: Typography.numeral.fontFamily,
    fontSize: 14,
    color: Colors.crimsonLight,
  },
  colScoreWinner: {
    color: Colors.brassLight,
  },
  forcedPenaltyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(198, 164, 96, 0.1)',
  },
  forcedPenaltySub: {
    ...Typography.micro,
    color: Colors.crimsonLight,
    fontSize: 6.2,
    letterSpacing: 1,
  },
});
