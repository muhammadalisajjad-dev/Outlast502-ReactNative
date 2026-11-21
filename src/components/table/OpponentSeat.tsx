import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Player } from '../../types/game';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Shield, Skull, Layers, Flame } from 'lucide-react-native';

interface OpponentSeatProps {
  player: Player;
  isCurrentTurn: boolean;
}

const AVATAR_GRADIENTS = [
  { bg: '#1e3a8a', ring: '#60a5fa' },
  { bg: '#065f46', ring: '#34d399' },
  { bg: '#701a75', ring: '#e879f9' },
  { bg: '#78350f', ring: '#fbbf24' },
  { bg: '#312e81', ring: '#818cf8' },
];

export const OpponentSeat: React.FC<OpponentSeatProps> = ({
  player,
  isCurrentTurn,
}) => {
  const turnPulse = useRef(new Animated.Value(0)).current;
  const avatarStyle = AVATAR_GRADIENTS[player.avatarSeed % AVATAR_GRADIENTS.length] || AVATAR_GRADIENTS[0];

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isCurrentTurn) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(turnPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(turnPulse, {
            toValue: 0,
            duration: 800,
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

  const activeScale = turnPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const activeGlowOpacity = turnPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  // Calculate visual card fan (display up to 4 mini cards fanned behind)
  const miniCardsCount = Math.min(player.hand.length, 4);
  const miniCards = Array.from({ length: miniCardsCount });

  return (
    <Animated.View
      style={[
        styles.container,
        isCurrentTurn && styles.activeTurnContainer,
        player.isEliminated && styles.eliminatedContainer,
        isCurrentTurn && { transform: [{ scale: activeScale }] },
      ]}
    >
      {/* Mini Card Fan Behind Avatar */}
      {!player.isEliminated && player.hand.length > 0 && (
        <View style={styles.miniCardFanContainer} pointerEvents="none">
          {miniCards.map((_, i) => {
            const rot = (i - (miniCardsCount - 1) / 2) * 8;
            return (
              <View
                key={i}
                style={[
                  styles.miniCardBack,
                  {
                    transform: [{ rotate: `${rot}deg` }],
                    left: 28 + (i - (miniCardsCount - 1) / 2) * 4,
                  },
                ]}
              />
            );
          })}
        </View>
      )}

      {/* Top Row: Avatar & Status */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: avatarStyle.bg, borderColor: avatarStyle.ring },
            isCurrentTurn && styles.avatarActiveRing,
          ]}
        >
          <Text style={styles.avatarInitial}>
            {player.name.charAt(0).toUpperCase()}
          </Text>

          {isCurrentTurn && (
            <Animated.View
              style={[
                styles.turnPulseAura,
                { opacity: activeGlowOpacity },
              ]}
            />
          )}
        </View>

        {/* Turn / Status Tag */}
        {player.isEliminated ? (
          <View style={styles.eliminatedTag}>
            <Skull size={10} color={Colors.crimsonLight} />
          </View>
        ) : player.immuneThisRound ? (
          <View style={styles.immuneTag}>
            <Shield size={10} color="#fbbf24" />
          </View>
        ) : isCurrentTurn ? (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>THINKING</Text>
          </View>
        ) : player.cumulativeScore >= 400 ? (
          <View style={styles.dangerTag}>
            <Flame size={10} color={Colors.crimsonLight} />
          </View>
        ) : null}
      </View>

      {/* Name */}
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

      {/* Score & Cards */}
      <View style={styles.bottomRow}>
        <Text
          style={[
            styles.scoreText,
            player.cumulativeScore >= 400 && styles.scoreDanger,
            player.isEliminated && styles.scoreEliminated,
          ]}
        >
          {player.isEliminated ? 'OUT' : `${player.cumulativeScore}p`}
        </Text>

        {!player.isEliminated && (
          <View style={styles.cardCountGroup}>
            <Layers size={9.5} color={Colors.playableBlue} style={{ marginRight: 2 }} />
            <Text style={styles.cardCountText}>{player.hand.length}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(11, 18, 34, 0.92)',
    borderColor: 'rgba(56, 189, 248, 0.18)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginHorizontal: 3,
    width: 82,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  miniCardFanContainer: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  miniCardBack: {
    position: 'absolute',
    width: 12,
    height: 16,
    backgroundColor: '#070c18',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderWidth: 0.5,
    borderRadius: 2,
  },
  activeTurnContainer: {
    borderColor: Colors.playableBlue,
    backgroundColor: 'rgba(20, 32, 58, 0.98)',
    shadowColor: Colors.playableBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  eliminatedContainer: {
    opacity: 0.4,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(8, 12, 20, 0.8)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: 3,
    zIndex: 1,
  },
  avatarCircle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarActiveRing: {
    borderColor: Colors.playableBlue,
  },
  turnPulseAura: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.playableBlue,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  activePill: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#0284c7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activePillText: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  eliminatedTag: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    padding: 2,
    borderRadius: 4,
  },
  immuneTag: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    padding: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#fbbf24',
  },
  dangerTag: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    padding: 2,
    borderRadius: 4,
  },
  nameText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: '100%',
  },
  nameActiveText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  nameEliminatedText: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  scoreText: {
    color: Colors.silverLight,
    fontSize: 9.5,
    fontWeight: '800',
  },
  scoreDanger: {
    color: Colors.crimsonLight,
  },
  scoreEliminated: {
    color: Colors.textMuted,
  },
  cardCountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCountText: {
    color: Colors.playableBlue,
    fontSize: 9.5,
    fontWeight: '800',
  },
});
