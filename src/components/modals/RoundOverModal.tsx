import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player, RoundResult } from '../../types/game';
import { Button } from '../common/Button';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Crown, AlertTriangle, Shield, Skull } from 'lucide-react-native';
import { DecoModal } from '../common/DecoModal';
import { OrnamentDivider, BrassDiamond } from '../common/Deco';

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
  if (!roundResult) return null;

  return (
    <DecoModal visible={visible} maxWidth={360}>
      <Text style={styles.kicker}>ROUND {roundResult.roundNumber} · COMPLETE</Text>
      <Text style={styles.title}>The Round Closes</Text>

      <OrnamentDivider compact style={styles.divider} />

      <View style={styles.winnerRow}>
        <Crown size={14} color={Colors.brassLight} style={{ marginRight: 7 }} />
        <Text style={styles.winnerName}>{roundResult.winnerName}</Text>
        <Text style={styles.winnerSuffix}>
          {roundResult.winnerName.trim().toLowerCase() === 'you'
            ? 'take the round'
            : 'takes the round'}
        </Text>
      </View>

      <Text style={styles.winReason}>
        {roundResult.winReason === 'seven_of_hearts'
          ? 'Seven of Hearts · instant round victory'
          : 'Shed every card in hand'}
      </Text>

      {roundResult.forcedPenaltyPlayerId && (
        <View style={styles.notice}>
          <AlertTriangle
            size={12}
            color={Colors.crimsonLight}
            style={{ marginRight: 7 }}
          />
          <Text style={styles.noticeText}>
            Final card was a penalty card. The next player drew{' '}
            {roundResult.forcedPenaltyCards} cards before scoring.
          </Text>
        </View>
      )}

      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>ROUND SCORE BREAKDOWN</Text>
        <View style={styles.sectionRule} />
      </View>

      <View style={styles.scoreList}>
        {players.map(p => {
          const isWinner = p.id === roundResult.winnerId;
          const roundScore = roundResult.playerRoundScores[p.id] ?? 0;
          const isEliminated = p.isEliminated;

          return (
            <View
              key={p.id}
              style={[
                styles.playerRow,
                isWinner && styles.winnerRowItem,
                isEliminated && styles.eliminatedRow,
              ]}
            >
              <View style={styles.playerInfo}>
                <View style={styles.nameLine}>
                  {isWinner ? (
                    <BrassDiamond size={4} filled style={{ marginRight: 6 }} />
                  ) : null}
                  <Text
                    style={[
                      styles.playerName,
                      isWinner && styles.winnerNameText,
                    ]}
                    numberOfLines={1}
                  >
                    {p.name}
                    {p.isHuman && p.name.trim().toLowerCase() !== 'you'
                      ? ' (You)'
                      : ''}
                  </Text>
                </View>

                {p.immuneThisRound && (
                  <View style={styles.statusPill}>
                    <Shield
                      size={8}
                      color={Colors.brassLight}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.immunityBadge}>IMMUNE</Text>
                  </View>
                )}

                {isEliminated && (
                  <View style={[styles.statusPill, styles.eliminatedPill]}>
                    <Skull
                      size={8}
                      color={Colors.crimsonLight}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.eliminatedBadge}>ELIMINATED</Text>
                  </View>
                )}
              </View>

              <View style={styles.scoreDetails}>
                <Text
                  style={[
                    styles.roundScoreText,
                    isWinner && styles.winnerScoreText,
                  ]}
                >
                  {isWinner && roundScore === 0 ? '0' : `+${roundScore}`}
                  <Text style={styles.ptsUnit}> PTS</Text>
                </Text>
                <Text style={styles.cumulativeText}>
                  Total {p.cumulativeScore} / 502
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Button
        title="Start Next Round"
        variant="gold"
        size="medium"
        onPress={onNextRound}
        style={styles.actionBtn}
      />
    </DecoModal>
  );
};

const styles = StyleSheet.create({
  kicker: {
    ...Typography.micro,
    color: Colors.brass,
    fontSize: 7.4,
    letterSpacing: 2.2,
    textAlign: 'center',
  },
  title: {
    ...Typography.serifHeading,
    color: Colors.ivory,
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
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  winnerName: {
    ...Typography.serifSubheading,
    color: Colors.brassLight,
    fontSize: 18,
  },
  winnerSuffix: {
    ...Typography.serifItalic,
    color: Colors.textMuted,
    fontSize: 11.5,
    marginLeft: 5,
  },
  winReason: {
    ...Typography.micro,
    color: Colors.ivoryMuted,
    fontSize: 7,
    letterSpacing: 1.3,
    textAlign: 'center',
    marginTop: 3,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.burgundyMuted,
    borderLeftWidth: 2,
    borderLeftColor: Colors.burgundyLight,
    paddingVertical: 7,
    paddingHorizontal: 9,
    marginTop: 12,
  },
  noticeText: {
    ...Typography.bodySmall,
    color: Colors.crimsonLight,
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 3,
  },
  sectionHeading: {
    ...Typography.micro,
    color: Colors.brass,
    fontSize: 7.2,
    letterSpacing: 1.8,
  },
  sectionRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198, 164, 96, 0.2)',
    marginLeft: 9,
  },
  scoreList: {
    marginBottom: 14,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(242, 232, 213, 0.08)',
  },
  winnerRowItem: {
    backgroundColor: 'rgba(198, 164, 96, 0.05)',
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  playerInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    ...Typography.serifBody,
    color: Colors.ivorySoft,
    fontSize: 13,
    lineHeight: 16,
  },
  winnerNameText: {
    color: Colors.brassLight,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(198, 164, 96, 0.3)',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  eliminatedPill: {
    borderColor: 'rgba(196, 85, 95, 0.4)',
  },
  immunityBadge: {
    ...Typography.micro,
    fontSize: 6.4,
    letterSpacing: 0.9,
    color: Colors.brassLight,
  },
  eliminatedBadge: {
    ...Typography.micro,
    fontSize: 6.4,
    letterSpacing: 0.9,
    color: Colors.crimsonLight,
  },
  scoreDetails: {
    alignItems: 'flex-end',
  },
  roundScoreText: {
    ...Typography.serifSubheading,
    fontSize: 16,
    lineHeight: 18,
    color: Colors.crimsonLight,
  },
  ptsUnit: {
    ...Typography.micro,
    fontSize: 6.4,
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  winnerScoreText: {
    color: Colors.brassLight,
  },
  cumulativeText: {
    ...Typography.micro,
    fontSize: 6.6,
    letterSpacing: 0.8,
    color: Colors.textMuted,
    marginTop: 1,
  },
  actionBtn: {
    width: '100%',
  },
});
