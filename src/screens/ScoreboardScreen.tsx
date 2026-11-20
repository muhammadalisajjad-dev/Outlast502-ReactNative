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

interface ScoreboardScreenProps {
  onBack: () => void;
}

export const ScoreboardScreen: React.FC<ScoreboardScreenProps> = ({ onBack }) => {
  const { gameState } = useGame();

  if (!gameState) {
    return null;
  }

  const { players, roundResults } = gameState;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MATCH SCOREBOARD</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Cumulative Standings Card */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Current Standings (Limit: 502)</Text>
          <Text style={styles.sectionSubtitle}>
            Avoid crossing 502 points. Round winner is protected.
          </Text>

          {players.map((p, idx) => {
            const progress = Math.min(p.cumulativeScore / ELIMINATION_THRESHOLD, 1);
            const isDanger = p.cumulativeScore >= 400;

            return (
              <View
                key={p.id}
                style={[
                  styles.playerRow,
                  p.isEliminated && styles.eliminatedRow,
                ]}
              >
                <View style={styles.playerInfoRow}>
                  <View style={styles.nameBlock}>
                    <Text style={styles.playerName}>
                      #{idx + 1} {p.name} {p.isHuman ? '(You)' : ''}
                    </Text>
                    {p.immuneThisRound && (
                      <Text style={styles.immunityBadge}>🛡️ IMMUNE THIS ROUND</Text>
                    )}
                    {p.isEliminated && (
                      <Text style={styles.eliminatedBadge}>💀 ELIMINATED</Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.scoreNumber,
                      isDanger && styles.scoreDanger,
                      p.isEliminated && styles.scoreEliminated,
                    ]}
                  >
                    {p.cumulativeScore} / 502
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progress * 100}%` },
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
          <Text style={styles.sectionTitle}>Round History</Text>
          {roundResults.length === 0 ? (
            <Text style={styles.emptyText}>No rounds completed yet.</Text>
          ) : (
            roundResults.map(result => (
              <View key={result.roundNumber} style={styles.roundCard}>
                <View style={styles.roundCardHeader}>
                  <Text style={styles.roundNumberText}>
                    Round {result.roundNumber}
                  </Text>
                  <Text style={styles.winnerTag}>
                    Winner: {result.winnerName} (
                    {result.winReason === 'seven_of_hearts' ? '7♥' : '0 cards'})
                  </Text>
                </View>

                <View style={styles.roundScoresRow}>
                  {players.map(p => {
                    const score = result.playerRoundScores[p.id] ?? 0;
                    return (
                      <View key={p.id} style={styles.miniScoreBox}>
                        <Text style={styles.miniName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.miniScore}>+{score}</Text>
                      </View>
                    );
                  })}
                </View>
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
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
  },
  backBtnText: {
    color: Colors.goldLight,
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  cardSection: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontSize: 16,
    color: Colors.goldLight,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  playerRow: {
    marginBottom: 12,
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  playerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameBlock: {
    flexDirection: 'column',
  },
  playerName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  immunityBadge: {
    fontSize: 9,
    color: Colors.playableLime,
    fontWeight: '800',
  },
  eliminatedBadge: {
    fontSize: 9,
    color: Colors.crimsonLight,
    fontWeight: '800',
  },
  scoreNumber: {
    ...Typography.bodyMedium,
    color: Colors.goldLight,
    fontWeight: '800',
  },
  scoreDanger: {
    color: Colors.crimsonLight,
  },
  scoreEliminated: {
    color: Colors.crimson,
    textDecorationLine: 'line-through',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 6,
  },
  roundCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  roundCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roundNumberText: {
    fontWeight: '800',
    color: Colors.goldLight,
    fontSize: 12,
  },
  winnerTag: {
    fontSize: 11,
    color: Colors.playableLime,
    fontWeight: '600',
  },
  roundScoresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniScoreBox: {
    marginRight: 10,
    alignItems: 'center',
  },
  miniName: {
    fontSize: 10,
    color: Colors.textMuted,
    maxWidth: 55,
  },
  miniScore: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
