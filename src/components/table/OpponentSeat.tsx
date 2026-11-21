import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Player } from '../../types/game';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Shield, Skull, Flame } from 'lucide-react-native';

interface OpponentSeatProps {
  player: Player;
  isCurrentTurn: boolean;
}

const SEAT_TONES = [
  { bg: '#173B2E', ring: '#C6A460' },
  { bg: '#4A1D26', ring: '#C9A36A' },
  { bg: '#263B2A', ring: '#D8C08A' },
  { bg: '#1D2D38', ring: '#B9A27A' },
  { bg: '#3A2A1E', ring: '#D0B47C' },
];

export const OpponentSeat: React.FC<OpponentSeatProps> = ({
  player,
  isCurrentTurn,
}) => {
  const turnPulse = useRef(new Animated.Value(0)).current;
  const tone = SEAT_TONES[player.avatarSeed % SEAT_TONES.length] || SEAT_TONES[0];

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isCurrentTurn) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(turnPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(turnPulse, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      turnPulse.setValue(0);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isCurrentTurn, turnPulse]);

  const activeGlow = turnPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.95],
  });

  const activeScale = turnPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });

  const miniCardsCount = Math.min(player.hand.length, 4);
  const miniCards = Array.from({ length: miniCardsCount });
  const isDanger = player.cumulativeScore >= 400 && !player.isEliminated;

  return (
    <Animated.View
      style={[
        styles.container,
        isCurrentTurn && styles.activeContainer,
        player.isEliminated && styles.eliminatedContainer,
        isCurrentTurn && { transform: [{ scale: activeScale }] },
      ]}
    >
      {isCurrentTurn && (
        <Animated.View
          pointerEvents="none"
          style={[styles.activeTopRule, { opacity: activeGlow }]}
        />
      )}

      {/* Small fan of card backs behind the portrait */}
      {!player.isEliminated && player.hand.length > 0 && (
        <View style={styles.fanContainer} pointerEvents="none">
          {miniCards.map((_, index) => {
            const rotation = (index - (miniCardsCount - 1) / 2) * 10;
            return (
              <View
                key={index}
                style={[
                  styles.miniCardBack,
                  {
                    transform: [{ rotate: `${rotation}deg` }],
                    left: 21 + (index - (miniCardsCount - 1) / 2) * 4,
                    zIndex: index,
                  },
                ]}
              >
                <View style={styles.miniCardDiamond} />
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.avatarWrap}>
        <View
          style={[
            styles.avatarOuter,
            { borderColor: player.isEliminated ? 'rgba(198,164,96,0.18)' : tone.ring },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: tone.bg }]}>
            <Text style={styles.avatarInitial}>
              {player.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {isCurrentTurn && (
          <Animated.View
            pointerEvents="none"
            style={[styles.turnRing, { opacity: activeGlow }]}
          />
        )}
      </View>

      <View style={styles.nameRow}>
        <Text
          style={[
            styles.nameText,
            isCurrentTurn && styles.nameActiveText,
            player.isEliminated && styles.nameEliminatedText,
          ]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
        {player.immuneThisRound && !player.isEliminated && (
          <Shield size={8} color={Colors.brassLight} style={{ marginLeft: 2 }} />
        )}
        {player.isEliminated && (
          <Skull size={8} color={Colors.crimsonLight} style={{ marginLeft: 2 }} />
        )}
        {isDanger && (
          <Flame size={8} color={Colors.crimsonLight} style={{ marginLeft: 2 }} />
        )}
      </View>

      <View style={styles.statsRow}>
        <Text
          style={[
            styles.scoreText,
            isDanger && styles.scoreDanger,
            player.isEliminated && styles.scoreEliminated,
          ]}
        >
          {player.isEliminated ? 'OUT' : `${player.cumulativeScore}`}
          {!player.isEliminated && <Text style={styles.unit}> PTS</Text>}
        </Text>

        {!player.isEliminated && (
          <View style={styles.cardStat}>
            <View style={styles.cardGlyph}>
              <View style={styles.cardGlyphInner} />
            </View>
            <Text style={styles.cardCountText}>{player.hand.length}</Text>
          </View>
        )}
      </View>

      {isCurrentTurn && (
        <Animated.Text style={[styles.toActText, { opacity: activeGlow }]}>
          TO ACT
        </Animated.Text>
      )}
    </Animated.View>
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
    borderRadius: 6,
    position: 'relative',
  },
  activeContainer: {
    backgroundColor: 'rgba(198, 164, 96, 0.07)',
  },
  eliminatedContainer: {
    opacity: 0.45,
  },
  activeTopRule: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: Colors.brassLight,
    shadowColor: Colors.brass,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  fanContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  miniCardBack: {
    position: 'absolute',
    top: 1,
    width: 13,
    height: 19,
    backgroundColor: Colors.emerald,
    borderColor: 'rgba(198, 164, 96, 0.55)',
    borderWidth: 0.6,
    borderRadius: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardDiamond: {
    width: 5,
    height: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(198, 164, 96, 0.7)',
    transform: [{ rotate: '45deg' }],
  },
  avatarWrap: {
    position: 'relative',
    marginTop: 2,
    zIndex: 1,
  },
  avatarOuter: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inkSoft,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: Colors.ivory,
    fontSize: 11,
    fontFamily: Typography.titleSmall.fontFamily,
    fontWeight: '700',
  },
  turnRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: Colors.brassLight,
    shadowColor: Colors.brass,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    maxWidth: '100%',
  },
  nameText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 7.6,
    letterSpacing: 0.9,
    textAlign: 'center',
    maxWidth: '100%',
  },
  nameActiveText: {
    color: Colors.ivory,
  },
  nameEliminatedText: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  scoreText: {
    ...Typography.serifBody,
    color: Colors.brassLight,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
  },
  unit: {
    fontSize: 6,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scoreDanger: {
    color: Colors.crimsonLight,
  },
  scoreEliminated: {
    color: Colors.textMuted,
    fontSize: 8,
    letterSpacing: 0.6,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
  },
  cardGlyph: {
    width: 7,
    height: 9,
    borderWidth: 0.6,
    borderColor: 'rgba(198, 164, 96, 0.55)',
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  cardGlyphInner: {
    width: 3,
    height: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(198, 164, 96, 0.65)',
    transform: [{ rotate: '45deg' }],
  },
  cardCountText: {
    ...Typography.bodySmall,
    color: Colors.ivoryMuted,
    fontSize: 8.5,
    lineHeight: 10,
    fontWeight: '600',
  },
  toActText: {
    ...Typography.micro,
    color: Colors.brassLight,
    fontSize: 6.2,
    letterSpacing: 1.1,
    marginTop: 1,
  },
});
