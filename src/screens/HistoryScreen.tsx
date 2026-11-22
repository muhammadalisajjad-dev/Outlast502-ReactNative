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
import { Crown, Cloud, HardDrive, RefreshCw, Trash2, Trophy, Calendar, Layers } from 'lucide-react-native';
import { Atmosphere, ScreenHeader, SectionHeading, Divider } from '../components/common/Chrome';

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
            const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
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
      <Atmosphere variant="screen" />
      <ScreenHeader title="Archive" onBack={onBack} />

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom + 28, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.pageKicker}>Match records</Text>
          <Text style={styles.pageTitle}>Archive</Text>
          <Text style={styles.pageSub}>Every champion and final debt, kept locally.</Text>

          <Divider style={styles.divider} />

          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              {cloudActive ? <Cloud size={14} color={Colors.tealLight} /> : <HardDrive size={14} color={Colors.textSecondary} />}
            </View>
            <View style={styles.statusTextBlock}>
              <Text style={styles.statusTitle}>
                {cloudActive ? 'Cloud ledger active' : 'Local ledger active'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {cloudActive
                  ? 'Firestore records retrieved'
                  : isFirebaseConfigured()
                  ? 'Firebase configured · no cloud records yet'
                  : 'Stored on this device'}
              </Text>
            </View>
            <TouchableOpacity onPress={loadHistory} style={styles.refreshBtn} activeOpacity={0.7} accessibilityLabel="Refresh history">
              <RefreshCw size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.accent} style={{ marginTop: 44 }} />
          ) : matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Trophy size={26} color={Colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No matches recorded</Text>
              <Text style={styles.emptySubtitle}>
                Complete a match to record champion standings and final totals.
              </Text>
            </View>
          ) : (
            <>
              <SectionHeading index="01" title="Recorded matches" subtitle={`${matches.length} ${matches.length === 1 ? 'entry' : 'entries'} in the book.`} />

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
                      <Text style={styles.roundsText}>{m.totalRounds} rounds</Text>
                      <View style={styles.syncBadge}>
                        {m.syncedToFirebase ? <Cloud size={9} color={Colors.tealLight} style={{ marginRight: 3 }} /> : <HardDrive size={9} color={Colors.textMuted} style={{ marginRight: 3 }} />}
                        <Text style={[styles.syncText, m.syncedToFirebase && styles.syncTextCloud]}>
                          {m.syncedToFirebase ? 'Cloud' : 'Local'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.championRow}>
                      <Crown size={12} color={Colors.accentSoft} style={{ marginRight: 6 }} />
                      <Text style={styles.championName}>{m.winnerName}</Text>
                      <Text style={styles.championLabel}>Champion</Text>
                    </View>

                    <View style={styles.playerScoresRow}>
                      {m.players.map((ps, idx) => (
                        <View key={ps.playerId || idx} style={styles.playerScoreCol}>
                          <Text style={styles.chipPlayerName} numberOfLines={1}>
                            {ps.name}
                          </Text>
                          <Text style={[styles.chipScoreText, ps.isWinner && styles.chipScoreWinner]}>
                            {ps.finalScore}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
                <Trash2 size={12} color={Colors.danger} style={{ marginRight: 6 }} />
                <Text style={styles.clearBtnText}>Clear local history</Text>
              </TouchableOpacity>
            </>
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
  pageSub: { ...Typography.bodyMedium, color: Colors.textSecondary, fontSize: 13.5, lineHeight: 20, marginTop: 4, maxWidth: 420 },
  divider: { marginTop: 18, marginBottom: 20 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
    marginBottom: 16,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: Colors.paperFaint,
  },
  statusTextBlock: { flex: 1, marginRight: 10 },
  statusTitle: { ...Typography.bodySmall, color: Colors.textPrimary, fontSize: 12, fontWeight: '600' },
  statusSubtitle: { ...Typography.bodySmall, color: Colors.textMuted, fontSize: 11, lineHeight: 15, marginTop: 2 },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.paperFaint,
  },
  emptyContainer: { paddingVertical: 52, alignItems: 'center' },
  emptyTitle: { ...Typography.bodyMedium, color: Colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  emptySubtitle: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', maxWidth: 280, lineHeight: 17 },
  matchEntry: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.line },
  matchMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 4 },
  dateText: { ...Typography.micro, color: Colors.textMuted, fontSize: 7.5, letterSpacing: 0.8 },
  metaDot: { color: Colors.textMuted, marginHorizontal: 4, fontSize: 8 },
  roundsText: { ...Typography.micro, color: Colors.textMuted, fontSize: 7.5, letterSpacing: 0.8 },
  syncBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  syncText: { ...Typography.micro, fontSize: 7, letterSpacing: 0.8, color: Colors.textMuted },
  syncTextCloud: { color: Colors.tealLight },
  championRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9, gap: 6 },
  championName: { ...Typography.titleSmall, color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  championLabel: { ...Typography.micro, color: Colors.textMuted, fontSize: 7, letterSpacing: 1, marginLeft: 2 },
  playerScoresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  playerScoreCol: { minWidth: 60 },
  chipPlayerName: { ...Typography.micro, color: Colors.textMuted, fontSize: 7, letterSpacing: 0.6, marginBottom: 1 },
  chipScoreText: { fontFamily: Typography.numeral.fontFamily, fontSize: 15, color: Colors.textSecondary },
  chipScoreWinner: { color: Colors.accentSoft },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dangerMuted,
    paddingVertical: 10,
    marginTop: 18,
    borderRadius: 10,
  },
  clearBtnText: { ...Typography.micro, color: Colors.danger, fontSize: 8, letterSpacing: 1.2 },
});
