import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Player, RoundResult } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Crown, Zap, AlertTriangle, Shield, Skull } from 'lucide-react-native';

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
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popAnim.setValue(0);
      Animated.spring(popAnim, {
        toValue: 1,
        speed: 24,
        bounciness: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, popAnim]);

  if (!roundResult) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                {
                  scale: popAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                },
              ],
              opacity: popAnim,
            },
          ]}
        >
          <Text style={styles.title}>ROUND {roundResult.roundNumber} COMPLETE</Text>

          {/* Winner Banner */}
          <View style={styles.winnerBanner}>
            <View style={styles.winnerHeaderRow}>
              <Crown size={18} color={Colors.silverLight} style={{ marginRight: 6 }} />
              <Text style={styles.winnerTitle}>
                {roundResult.winnerName} Won
              </Text>
            </View>

            <View style={styles.winReasonRow}>
              <Zap size={12} color={Colors.cobaltLight} style={{ marginRight: 4 }} />
              <Text style={styles.winReason}>
                {roundResult.winReason === 'seven_of_hearts'
                  ? '7 of Hearts Instant Round Victory'
                  : 'Shed All Hand Cards'}
              </Text>
            </View>
          </View>

          {/* Forced Penalty Notice */}
          {roundResult.forcedPenaltyPlayerId && (
            <View style={styles.forcedPenaltyNotice}>
              <AlertTriangle size={13} color={Colors.crimsonLight} style={{ marginRight: 6 }} />
              <Text style={styles.forcedPenaltyText}>
                Final card was a penalty card! Next player drew {roundResult.forcedPenaltyCards} cards before round scoring.
              </Text>
            </View>
          )}

          <Text style={styles.sectionHeading}>ROUND SCORE BREAKDOWN</Text>

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
                    <Text style={[styles.playerName, isWinner && styles.winnerNameText]}>
                      {p.name} {p.isHuman ? '(You)' : ''}
                    </Text>

                    {p.immuneThisRound && (
                      <View style={styles.statusPill}>
                        <Shield size={9} color={Colors.goldLight} style={{ marginRight: 3 }} />
                        <Text style={styles.immunityBadge}>IMMUNE</Text>
                      </View>
                    )}

                    {isEliminated && (
                      <View style={[styles.statusPill, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                        <Skull size={9} color={Colors.crimsonLight} style={{ marginRight: 3 }} />
                        <Text style={styles.eliminatedBadge}>ELIMINATED</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.scoreDetails}>
                    <Text style={[styles.roundScoreText, isWinner && styles.winnerScoreText]}>
                      {isWinner && roundScore === 0 ? '0 pts' : `+${roundScore} pts`}
                    </Text>
                    <Text style={styles.cumulativeText}>
                      Total: {p.cumulativeScore} / 502
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <Button
            title="Start Next Round"
            variant="cobalt"
            size="medium"
            onPress={onNextRound}
            style={styles.actionBtn}
          />
        </Animated.View>
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
    maxWidth: 350,
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.borderSubtle,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    ...Typography.badge,
    color: Colors.silverLight,
    fontSize: 11,
    letterSpacing: 1.8,
    textAlign: 'center',
    marginBottom: 12,
  },
  winnerBanner: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  winnerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  winnerTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  winReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  winReason: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  forcedPenaltyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185, 28, 28, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  forcedPenaltyText: {
    ...Typography.bodySmall,
    color: '#fca5a5',
    fontSize: 10.5,
    flex: 1,
  },
  sectionHeading: {
    ...Typography.labelUpper,
    color: Colors.textMuted,
    fontSize: 9.5,
    marginBottom: 6,
  },
  scoreList: {
    maxHeight: 180,
    marginBottom: 14,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  winnerRow: {
    backgroundColor: 'rgba(203, 178, 106, 0.08)',
    borderRadius: 6,
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  winnerNameText: {
    color: Colors.goldLight,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    borderWidth: 0.5,
    borderColor: Colors.borderSubtle,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  immunityBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.goldLight,
    letterSpacing: 0.4,
  },
  eliminatedBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.crimsonLight,
    letterSpacing: 0.4,
  },
  scoreDetails: {
    alignItems: 'flex-end',
  },
  roundScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.crimsonLight,
  },
  winnerScoreText: {
    color: Colors.playableMint,
  },
  cumulativeText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  actionBtn: {
    width: '100%',
  },
});
