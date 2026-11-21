import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
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
import { Sparkles, Flame } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';
import { soundManager } from '../utils/sound';

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

    // Detect 7 of Hearts instant round victory
    if (topCard.rank === '7' && topCard.suit === 'hearts') {
      setSpecialEvent({
        title: '7 OF HEARTS INSTANT WIN!',
        subtitle: 'Round completed immediately with 0 points!',
        type: 'victory',
      });
      triggerHaptic('success');
      soundManager.playVictoryChime();
    } else if (topCard.rank === '2' || (topCard.rank === 'A' && topCard.suit === 'spades')) {
      // Detect Penalties (+2 or +5)
      const penaltyCards = topCard.rank === '2' ? 2 : 5;
      setSpecialEvent({
        title: `PENALTY ATTACK: +${penaltyCards} CARDS!`,
        subtitle: `Next player must counter or draw ${gameState.pendingPenalty.cardsOwed} cards`,
        type: 'penalty',
      });
      triggerHaptic('warning');
      soundManager.playPenalty();

      // Table impact shake
      Animated.sequence([
        Animated.timing(tableShakeAnim, { toValue: 5, duration: 40, useNativeDriver: true }),
        Animated.timing(tableShakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(tableShakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
        Animated.timing(tableShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    } else if (topCard.rank === '8') {
      // Detect 8 Skip
      setSpecialEvent({
        title: 'TURN SKIPPED!',
        subtitle: 'An 8 bypassed the next player',
        type: 'skip',
      });
      triggerHaptic('light');
    } else if (topCard.rank === 'J') {
      // Detect Jack Wild
      setSpecialEvent({
        title: 'JACK DECLARED!',
        subtitle: gameState.declaredSuit
          ? `Demanded suit: ${gameState.declaredSuit.toUpperCase()}`
          : 'Demanding a new suit',
        type: 'jack',
      });
      triggerHaptic('medium');
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

    // Check if the most recent log is from a bot
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>INITIALIZING MATCH...</Text>
        </View>
      </View>
    );
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const opponents = gameState.players.filter(p => !p.isHuman);
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1] || null;
  const recentLog = gameState.logs.length > 0 ? gameState.logs[0] : '';
  const latestRoundResult =
    gameState.roundResults.length > 0
      ? gameState.roundResults[gameState.roundResults.length - 1]
      : null;

  const canDraw = isMyTurn && !gameState.pendingPenalty.active;
  const insets = useResponsiveInsets();

  // Animated Player Play Card
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

  // Animated Player Draw Card
  const handleDrawCardAnimated = () => {
    setFlyingAction({ from: 'deck', to: 'hand' });
    triggerHaptic('medium');
    soundManager.playCardDraw();
    setTimeout(() => {
      drawCard();
      setFlyingAction(null);
    }, 180);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Header with safe area insets */}
      <View style={{ paddingTop: insets.top, backgroundColor: 'rgba(7, 11, 20, 0.98)' }}>
        <TableHeader
          roundNumber={gameState.roundNumber}
          activePlayerName={activePlayer ? activePlayer.name : ''}
          isMyTurn={isMyTurn}
          onOpenScoreboard={onOpenScoreboard}
          onOpenRules={onOpenRules}
        />
      </View>

      {/* Opponents Row */}
      <View style={styles.opponentsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.opponentsScroll}
        >
          {opponents.map(opp => (
            <OpponentSeat
              key={opp.id}
              player={opp}
              isCurrentTurn={opp.id === activePlayer?.id}
            />
          ))}
        </ScrollView>
      </View>

      {/* Central Felt Table */}
      <View style={styles.tableFelt}>
        {/* Table Felt Rail Border with Impact Shake */}
        <Animated.View
          style={[
            styles.feltBorderFrame,
            { transform: [{ translateX: tableShakeAnim }] },
          ]}
        >
          {/* Brass Corner Brackets */}
          <View style={[styles.brassBracket, styles.bracketTopLeft]} />
          <View style={[styles.brassBracket, styles.bracketTopRight]} />
          <View style={[styles.brassBracket, styles.bracketBottomLeft]} />
          <View style={[styles.brassBracket, styles.bracketBottomRight]} />

          {/* Table Ambient Center Lighting Highlight */}
          <View style={styles.tableCenterAura} pointerEvents="none" />

          {/* Inner hairline gold ring */}
          <View style={styles.innerFeltBorder}>
            {/* Felt Table Center Watermark */}
            <View style={styles.feltWatermark} pointerEvents="none">
              <Text style={styles.watermarkSuits}>♠  ♥  ♦  ♣</Text>
              <Text style={styles.watermarkTitle}>OUTLAST 502</Text>
              <View style={styles.watermarkRing} />
            </View>

            {/* Recent Action Banner */}
            {recentLog ? (
              <View style={styles.logBanner}>
                {gameState.pendingPenalty.active ? (
                  <Flame size={12} color={Colors.crimsonLight} style={{ marginRight: 6 }} />
                ) : (
                  <Sparkles size={11} color={Colors.playableBlue} style={{ marginRight: 6 }} />
                )}
                <Text style={styles.logText} numberOfLines={1}>
                  {recentLog}
                </Text>
              </View>
            ) : <View style={{ height: 26 }} />}

            {/* Center Piles (Draw & Discard) */}
            <View style={styles.centerPilesRow}>
              <DrawPile
                count={gameState.drawPile.length}
                canDraw={canDraw}
                onDraw={handleDrawCardAnimated}
              />

              <View style={styles.pileSeparator} />

              <DiscardPile
                topCard={topDiscard}
                declaredSuit={gameState.declaredSuit}
                count={gameState.discardPile.length}
              />
            </View>

            {/* Motion Overlay Layer for dealing & flying cards */}
            <TableMotionOverlay
              isDealing={isDealing}
              flyingAction={flyingAction}
              specialEvent={specialEvent}
            />

            {/* Subtle table footer guideline */}
            <View style={styles.tableFooterStatus}>
              <Text style={styles.tableFooterText}>
                {gameState.pendingPenalty.active
                  ? `⚡ PENALTY ACTIVE · ${gameState.pendingPenalty.cardsOwed} CARDS OWED`
                  : gameState.declaredSuit
                  ? `SUIT DEMANDED · ${gameState.declaredSuit.toUpperCase()}`
                  : `STANDARD SHEDDING · DECK: ${gameState.drawPile.length}`}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Pending Penalty Alert Banner */}
      {isMyTurn && gameState.pendingPenalty.active && (
        <PenaltyModal
          pendingPenalty={gameState.pendingPenalty}
          hasCounterCard={hasCounterToPenalty}
          onAcceptPenalty={acceptPenalty}
        />
      )}

      {/* Human Player Hand Area with bottom safe area inset */}
      <View style={[styles.playerHandSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <CardHand
          hand={myPlayerHand}
          playableCardIds={playableCardIds}
          onCardPress={handlePlayCardAnimated}
          isMyTurn={isMyTurn}
        />
      </View>

      {/* Modals */}
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
    backgroundColor: '#060a12',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.badge,
    color: Colors.silverLight,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  opponentsContainer: {
    paddingVertical: 6,
    backgroundColor: 'rgba(7, 11, 20, 0.98)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(56, 189, 248, 0.15)',
  },
  opponentsScroll: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableFelt: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  feltBorderFrame: {
    flex: 1,
    backgroundColor: '#0b1426',
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#04070e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  brassBracket: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#f59e0b',
    zIndex: 5,
  },
  bracketTopLeft: {
    top: 4,
    left: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  bracketTopRight: {
    top: 4,
    right: 4,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bracketBottomLeft: {
    bottom: 4,
    left: 4,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bracketBottomRight: {
    bottom: 4,
    right: 4,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  tableCenterAura: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    right: '15%',
    bottom: '20%',
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.03)',
  },
  innerFeltBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 18,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
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
  watermarkSuits: {
    color: 'rgba(251, 191, 36, 0.04)',
    fontSize: 26,
    letterSpacing: 8,
    marginBottom: 4,
  },
  watermarkTitle: {
    ...Typography.badge,
    color: 'rgba(251, 191, 36, 0.04)',
    fontSize: 16,
    letterSpacing: 4,
  },
  watermarkRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.03)',
  },
  tableFooterStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  tableFooterText: {
    ...Typography.badge,
    fontSize: 8.5,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  logBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 11, 20, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  logText: {
    color: Colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerPilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  pileSeparator: {
    width: 26,
  },
  playerHandSection: {
    backgroundColor: 'rgba(7, 11, 20, 0.98)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(56, 189, 248, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
});
