import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useResponsiveInsets } from '../hooks/useResponsiveInsets';
import { useGame } from '../context/GameContext';
import { TableHeader } from '../components/table/TableHeader';
import { OpponentSeat } from '../components/table/OpponentSeat';
import { DiscardPile } from '../components/table/DiscardPile';
import { DrawPile } from '../components/table/DrawPile';
import { CardHand } from '../components/card/CardHand';
import { JackSuitModal } from '../components/modals/JackSuitModal';
import { PenaltyModal } from '../components/modals/PenaltyModal';
import { RoundOverModal } from '../components/modals/RoundOverModal';
import { GameOverModal } from '../components/modals/GameOverModal';
import {
  TableMotionOverlay,
  FlyingCardAction,
  SpecialEventNotice,
} from '../components/table/TableMotionOverlay';
import { Card } from '../types/card';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Flame } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';
import { soundManager } from '../utils/sound';
import { DecoBackdrop, FeltSurface, BrassDiamond } from '../components/common/Deco';

interface GameScreenProps {
  onOpenScoreboard: () => void;
  onOpenRules: () => void;
  onGoHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  onOpenScoreboard,
  onOpenRules,
  onGoHome,
}) => {
  const {
    gameState,
    isMyTurn,
    myPlayerHand,
    playableCardIds,
    hasCounterToPenalty,
    pendingJackCard,
    playCard,
    confirmJackSuit,
    drawCard,
    acceptPenalty,
    startNextRound,
    resetMatch,
  } = useGame();

  const [isDealing, setIsDealing] = useState(false);
  const [flyingAction, setFlyingAction] = useState<FlyingCardAction | null>(null);
  const [specialEvent, setSpecialEvent] = useState<SpecialEventNotice | null>(null);

  const prevRoundRef = useRef<number | null>(null);
  const prevTopDiscardRef = useRef<string | null>(null);
  const tableShakeAnim = useRef(new Animated.Value(0)).current;
  const ambientAnim = useRef(new Animated.Value(0)).current;

  // Soft ambient light breathing across the table.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientAnim, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(ambientAnim, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ambientAnim]);

  // Dealing animation on new match / new round
  useEffect(() => {
    if (!gameState) return;
    if (prevRoundRef.current !== gameState.roundNumber) {
      prevRoundRef.current = gameState.roundNumber;
      setIsDealing(true);
      triggerHaptic('medium');
      soundManager.playCardDeal();
      const timer = setTimeout(() => {
        setIsDealing(false);
      }, 950);
      return () => clearTimeout(timer);
    }
  }, [gameState?.roundNumber]);

  // Special card events & table shake detector
  useEffect(() => {
    if (!gameState) return;
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!topCard || topCard.id === prevTopDiscardRef.current) return;
    prevTopDiscardRef.current = topCard.id;

    // The opening card is placed by the dealer, not played; do not announce
    // its power as if a seat had just activated it.
    if (gameState.discardPile.length <= 1) {
      setSpecialEvent(null);
      return;
    }

    if (topCard.rank === '7' && topCard.suit === 'hearts') {
      setSpecialEvent({
        title: 'THE SEVEN OF HEARTS',
        subtitle: 'The round closes instantly. Zero points.',
        type: 'victory',
      });
      triggerHaptic('success');
      soundManager.playVictoryChime();
    } else if (topCard.rank === '2' || (topCard.rank === 'A' && topCard.suit === 'spades')) {
      const penaltyCards = topCard.rank === '2' ? 2 : 5;
      setSpecialEvent({
        title: `PENALTY: ${penaltyCards} CARDS`,
        subtitle: `The table owes ${gameState.pendingPenalty.cardsOwed} cards unless answered.`,
        type: 'penalty',
      });
      triggerHaptic('warning');
      soundManager.playPenalty();

      Animated.sequence([
        Animated.timing(tableShakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(tableShakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(tableShakeAnim, { toValue: 2, duration: 40, useNativeDriver: true }),
        Animated.timing(tableShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    } else if (topCard.rank === '8') {
      setSpecialEvent({
        title: 'TURN SKIPPED',
        subtitle: 'The eight passes the turn onward.',
        type: 'skip',
      });
      triggerHaptic('light');
    } else if (topCard.rank === 'J') {
      setSpecialEvent({
        title: 'THE JACK IS WILD',
        subtitle: gameState.declaredSuit
          ? `${gameState.declaredSuit.toUpperCase()} is demanded.`
          : 'A suit is demanded.',
        type: 'jack',
      });
      triggerHaptic('medium');
    } else {
      setSpecialEvent(null);
    }

    const clearTimer = setTimeout(() => {
      setSpecialEvent(null);
    }, 2200);
    return () => clearTimeout(clearTimer);
  }, [gameState?.discardPile.length]);

  // Bot card play / draw motion watcher
  useEffect(() => {
    if (!gameState) return;
    const active = gameState.players[gameState.activePlayerIndex];
    if (!active || active.isHuman || active.isEliminated) return;

    const lastLog = gameState.logs[0];
    if (lastLog && !lastLog.startsWith('You')) {
      if (lastLog.includes('played')) {
        setFlyingAction({ from: 'opponent', to: 'discard' });
        soundManager.playCardSnap();
        const timer = setTimeout(() => setFlyingAction(null), 250);
        return () => clearTimeout(timer);
      } else if (lastLog.includes('drew')) {
        setFlyingAction({ from: 'deck', to: 'opponent' });
        soundManager.playCardDraw();
        const timer = setTimeout(() => setFlyingAction(null), 250);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState?.logs[0]]);

  if (!gameState) {
    return (
      <View style={styles.safeArea}>
        <DecoBackdrop variant="table" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>SETTING THE TABLE…</Text>
        </View>
      </View>
    );
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const opponents = gameState.players.filter(p => !p.isHuman);
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1] || null;
  const recentLog = gameState.logs.length > 0 ? gameState.logs[0] : '';
  const latestRoundResult =
    gameState.roundResults.length > 0
      ? gameState.roundResults[gameState.roundResults.length - 1]
      : null;

  const canDraw = isMyTurn && !gameState.pendingPenalty.active;
  const insets = useResponsiveInsets();

  const handlePlayCardAnimated = (card: Card) => {
    if (card.rank === 'J' && !gameState.declaredSuit) {
      playCard(card);
      return;
    }

    setFlyingAction({ card, from: 'hand', to: 'discard' });
    triggerHaptic('medium');
    soundManager.playCardSnap();
    setTimeout(() => {
      playCard(card);
      setFlyingAction(null);
    }, 180);
  };

  const handleDrawCardAnimated = () => {
    setFlyingAction({ from: 'deck', to: 'hand' });
    triggerHaptic('medium');
    soundManager.playCardDraw();
    setTimeout(() => {
      drawCard();
      setFlyingAction(null);
    }, 180);
  };

  const statusText = gameState.pendingPenalty.active
    ? `PENALTY · ${gameState.pendingPenalty.cardsOwed} CARDS OWED`
    : gameState.declaredSuit
    ? `${gameState.declaredSuit.toUpperCase()} DEMANDED`
    : `${gameState.drawPile.length} CARDS IN THE DECK`;

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <DecoBackdrop variant="table" />

      <View style={styles.gameColumn}>
        <View style={{ paddingTop: insets.top }}>
          <TableHeader
            roundNumber={gameState.roundNumber}
            activePlayerName={activePlayer ? activePlayer.name : ''}
            isMyTurn={isMyTurn}
            onOpenScoreboard={onOpenScoreboard}
            onOpenRules={onOpenRules}
          />
        </View>

        {/* The club rail: opponents seated along the top of the table */}
        <View style={styles.opponentsContainer}>
          <View style={styles.opponentsRow}>
            {opponents.map(opp => (
              <OpponentSeat
                key={opp.id}
                player={opp}
                isCurrentTurn={opp.id === activePlayer?.id}
              />
            ))}
          </View>
          <View style={styles.opponentsRail} />
        </View>

        {/* Central felt table */}
        <View style={styles.tableFelt}>
          <Animated.View
            style={[
              styles.feltBorderFrame,
              { transform: [{ translateX: tableShakeAnim }] },
            ]}
          >
            <FeltSurface />

            <View style={styles.innerHairline} pointerEvents="none" />

            {/* Brass corner brackets */}
            <View style={[styles.brassBracket, styles.bracketTopLeft]} />
            <View style={[styles.brassBracket, styles.bracketTopRight]} />
            <View style={[styles.brassBracket, styles.bracketBottomLeft]} />
            <View style={[styles.brassBracket, styles.bracketBottomRight]} />

            <Animated.View
              pointerEvents="none"
              style={[
                styles.ambientRing,
                {
                  opacity: ambientAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.05, 0.14],
                  }),
                  transform: [
                    {
                      scale: ambientAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.04],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Felt watermark */}
            <View style={styles.feltWatermark} pointerEvents="none">
              <Text style={styles.watermarkTitle}>502</Text>
              <View style={styles.watermarkSuits}>
                <Text style={styles.watermarkSuit}>♠</Text>
                <Text style={styles.watermarkSuit}>♥</Text>
                <Text style={styles.watermarkSuit}>♦</Text>
                <Text style={styles.watermarkSuit}>♣</Text>
              </View>
            </View>

            <View style={styles.tableContent}>
              {/* Recent action, set as an editorial line rather than a pill */}
              <View style={styles.actionRow}>
                <View style={styles.actionLine} />
                {gameState.pendingPenalty.active ? (
                  <Flame size={10} color={Colors.crimsonLight} style={{ marginHorizontal: 6 }} />
                ) : (
                  <BrassDiamond size={4} style={{ marginHorizontal: 7 }} />
                )}
                <Text
                  style={[
                    styles.actionText,
                    gameState.pendingPenalty.active && styles.actionTextDanger,
                  ]}
                  numberOfLines={2}
                >
                  {recentLog || 'THE TABLE IS SET'}
                </Text>
                <View style={styles.actionLine} />
              </View>

              {/* Draw and discard */}
              <View style={styles.centerPilesRow}>
                <DrawPile
                  count={gameState.drawPile.length}
                  canDraw={canDraw}
                  onDraw={handleDrawCardAnimated}
                />

                <View style={styles.pileDivider}>
                  <View style={styles.pileDividerLine} />
                  <BrassDiamond size={5} />
                  <View style={styles.pileDividerLine} />
                </View>

                <DiscardPile
                  topCard={topDiscard}
                  declaredSuit={gameState.declaredSuit}
                  count={gameState.discardPile.length}
                />
              </View>

              <View style={styles.tableFooterStatus}>
                <Text style={styles.tableFooterText}>{statusText}</Text>
              </View>
            </View>

            <TableMotionOverlay
              isDealing={isDealing}
              flyingAction={flyingAction}
              specialEvent={specialEvent}
            />
          </Animated.View>
        </View>

        {isMyTurn && gameState.pendingPenalty.active && (
          <PenaltyModal
            pendingPenalty={gameState.pendingPenalty}
            hasCounterCard={hasCounterToPenalty}
            onAcceptPenalty={acceptPenalty}
          />
        )}

        {/* Player hand */}
        <View style={[styles.playerHandSection, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <CardHand
            hand={myPlayerHand}
            playableCardIds={playableCardIds}
            onCardPress={handlePlayCardAnimated}
            isMyTurn={isMyTurn}
            playerScore={humanPlayer?.cumulativeScore}
            playerName={humanPlayer?.name}
          />
        </View>
      </View>

      <JackSuitModal
        visible={Boolean(pendingJackCard)}
        onSelectSuit={confirmJackSuit}
      />

      <RoundOverModal
        visible={gameState.matchPhase === 'round_over'}
        roundResult={latestRoundResult}
        players={gameState.players}
        onNextRound={startNextRound}
      />

      <GameOverModal
        visible={gameState.matchPhase === 'match_over'}
        matchWinnerId={gameState.matchWinnerId}
        players={gameState.players}
        onPlayAgain={resetMatch}
        onGoHome={onGoHome}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  gameColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.labelUpper,
    color: Colors.brassLight,
    fontSize: 9,
    letterSpacing: 2.4,
  },
  opponentsContainer: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  opponentsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
  },
  opponentsRail: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 22,
    marginTop: 2,
    backgroundColor: 'rgba(198, 164, 96, 0.16)',
  },
  tableFelt: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 3,
  },
  feltBorderFrame: {
    flex: 1,
    backgroundColor: Colors.emeraldDeep,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(198, 164, 96, 0.38)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  innerHairline: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 18,
    borderWidth: 0.6,
    borderColor: 'rgba(198, 164, 96, 0.14)',
    zIndex: 2,
  },
  brassBracket: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: 'rgba(198, 164, 96, 0.7)',
    zIndex: 4,
  },
  bracketTopLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  bracketTopRight: {
    top: 8,
    right: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  bracketBottomLeft: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  bracketBottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  ambientRing: {
    position: 'absolute',
    top: '16%',
    left: '16%',
    right: '16%',
    bottom: '16%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.brass,
    zIndex: 1,
  },
  feltWatermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  watermarkTitle: {
    fontFamily: Typography.displayTitle.fontFamily,
    fontSize: 72,
    fontWeight: '400',
    letterSpacing: 4,
    color: 'rgba(198, 164, 96, 0.045)',
    lineHeight: 78,
  },
  watermarkSuits: {
    flexDirection: 'row',
    marginTop: 2,
  },
  watermarkSuit: {
    fontSize: 13,
    color: 'rgba(198, 164, 96, 0.06)',
    marginHorizontal: 7,
  },
  tableContent: {
    flex: 1,
    paddingHorizontal: 11,
    paddingTop: 12,
    paddingBottom: 9,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  actionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198, 164, 96, 0.18)',
  },
  actionText: {
    ...Typography.micro,
    color: Colors.ivoryMuted,
    fontSize: 7.2,
    letterSpacing: 0.9,
    lineHeight: 10,
    maxWidth: '86%',
    textAlign: 'center',
  },
  actionTextDanger: {
    color: Colors.crimsonLight,
  },
  centerPilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  pileDivider: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pileDividerLine: {
    width: StyleSheet.hairlineWidth,
    height: 26,
    backgroundColor: 'rgba(198, 164, 96, 0.2)',
  },
  tableFooterStatus: {
    alignItems: 'center',
    paddingBottom: 2,
  },
  tableFooterText: {
    ...Typography.micro,
    fontSize: 6.8,
    color: Colors.textMuted,
    letterSpacing: 1.4,
  },
  playerHandSection: {
    backgroundColor: Colors.inkSoft,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198, 164, 96, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
