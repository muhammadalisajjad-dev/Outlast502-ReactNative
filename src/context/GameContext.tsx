import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { GameState, MatchPhase, Player } from '../types/game';
import { Card, Suit } from '../types/card';
import { MatchRecord, PlayerHistoryScore } from '../types/history';
import {
  initMatch,
  initRound,
  executePlayCard,
  executeDrawCard,
  executeAcceptPenalty,
} from '../engine/gameEngine';
import { getPlayableCards, hasPenaltyCounter } from '../engine/rules';
import { decideBotMove } from '../ai/botStrategy';
import { botThinkDelay } from '../ai/botTiming';
import { saveMatchHistory } from '../services/storage';
import { syncMatchToFirebase } from '../services/firebase';

interface GameContextType {
  gameState: GameState | null;
  matchPhase: MatchPhase;
  isMyTurn: boolean;
  myPlayerHand: Card[];
  playableCardIds: Set<string>;
  hasCounterToPenalty: boolean;
  pendingJackCard: Card | null;
  startMatch: (playerCount?: number, humanName?: string) => void;
  playCard: (card: Card, declaredSuit?: Suit) => void;
  confirmJackSuit: (suit: Suit) => void;
  drawCard: () => void;
  acceptPenalty: () => void;
  startNextRound: () => void;
  resetMatch: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

/** Applies an already-calculated bot decision to the engine state. */
function applyBotDecision(
  state: GameState,
  bot: Player,
  decision: ReturnType<typeof decideBotMove>
): GameState {
  if (decision.type === 'PLAY_CARD') {
    return executePlayCard(state, bot.id, decision.cardId, decision.declaredSuit);
  }
  if (decision.type === 'DRAW_CARD') {
    return executeDrawCard(state, bot.id);
  }
  return executeAcceptPenalty(state, bot.id);
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [pendingJackCard, setPendingJackCard] = useState<Card | null>(null);
  const botTimerRef = useRef<any>(null);
  const savedMatchRef = useRef<boolean>(false);

  // Initialize a default match on startup
  useEffect(() => {
    const initial = initMatch(4, 'You');
    setGameState(initial);
  }, []);

  const currentPlayer = gameState ? gameState.players[gameState.activePlayerIndex] : null;
  const isMyTurn = Boolean(
    gameState &&
      gameState.matchPhase === 'in_round' &&
      currentPlayer &&
      currentPlayer.isHuman
  );

  const humanPlayer = gameState ? gameState.players.find(p => p.isHuman) : null;
  const myPlayerHand = humanPlayer ? humanPlayer.hand : [];

  const topDiscard =
    gameState && gameState.discardPile.length > 0
      ? gameState.discardPile[gameState.discardPile.length - 1]
      : null;

  const playableCards =
    gameState && topDiscard && humanPlayer
      ? getPlayableCards(
          humanPlayer.hand,
          topDiscard,
          gameState.declaredSuit,
          gameState.pendingPenalty
        )
      : [];

  const playableCardIds = new Set(playableCards.map(c => c.id));

  const hasCounterToPenalty = Boolean(
    gameState &&
      humanPlayer &&
      hasPenaltyCounter(humanPlayer.hand, gameState.pendingPenalty)
  );

  // Automatic match completion persistence
  useEffect(() => {
    if (!gameState || gameState.matchPhase !== 'match_over') {
      savedMatchRef.current = false;
      return;
    }

    if (savedMatchRef.current) return;
    savedMatchRef.current = true;

    const winner = gameState.players.find(p => p.id === gameState.matchWinnerId);
    const historyPlayers: PlayerHistoryScore[] = gameState.players.map(p => ({
      playerId: p.id,
      name: p.name,
      isHuman: p.isHuman,
      finalScore: p.cumulativeScore,
      isEliminated: p.isEliminated,
      isWinner: p.id === gameState.matchWinnerId,
    }));

    const record: MatchRecord = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      totalRounds: gameState.roundNumber,
      playerCount: gameState.players.length,
      winnerName: winner ? winner.name : 'Unknown',
      players: historyPlayers,
    };

    saveMatchHistory(record);
    syncMatchToFirebase(record);
  }, [gameState]);

  // Orchestrate Bot turns with realistic thinking delays
  useEffect(() => {
    if (!gameState || gameState.matchPhase !== 'in_round') {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      return;
    }

    const current = gameState.players[gameState.activePlayerIndex];
    if (!current || current.isHuman || current.isEliminated) {
      return;
    }

    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    // Decide as soon as the turn begins so the pause reflects the decision
    // the bot actually faces, then apply it after that pause.
    const decision = decideBotMove(gameState, current);
    const thinkDelay = botThinkDelay(decision, gameState, current);

    botTimerRef.current = setTimeout(() => {
      setGameState(prevState => {
        if (!prevState || prevState.matchPhase !== 'in_round') return prevState;
        const bot = prevState.players[prevState.activePlayerIndex];
        if (!bot || bot.isHuman || bot.isEliminated) return prevState;

        try {
          return applyBotDecision(prevState, bot, decideBotMove(prevState, bot));
        } catch (e) {
          console.error('Error executing bot move:', e);
        }
        return prevState;
      });
    }, thinkDelay);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameState?.activePlayerIndex, gameState?.matchPhase]);

  const startMatchHandler = (playerCount: number = 4, humanName: string = 'You') => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    const newMatch = initMatch(playerCount, humanName);
    setGameState(newMatch);
    setPendingJackCard(null);
  };

  const playCardHandler = (card: Card, declaredSuit?: Suit) => {
    if (!gameState || !humanPlayer) return;

    // If card is a Jack and no suit declared yet, show suit picker modal
    if (card.rank === 'J' && !declaredSuit) {
      setPendingJackCard(card);
      return;
    }

    try {
      const nextState = executePlayCard(
        gameState,
        humanPlayer.id,
        card.id,
        declaredSuit
      );
      setGameState(nextState);
      setPendingJackCard(null);
    } catch (e) {
      console.warn('Play card rejected:', e);
    }
  };

  const confirmJackSuitHandler = (suit: Suit) => {
    if (!pendingJackCard || !gameState || !humanPlayer) return;
    try {
      const nextState = executePlayCard(
        gameState,
        humanPlayer.id,
        pendingJackCard.id,
        suit
      );
      setGameState(nextState);
    } catch (e) {
      console.warn('Confirm Jack suit rejected:', e);
    } finally {
      setPendingJackCard(null);
    }
  };

  const drawCardHandler = () => {
    if (!gameState || !humanPlayer) return;
    try {
      const nextState = executeDrawCard(gameState, humanPlayer.id);
      setGameState(nextState);
    } catch (e) {
      console.warn('Draw card rejected:', e);
    }
  };

  const acceptPenaltyHandler = () => {
    if (!gameState || !humanPlayer) return;
    try {
      const nextState = executeAcceptPenalty(gameState, humanPlayer.id);
      setGameState(nextState);
    } catch (e) {
      console.warn('Accept penalty rejected:', e);
    }
  };

  const startNextRoundHandler = () => {
    if (!gameState) return;
    try {
      const nextState = initRound(gameState);
      setGameState(nextState);
    } catch (e) {
      console.warn('Start next round rejected:', e);
    }
  };

  const resetMatchHandler = () => {
    if (!gameState) return;
    startMatchHandler(gameState.players.length, humanPlayer?.name || 'You');
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        matchPhase: gameState ? gameState.matchPhase : 'idle',
        isMyTurn,
        myPlayerHand,
        playableCardIds,
        hasCounterToPenalty,
        pendingJackCard,
        startMatch: startMatchHandler,
        playCard: playCardHandler,
        confirmJackSuit: confirmJackSuitHandler,
        drawCard: drawCardHandler,
        acceptPenalty: acceptPenaltyHandler,
        startNextRound: startNextRoundHandler,
        resetMatch: resetMatchHandler,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
