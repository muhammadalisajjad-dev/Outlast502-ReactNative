import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react-native';
import { Dialog } from '../common/Dialog';
import { Divider } from '../common/Chrome';

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
    <Dialog visible={visible} maxWidth={366}>
      <View style={styles.crest}>
        <Trophy size={19} color={Colors.accentSoft} />
      </View>

      <Text style={styles.kicker}>MATCH COMPLETE</Text>
      <Text style={styles.title}>The Club Champion</Text>

      <Divider style={styles.divider} />

      <Text style={styles.championLabel}>OUTLAST 502 CHAMPION</Text>
      <Text style={styles.winnerName} numberOfLines={1}>
        {winnerName}
      </Text>
      <Text style={styles.winnerScore}>
        Final score · {winner?.cumulativeScore ?? 0} pts
      </Text>

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>FINAL STANDINGS</Text>
        <View style={styles.sectionRule} />
      </View>

      <View style={styles.rankList}>
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
                <Text style={[styles.rankNumber, isFirst && styles.firstRankNumber]}>
                  {String(idx + 1).padStart(2, '0')}
                </Text>
                <View style={styles.rankNameBlock}>
                  <View style={styles.nameLine}>
                    {isFirst ? <View style={styles.winnerDot} /> : null}
                    <Text
                      style={[styles.playerName, isFirst && styles.firstPlayerName]}
                      numberOfLines={1}
                    >
                      {p.name}
                      {p.isHuman && p.name.trim().toLowerCase() !== 'you'
                        ? ' (You)'
                        : ''}
                    </Text>
                  </View>
                  {p.isEliminated && (
                    <View style={styles.eliminatedTag}>
                      <Skull
                        size={8}
                        color={Colors.danger}
                        style={{ marginRight: 3 }}
                      />
                      <Text style={styles.statusText}>Eliminated · 502+</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={[styles.scoreText, isFirst && styles.firstScoreText]}>
                {p.cumulativeScore}
                <Text style={styles.ptsUnit}> PTS</Text>
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Play Again"
          icon={<RotateCcw size={13} color={Colors.ink} />}
          variant="secondary"
          size="medium"
          onPress={onPlayAgain}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Main Menu"
          icon={<Home size={13} color={Colors.accentSoft} />}
          variant="outline"
          size="medium"
          onPress={onGoHome}
          style={{ flex: 1 }}
        />
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  crest: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(198, 164, 96, 0.55)',
    backgroundColor: 'rgba(198, 164, 96, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 9,
  },
  kicker: {
    ...Typography.micro,
    color: Colors.accent,
    fontSize: 7.4,
    letterSpacing: 2.2,
    textAlign: 'center',
  },
  title: {
    ...Typography.serifHeading,
    color: Colors.paper,
    fontSize: 24,
    textAlign: 'center',
    marginTop: 3,
  },
  divider: {
    width: 168,
    alignSelf: 'center',
    marginTop: 9,
    marginBottom: 10,
  },
  championLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 6.8,
    letterSpacing: 2,
    textAlign: 'center',
  },
  winnerName: {
    ...Typography.serifDisplay,
    color: Colors.accentSoft,
    fontSize: 27,
    lineHeight: 32,
    textAlign: 'center',
    marginTop: 2,
  },
  winnerScore: {
    ...Typography.serifItalic,
    color: Colors.textSecondary,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 1,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 3,
  },
  sectionHeading: {
    ...Typography.micro,
    color: Colors.accent,
    fontSize: 7.2,
    letterSpacing: 1.8,
  },
  sectionRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198, 164, 96, 0.2)',
    marginLeft: 9,
  },
  rankList: {
    marginBottom: 14,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(242, 232, 213, 0.08)',
  },
  winnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: 6,
  },
  firstRow: {
    backgroundColor: 'rgba(198, 164, 96, 0.05)',
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  leftRank: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  rankNumber: {
    ...Typography.serifBody,
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    width: 24,
  },
  firstRankNumber: {
    color: Colors.accent,
  },
  rankNameBlock: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    ...Typography.serifBody,
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 17,
  },
  firstPlayerName: {
    color: Colors.accentSoft,
  },
  eliminatedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  statusText: {
    ...Typography.micro,
    fontSize: 6.4,
    letterSpacing: 0.8,
    color: Colors.danger,
  },
  scoreText: {
    ...Typography.serifSubheading,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  ptsUnit: {
    ...Typography.micro,
    fontSize: 6.4,
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  firstScoreText: {
    color: Colors.accentSoft,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
