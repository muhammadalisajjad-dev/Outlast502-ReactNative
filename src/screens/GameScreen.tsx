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
          <Text style={styles.loadingText}>Initializing Match...</Text>
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
          {/* Recent Action Banner / Marquee */}
          <View style={styles.logBanner}>
            <Text style={styles.logText} numberOfLines={1}>
              {recentLog}
            </Text>
          </View>

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
    color: Colors.goldLight,
    fontSize: 16,
    fontWeight: '700',
  },
  opponentsContainer: {
    paddingVertical: 8,
    backgroundColor: 'rgba(6, 26, 17, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  opponentsScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tableFelt: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  feltBorderFrame: {
    flex: 1,
    backgroundColor: Colors.tableFelt,
    borderRadius: 24,
    borderWidth: 6,
    borderColor: Colors.tableRail,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  logBanner: {
    backgroundColor: 'rgba(6, 26, 17, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    maxWidth: '90%',
  },
  logText: {
    color: Colors.textSecondary,
    fontSize: 11,
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
    width: 36,
  },
  playerHandSection: {
    backgroundColor: 'rgba(6, 26, 17, 0.95)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
  },
});
