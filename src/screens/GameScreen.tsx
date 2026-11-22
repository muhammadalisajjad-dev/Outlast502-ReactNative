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
import { Atmosphere } from '../components/common/Chrome';

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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientAnim, { toValue: 1, duration: 4600, useNativeDriver: true }),
        Animated.timing(ambientAnim, { toValue: 0, duration: 4600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ambientAnim]);

  useEffect(() => {
    if (!gameState) return;
    if (prevRoundRef.current !== gameState.roundNumber) {
      prevRoundRef.current = gameState.roundNumber;
      setIsDealing(true);
      triggerHaptic('medium');
      soundManager.playCardDeal();
      const timer = setTimeout(() => setIsDealing(false), 950);
      return () => clearTimeout(timer);
    }
  }, [gameState?.roundNumber]);

  useEffect(() => {
    if (!gameState) return;
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!topCard || topCard.id === prevTopDiscardRef.current) return;
    prevTopDiscardRef.current = topCard.id;

    if (gameState.discardPile.length <= 1) {
      setSpecialEvent(null);
      return;
    }

    if (topCard.rank === '7' && topCard.suit === 'hearts') {
      setSpecialEvent({ title: 'Seven of hearts', subtitle: 'The round closes instantly.', type: 'victory' });
      triggerHaptic('success');
      soundManager.playVictoryChime();
    } else if (topCard.rank === '2' || (topCard.rank === 'A' && topCard.suit === 'spades')) {
      const penaltyCards = topCard.rank === '2' ? 2 : 5;
      setSpecialEvent({
        title: `Penalty · ${penaltyCards} cards`,
        subtitle: `The table owes ${gameState.pendingPenalty.cardsOwed} unless answered.`,
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
      setSpecialEvent({ title: 'Turn skipped', subtitle: 'The eight passes the turn onward.', type: 'skip' });
      triggerHaptic('light');
    } else if (topCard.rank === 'J') {
      setSpecialEvent({
        title: 'The jack is wild',
        subtitle: gameState.declaredSuit ? `${gameState.declaredSuit} is demanded.` : 'A suit is demanded.',
        type: 'jack',
      });
      triggerHaptic('medium');
    } else {
      setSpecialEvent(null);
    }

    const clearTimer = setTimeout(() => setSpecialEvent(null), 2200);
    return () => clearTimeout(clearTimer);
  }, [gameState?.discardPile.length]);

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
        <Atmosphere variant="table" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Setting the table…</Text>
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
    ? `Penalty · ${gameState.pendingPenalty.cardsOwed} cards owed`
    : gameState.declaredSuit
    ? `${gameState.declaredSuit} demanded`
    : `${gameState.drawPile.length} cards in the deck`;

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <Atmosphere variant="table" />

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

        <View style={styles.tableFelt}>
          <Animated.View
            style={[
              styles.feltFrame,
              { transform: [{ translateX: tableShakeAnim }] },
            ]}
          >
            <View style={styles.fieldLight} pointerEvents="none" />

            <View style={styles.tableContent}>
              <View style={styles.actionRow}>
                {gameState.pendingPenalty.active ? (
                  <Flame size={10} color={Colors.danger} style={{ marginHorizontal: 6 }} />
                ) : (
                  <View style={styles.actionDot} />
                )}
                <Text
                  style={[
                    styles.actionText,
                    gameState.pendingPenalty.active && styles.actionTextDanger,
                  ]}
                  numberOfLines={2}
                >
                  {recentLog || 'The table is set.'}
                </Text>
              </View>

              <View style={styles.centerPilesRow}>
                <DrawPile
                  count={gameState.drawPile.length}
                  canDraw={canDraw}
                  onDraw={handleDrawCardAnimated}
                />

                <View style={styles.pileDivider}>
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
  safeArea: { flex: 1, backgroundColor: Colors.ink },
  gameColumn: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...Typography.labelUpper, color: Colors.textMuted, fontSize: 9, letterSpacing: 2.4 },
  opponentsContainer: { paddingTop: 2, paddingBottom: 2 },
  opponentsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly', paddingHorizontal: 8 },
  opponentsRail: { height: StyleSheet.hairlineWidth, marginHorizontal: 22, marginTop: 4, backgroundColor: Colors.line },
  tableFelt: { flex: 1, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  feltFrame: {
    flex: 1,
    backgroundColor: Colors.surfaceField,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  fieldLight: {
    position: 'absolute',
    top: '8%',
    left: '12%',
    right: '12%',
    bottom: '20%',
    borderRadius: 999,
    backgroundColor: Colors.tealMuted,
    opacity: 0.35,
  },
  tableContent: { flex: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, justifyContent: 'space-between', alignItems: 'center', zIndex: 3 },
  actionRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 2, gap: 8 },
  actionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  actionText: { ...Typography.bodySmall, color: Colors.textSecondary, fontSize: 11.5, lineHeight: 16, flex: 1, textAlign: 'center' },
  actionTextDanger: { color: Colors.danger },
  centerPilesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 'auto', gap: 12 },
  pileDivider: { width: 18, alignItems: 'center', justifyContent: 'center' },
  pileDividerLine: { width: StyleSheet.hairlineWidth, height: 30, backgroundColor: Colors.line },
  tableFooterStatus: { alignItems: 'center', paddingBottom: 2 },
  tableFooterText: { ...Typography.micro, fontSize: 7, color: Colors.textMuted, letterSpacing: 1.2 },
  playerHandSection: { backgroundColor: Colors.inkSoft, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.line },
});
