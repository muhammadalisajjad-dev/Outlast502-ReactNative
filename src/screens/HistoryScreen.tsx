import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { MatchRecord } from '../types/history';
import { getMatchHistory, clearMatchHistory } from '../services/storage';
import { fetchFirebaseHistory, isFirebaseConfigured } from '../services/firebase';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { triggerHaptic } from '../utils/haptics';
import {
  ChevronLeft,
  Crown,
  Cloud,
  HardDrive,
  RefreshCw,
  Trash2,
  Trophy,
  Calendar,
  Layers,
} from 'lucide-react-native';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudActive, setCloudActive] = useState<boolean>(false);
  const insets = useResponsiveInsets();

  const loadHistory = async () => {
    try {
      const local = await getMatchHistory();
      setMatches(local);
      setLoading(false);

      if (isFirebaseConfigured()) {
        setCloudActive(true);
        try {
          const cloud = await Promise.race([
            fetchFirebaseHistory(),
            new Promise<MatchRecord[]>(resolve => setTimeout(() => resolve([]), 1500)),
          ]);
          if (cloud.length > 0) {
            const map = new Map<string, MatchRecord>();
            local.forEach(m => map.set(m.id, m));
            cloud.forEach(m => map.set(m.id, { ...m, syncedToFirebase: true }));
            const merged = Array.from(map.values()).sort(
              (a, b) => b.timestamp - a.timestamp
            );
            setMatches(merged);
          }
        } catch (cloudErr) {
          console.warn('Cloud sync fetch skipped:', cloudErr);
        }
      }
    } catch (e) {
      console.warn('Error fetching history:', e);
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
    <View style={styles.safeArea}>
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
          <ChevronLeft size={18} color={Colors.silverLight} style={{ marginRight: 2 }} />
          <Text style={styles.backBtnText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MATCH HISTORY</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom + 24, 36) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={styles.statusTitleRow}>
              {cloudActive ? (
                <Cloud size={14} color={Colors.cobaltLight} style={{ marginRight: 6 }} />
              ) : (
                <HardDrive size={14} color={Colors.silver} style={{ marginRight: 6 }} />
              )}
              <Text style={styles.statusTitle}>
                {cloudActive ? 'CLOUD PERSISTENCE ACTIVE' : 'LOCAL PERSISTENCE ENGINE'}
              </Text>
            </View>
            <Text style={styles.statusSubtitle}>
              {cloudActive
                ? 'Firestore Cloud sync verified & local offline cache active'
                : 'AsyncStorage local storage active (offline resilient)'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={loadHistory}
            style={styles.refreshBtn}
            activeOpacity={0.75}
          >
            <RefreshCw size={14} color={Colors.silverLight} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.cobaltLight} style={{ marginTop: 40 }} />
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Trophy size={28} color={Colors.silverLight} />
            </View>
            <Text style={styles.emptyTitle}>NO MATCHES RECORDED</Text>
            <Text style={styles.emptySubtitle}>
              Complete a match to record champion standings, final point totals, and cloud sync logs.
            </Text>
          </View>
        ) : (
          <>
            {matches.map(m => {
              const dateStr = new Date(m.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <View key={m.id} style={styles.matchCard}>
                  <View style={styles.matchCardHeader}>
                    <View style={styles.matchMetaRow}>
                      <Calendar size={11} color={Colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.dateText}>{dateStr}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Layers size={11} color={Colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.roundsText}>{m.totalRounds} Rounds</Text>
                    </View>

                    <View style={styles.syncBadge}>
                      {m.syncedToFirebase ? (
                        <Cloud size={10} color={Colors.cobaltLight} style={{ marginRight: 4 }} />
                      ) : (
                        <HardDrive size={10} color={Colors.textMuted} style={{ marginRight: 4 }} />
                      )}
                      <Text
                        style={[
                          styles.syncText,
                          m.syncedToFirebase && styles.syncTextCloud,
                        ]}
                      >
                        {m.syncedToFirebase ? 'Cloud' : 'Local'}
                      </Text>
                    </View>
                  </View>

                  {/* Champion Banner */}
                  <View style={styles.championBox}>
                    <Crown size={14} color={Colors.silverLight} style={{ marginRight: 6 }} />
                    <Text style={styles.championName}>
                      Champion: {m.winnerName}
                    </Text>
                  </View>

                  {/* Final Player Scores */}
                  <View style={styles.playerScoresRow}>
                    {m.players.map((ps, idx) => {
                      return (
                        <View key={ps.playerId || idx} style={styles.playerScoreChip}>
                          <Text style={styles.chipPlayerName} numberOfLines={1}>
                            {ps.name}
                          </Text>
                          <Text
                            style={[
                              styles.chipScoreText,
                              ps.isWinner && styles.chipScoreWinner,
                            ]}
                          >
                            {ps.finalScore}p
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearBtn}
              activeOpacity={0.75}
            >
              <Trash2 size={13} color={Colors.crimsonLight} style={{ marginRight: 6 }} />
              <Text style={styles.clearBtnText}>CLEAR LOCAL HISTORY</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  statusLeft: {
    flex: 1,
    marginRight: 12,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  statusTitle: {
    ...Typography.labelUpper,
    color: Colors.cobaltLight,
    fontSize: 10,
    letterSpacing: 1,
  },
  statusSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    ...Typography.labelUpper,
    color: Colors.silverLight,
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 17,
  },
  matchCard: {
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10.5,
  },
  metaDot: {
    color: Colors.textMuted,
    marginHorizontal: 6,
    fontSize: 10,
  },
  roundsText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10.5,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  syncText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  syncTextCloud: {
    color: Colors.cobaltLight,
  },
  championBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  championName: {
    ...Typography.bodySmall,
    color: Colors.silverLight,
    fontWeight: '800',
    fontSize: 12.5,
  },
  playerScoresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerScoreChip: {
    backgroundColor: 'rgba(8, 12, 20, 0.85)',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  chipPlayerName: {
    fontSize: 9.5,
    color: Colors.textMuted,
    marginBottom: 1,
  },
  chipScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipScoreWinner: {
    color: Colors.cobaltLight,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(185, 28, 28, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 11,
    marginTop: 8,
  },
  clearBtnText: {
    ...Typography.badge,
    color: Colors.crimsonLight,
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
});
