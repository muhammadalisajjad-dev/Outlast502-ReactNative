import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Player } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react-native';

interface GameOverModalProps {
  visible: boolean;
  matchWinnerId: string | null;
  players: Player[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  matchWinnerId,
  players,
  onPlayAgain,
  onGoHome,
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

  if (!matchWinnerId) return null;

  const winner = players.find(p => p.id === matchWinnerId);
  const winnerName = winner ? winner.name : 'Unknown';

  const rankedPlayers = [...players].sort((a, b) => {
    if (a.id === matchWinnerId) return -1;
    if (b.id === matchWinnerId) return 1;
    if (a.isEliminated !== b.isEliminated) {
      return a.isEliminated ? 1 : -1;
    }
    return a.cumulativeScore - b.cumulativeScore;
  });

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
          <View style={styles.trophyIconBox}>
            <Trophy size={28} color={Colors.silverLight} />
          </View>
          <Text style={styles.title}>MATCH COMPLETE</Text>

          {/* Winner Showcase */}
          <View style={styles.winnerCard}>
            <Text style={styles.championLabel}>OUTLAST 502 CHAMPION</Text>
            <Text style={styles.winnerName}>{winnerName}</Text>
            <Text style={styles.winnerScore}>
              Final Score: {winner?.cumulativeScore ?? 0} pts
            </Text>
          </View>

          <Text style={styles.sectionHeading}>FINAL STANDINGS</Text>

          <ScrollView style={styles.rankList}>
            {rankedPlayers.map((p, idx) => {
              const isFirst = p.id === matchWinnerId;
              return (
                <View
                  key={p.id}
                  style={[
                    styles.rankRow,
                    isFirst && styles.firstRow,
                    p.isEliminated && styles.eliminatedRow,
                  ]}
                >
                  <View style={styles.leftRank}>
                    <Text
                      style={[
                        styles.rankNumber,
                        isFirst && styles.firstRankNumber,
                      ]}
                    >
                      #{idx + 1}
                    </Text>
                    <View>
                      <Text style={[styles.playerName, isFirst && styles.firstPlayerName]}>
                        {p.name} {p.isHuman ? '(You)' : ''}
                      </Text>
                      {p.isEliminated && (
                        <View style={styles.eliminatedTag}>
                          <Skull size={9} color={Colors.crimsonLight} style={{ marginRight: 3 }} />
                          <Text style={styles.statusText}>Eliminated (502+)</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.scoreText,
                      isFirst && styles.firstScoreText,
                    ]}
                  >
                    {p.cumulativeScore} pts
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button
              title="Play Again"
              icon={<RotateCcw size={14} color="#ffffff" />}
              variant="cobalt"
              size="medium"
              onPress={onPlayAgain}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Main Menu"
              icon={<Home size={14} color={Colors.textPrimary} />}
              variant="subtle"
              size="medium"
              onPress={onGoHome}
              style={{ flex: 1 }}
            />
          </View>
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
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  trophyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    ...Typography.badge,
    color: Colors.silverLight,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  winnerCard: {
    width: '100%',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: Colors.cobalt,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  championLabel: {
    ...Typography.labelUpper,
    color: Colors.cobaltLight,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  winnerName: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: 2,
  },
  winnerScore: {
    ...Typography.bodySmall,
    color: Colors.textGold,
    fontWeight: '700',
  },
  sectionHeading: {
    ...Typography.labelUpper,
    color: Colors.textMuted,
    fontSize: 9.5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  rankList: {
    width: '100%',
    maxHeight: 180,
    marginBottom: 14,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  firstRow: {
    backgroundColor: 'rgba(203, 178, 106, 0.08)',
    borderRadius: 6,
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  leftRank: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '800',
    width: 26,
  },
  firstRankNumber: {
    color: Colors.goldLight,
  },
  playerName: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  firstPlayerName: {
    color: Colors.goldLight,
  },
  eliminatedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  statusText: {
    fontSize: 9,
    color: Colors.crimsonLight,
  },
  scoreText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  firstScoreText: {
    color: Colors.goldLight,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
