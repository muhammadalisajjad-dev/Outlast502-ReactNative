import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Sparkles } from 'lucide-react-native';

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

  if (!gameState) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>INITIALIZING MATCH...</Text>
        </View>
      </SafeAreaView>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Header */}
      <TableHeader
        roundNumber={gameState.roundNumber}
        activePlayerName={activePlayer ? activePlayer.name : ''}
        isMyTurn={isMyTurn}
        onOpenScoreboard={onOpenScoreboard}
        onOpenRules={onOpenRules}
      />

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
        {/* Table Felt Rail Border */}
        <View style={styles.feltBorderFrame}>
          {/* Inner hairline gold ring */}
          <View style={styles.innerFeltBorder}>
            {/* Felt Table Center Watermark */}
            <View style={styles.feltWatermark}>
              <Text style={styles.watermarkSuits}>♠  ♥  ♦  ♣</Text>
              <Text style={styles.watermarkTitle}>OUTLAST 502</Text>
              <View style={styles.watermarkRing} />
            </View>

            {/* Recent Action Banner */}
            {recentLog ? (
              <View style={styles.logBanner}>
                <Sparkles size={11} color={Colors.gold} style={{ marginRight: 6 }} />
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
                onDraw={drawCard}
              />

              <View style={styles.pileSeparator} />

              <DiscardPile
                topCard={topDiscard}
                declaredSuit={gameState.declaredSuit}
                count={gameState.discardPile.length}
              />
            </View>

            {/* Subtle table footer guideline */}
            <View style={styles.tableFooterStatus}>
              <Text style={styles.tableFooterText}>
                {gameState.pendingPenalty.active
                  ? `PENALTY ACTIVE · ${gameState.pendingPenalty.cardsOwed} CARDS OWED`
                  : gameState.declaredSuit
                  ? `SUIT DEMANDED · ${gameState.declaredSuit.toUpperCase()}`
                  : `STANDARD SHEDDING · DECK: ${gameState.drawPile.length}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pending Penalty Alert Banner */}
      {isMyTurn && gameState.pendingPenalty.active && (
        <PenaltyModal
          pendingPenalty={gameState.pendingPenalty}
          hasCounterCard={hasCounterToPenalty}
          onAcceptPenalty={acceptPenalty}
        />
      )}

      {/* Human Player Hand Area */}
      <View style={styles.playerHandSection}>
        <CardHand
          hand={myPlayerHand}
          playableCardIds={playableCardIds}
          onCardPress={card => playCard(card)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.tableDeep,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.badge,
    color: Colors.goldLight,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  opponentsContainer: {
    paddingVertical: 6,
    backgroundColor: 'rgba(6, 19, 13, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(203, 178, 106, 0.12)',
  },
  opponentsScroll: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableFelt: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  feltBorderFrame: {
    flex: 1,
    backgroundColor: Colors.tableFelt,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: Colors.tableRail,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  innerFeltBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(203, 178, 106, 0.15)',
    borderRadius: 16,
    padding: 10,
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
    color: 'rgba(203, 178, 106, 0.05)',
    fontSize: 24,
    letterSpacing: 8,
    marginBottom: 4,
  },
  watermarkTitle: {
    ...Typography.badge,
    color: 'rgba(203, 178, 106, 0.04)',
    fontSize: 16,
    letterSpacing: 4,
  },
  watermarkRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(203, 178, 106, 0.03)',
  },
  tableFooterStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(6, 19, 13, 0.6)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(203, 178, 106, 0.15)',
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
    backgroundColor: 'rgba(6, 19, 13, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(203, 178, 106, 0.2)',
    maxWidth: '92%',
  },
  logText: {
    color: Colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerPilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  pileSeparator: {
    width: 28,
  },
  playerHandSection: {
    backgroundColor: 'rgba(6, 19, 13, 0.98)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(203, 178, 106, 0.25)',
  },
});
