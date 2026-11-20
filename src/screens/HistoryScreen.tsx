import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MatchRecord } from '../types/history';
import { getMatchHistory, clearMatchHistory } from '../services/storage';
import { fetchFirebaseHistory, isFirebaseConfigured } from '../services/firebase';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { triggerHaptic } from '../utils/haptics';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudActive, setCloudActive] = useState<boolean>(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const local = await getMatchHistory();
      setMatches(local);

      if (isFirebaseConfigured()) {
        setCloudActive(true);
        const cloud = await fetchFirebaseHistory();
        if (cloud.length > 0) {
          // Merge unique matches by id
          const map = new Map<string, MatchRecord>();
          local.forEach(m => map.set(m.id, m));
          cloud.forEach(m => map.set(m.id, { ...m, syncedToFirebase: true }));
          const merged = Array.from(map.values()).sort(
            (a, b) => b.timestamp - a.timestamp
          );
          setMatches(merged);
        }
      }
    } catch (e) {
      console.warn('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    triggerHaptic('warning');
    await clearMatchHistory();
    setMatches([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MATCH HISTORY</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Status Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusTitle}>Persistence Engine</Text>
            <Text style={styles.statusSubtitle}>
              {cloudActive
                ? '🟢 Firebase Firestore Cloud Active & Local Cache'
                : '🟡 Local Storage Active (Offline Mode Resilient)'}
            </Text>
          </View>
          <TouchableOpacity onPress={loadHistory} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.gold} style={{ marginTop: 40 }} />
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No Matches Logged Yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete a match to record final scores, player ranks, and cloud logs.
            </Text>
          </View>
        ) : (
          <>
            {matches.map(match => {
              const dateStr = new Date(match.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={match.id} style={styles.matchCard}>
                  <View style={styles.matchHeader}>
                    <View>
                      <Text style={styles.matchDate}>{dateStr}</Text>
                      <Text style={styles.matchRounds}>
                        {match.totalRounds} Rounds Played • {match.playerCount} Players
                      </Text>
                    </View>
                    <View style={styles.winnerBadge}>
                      <Text style={styles.winnerText}>👑 {match.winnerName}</Text>
                    </View>
                  </View>

                  {/* Player Scores */}
                  <View style={styles.playerList}>
                    {match.players.map(p => (
                      <View key={p.playerId} style={styles.playerScoreRow}>
                        <Text style={styles.playerName}>
                          {p.isWinner ? '🥇 ' : p.isEliminated ? '💀 ' : '🥈 '}
                          {p.name} {p.isHuman ? '(You)' : ''}
                        </Text>
                        <Text style={styles.playerScore}>
                          {p.finalScore} pts
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            <Button
              title="Clear Local History"
              variant="outline"
              size="small"
              onPress={handleClear}
              style={styles.clearBtn}
            />
          </>
        )}
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
  statusCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusLeft: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.bodySmall,
    color: Colors.goldLight,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
  },
  refreshBtnText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  matchCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchDate: {
    fontSize: 13,
    color: Colors.goldLight,
    fontWeight: '700',
  },
  matchRounds: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  winnerBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: Colors.gold,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  winnerText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.goldLight,
  },
  playerList: {
    marginTop: 2,
  },
  playerScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  playerName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  playerScore: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  clearBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
});
