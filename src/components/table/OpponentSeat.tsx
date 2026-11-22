import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../../types/game';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Shield, Skull, Flame } from 'lucide-react-native';

interface OpponentSeatProps {
  player: Player;
  isCurrentTurn: boolean;
}

const TONES = [
  { bg: '#26362F', fg: '#D8E2DC' },
  { bg: '#3A2B28', fg: '#EBD3CB' },
  { bg: '#2B3530', fg: '#D5DED8' },
  { bg: '#32302A', fg: '#E5DFCE' },
  { bg: '#253239', fg: '#CFE0E2' },
];

export const OpponentSeat: React.FC<OpponentSeatProps> = ({
  player,
  isCurrentTurn,
}) => {
  const tone = TONES[player.avatarSeed % TONES.length] || TONES[0];
  const isDanger = player.cumulativeScore >= 400 && !player.isEliminated;

  return (
    <View
      style={[
        styles.container,
        isCurrentTurn && styles.activeContainer,
        player.isEliminated && styles.eliminated,
      ]}
    >
      <View style={styles.avatarWrap}>
        <View
          style={[
            styles.avatarRing,
            {
              borderColor: isCurrentTurn
                ? Colors.accent
                : player.isEliminated
                ? Colors.line
                : Colors.lineStrong,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: tone.bg }]}>
            <Text style={[styles.initial, { color: tone.fg }]}>
              {player.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.nameRow}>
        <Text
          style={[
            styles.name,
            isCurrentTurn && styles.nameActive,
            player.isEliminated && styles.nameOut,
          ]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
        {player.immuneThisRound && !player.isEliminated && (
          <Shield size={9} color={Colors.tealLight} style={styles.metaIcon} />
        )}
        {player.isEliminated && (
          <Skull size={9} color={Colors.danger} style={styles.metaIcon} />
        )}
        {isDanger && <Flame size={9} color={Colors.warning} style={styles.metaIcon} />}
      </View>

      <View style={styles.statsRow}>
        <Text
          style={[
            styles.score,
            isDanger && styles.scoreDanger,
            player.isEliminated && styles.scoreOut,
          ]}
        >
          {player.isEliminated ? 'Out' : player.cumulativeScore}
        </Text>
        {!player.isEliminated && (
          <View style={styles.cardStat}>
            <View style={styles.cardGlyph}>
              <View style={styles.cardGlyphInner} />
            </View>
            <Text style={styles.cardCount}>{player.hand.length}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.turnLabel, isCurrentTurn && styles.turnLabelActive]}>
        {isCurrentTurn ? 'To act' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 96,
    minWidth: 56,
    marginHorizontal: 2,
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  activeContainer: {},
  eliminated: {
    opacity: 0.45,
  },
  avatarWrap: {
    marginBottom: 5,
  },
  avatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.paperFaint,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  metaIcon: {
    marginLeft: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  name: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '600',
    maxWidth: '100%',
  },
  nameActive: {
    color: Colors.textPrimary,
  },
  nameOut: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  score: {
    fontFamily: Typography.numeral.fontFamily,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 16,
  },
  scoreDanger: {
    color: Colors.warning,
  },
  scoreOut: {
    fontFamily: Typography.micro.fontFamily,
    fontSize: 8,
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
  },
  cardGlyph: {
    width: 7,
    height: 10,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    borderRadius: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  cardGlyphInner: {
    width: 3,
    height: 3,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    borderRadius: 0.5,
  },
  cardCount: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
  },
  turnLabel: {
    ...Typography.micro,
    fontSize: 6.5,
    letterSpacing: 1.2,
    marginTop: 2,
    minHeight: 9,
    color: 'transparent',
  },
  turnLabelActive: {
    color: Colors.accentSoft,
  },
});
