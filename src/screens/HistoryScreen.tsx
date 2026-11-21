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
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { triggerHaptic } from '../utils/haptics';
import {
  Crown,
  Cloud,
  HardDrive,
  RefreshCw,
  Trash2,
  Trophy,
  Calendar,
  Layers,
} from 'lucide-react-native';
import {
  DecoBackdrop,
  ClubHeader,
  LedgerSection,
  OrnamentDivider,
  BrassDiamond,
} from '../components/common/Deco';

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
        try {
          const cloud = await Promise.race([
            fetchFirebaseHistory(),
            new Promise<MatchRecord[]>(resolve => setTimeout(() => resolve([]), 1500)),
          ]);
          if (cloud.length > 0) {
            setCloudActive(true);
            const map = new Map<string, MatchRecord>();
            local.forEach(m => map.set(m.id, m));
            cloud.forEach(m => map.set(m.id, { ...m, syncedToFirebase: true }));
            const merged = Array.from(map.values()).sort(
              (a, b) => b.timestamp - a.timestamp
            );
            setMatches(merged);
          } else {
            setCloudActive(false);
          }
        } catch (cloudErr) {
          console.warn('Cloud sync fetch skipped:', cloudErr);
          setCloudActive(false);
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
      <DecoBackdrop variant="screen" />
      <ClubHeader title="MATCH HISTORY" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>THE ARCHIVE · RECORDS</Text>
          <Text style={styles.pageTitle}>Match History</Text>
          <Text style={styles.pageSub}>
            Every champion, every debt, kept in the club ledger.
          </Text>

          <OrnamentDivider style={styles.divider} />

          {/* Persistence status, set as a quiet club notice */}
          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              {cloudActive ? (
                <Cloud size={13} color={Colors.brassLight} />
              ) : (
                <HardDrive size={13} color={Colors.textSecondary} />
              )}
            </View>
            <View style={styles.statusTextBlock}>
              <Text style={styles.statusTitle}>
                {cloudActive ? 'CLOUD LEDGER ACTIVE' : 'LOCAL LEDGER ACTIVE'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {cloudActive
                  ? 'Firestore records retrieved · anonymous auth, user-scoped rules'
                  : isFirebaseConfigured()
                  ? 'Firebase configured · no cloud records yet, play a full match to sync'
                  : 'AsyncStorage local storage · offline resilient'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={loadHistory}
              style={styles.refreshBtn}
              activeOpacity={0.7}
              accessibilityLabel="Refresh history"
            >
              <RefreshCw size={13} color={Colors.brassLight} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={Colors.brassLight}
              style={{ marginTop: 44 }}
            />
          ) : matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Trophy size={24} color={Colors.brassLight} />
              </View>
              <Text style={styles.emptyTitle}>NO MATCHES RECORDED</Text>
              <Text style={styles.emptySubtitle}>
                Complete a match to record champion standings, final point totals, and cloud sync logs.
              </Text>
            </View>
          ) : (
            <LedgerSection
              first
              numeral="I"
              title="RECORDED MATCHES"
              subtitle={`${matches.length} ${matches.length === 1 ? 'entry' : 'entries'} in the book.`}
            >
              {matches.map(m => {
                const dateStr = new Date(m.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <View key={m.id} style={styles.matchEntry}>
                    <View style={styles.matchMetaRow}>
                      <Calendar size={9} color={Colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.dateText}>{dateStr}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Layers size={9} color={Colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.roundsText}>{m.totalRounds} ROUNDS</Text>
                      <View style={styles.syncBadge}>
                        {m.syncedToFirebase ? (
                          <Cloud size={9} color={Colors.brassLight} style={{ marginRight: 3 }} />
                        ) : (
                          <HardDrive size={9} color={Colors.textMuted} style={{ marginRight: 3 }} />
                        )}
                        <Text
                          style={[
                            styles.syncText,
                            m.syncedToFirebase && styles.syncTextCloud,
                          ]}
                        >
                          {m.syncedToFirebase ? 'CLOUD' : 'LOCAL'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.championRow}>
                      <Crown size={12} color={Colors.brassLight} style={{ marginRight: 6 }} />
                      <Text style={styles.championName}>{m.winnerName}</Text>
                      <BrassDiamond size={3.5} style={{ marginHorizontal: 7 }} />
                      <Text style={styles.championLabel}>CHAMPION</Text>
                    </View>

                    <View style={styles.playerScoresRow}>
                      {m.players.map((ps, idx) => (
                        <View key={ps.playerId || idx} style={styles.playerScoreCol}>
                          <Text style={styles.chipPlayerName} numberOfLines={1}>
                            {ps.name}
                          </Text>
                          <Text
                            style={[
                              styles.chipScoreText,
                              ps.isWinner && styles.chipScoreWinner,
                            ]}
                          >
                            {ps.finalScore}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Trash2 size={12} color={Colors.crimsonLight} style={{ marginRight: 6 }} />
                <Text style={styles.clearBtnText}>CLEAR LOCAL HISTORY</Text>
              </TouchableOpacity>
            </LedgerSection>
          )}
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
  },
  divider: {
    marginTop: 16,
    marginBottom: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.16)',
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0.7,
    borderColor: 'rgba(198, 164, 96, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTextBlock: {
    flex: 1,
    marginRight: 10,
  },
  statusTitle: {
    ...Typography.labelUpper,
    color: Colors.brassLight,
    fontSize: 8,
    letterSpacing: 1.6,
  },
  statusSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  refreshBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.7,
    borderColor: 'rgba(198, 164, 96, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 52,
    alignItems: 'center',
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 0.8,
    borderColor: 'rgba(198, 164, 96, 0.4)',
    backgroundColor: 'rgba(198, 164, 96, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    ...Typography.labelUpper,
    color: Colors.ivory,
    fontSize: 9.5,
    letterSpacing: 2,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 17,
  },
  matchEntry: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.13)',
  },
  matchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.6,
    letterSpacing: 0.9,
  },
  metaDot: {
    color: Colors.textMuted,
    marginHorizontal: 6,
    fontSize: 8,
  },
  roundsText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.6,
    letterSpacing: 0.9,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  syncText: {
    ...Typography.micro,
    fontSize: 6.2,
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  syncTextCloud: {
    color: Colors.brassLight,
  },
  championRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  championName: {
    ...Typography.serifSubheading,
    color: Colors.brassLight,
    fontSize: 18,
  },
  championLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.2,
    letterSpacing: 1.2,
  },
  playerScoresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerScoreCol: {
    minWidth: 64,
    marginRight: 14,
    marginBottom: 4,
  },
  chipPlayerName: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.2,
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  chipScoreText: {
    fontFamily: Typography.numeral.fontFamily,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  chipScoreWinner: {
    color: Colors.brassLight,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.7,
    borderColor: 'rgba(166, 61, 73, 0.45)',
    paddingVertical: 10,
    marginTop: 18,
    borderRadius: 2,
  },
  clearBtnText: {
    ...Typography.micro,
    color: Colors.crimsonLight,
    fontSize: 7.5,
    letterSpacing: 1.5,
  },
});
