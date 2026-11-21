import { Card, Suit } from '../types/card';
import {
  GameState,
  Player,
  RoundResult,
  MatchPhase,
} from '../types/game';
import {
  createStandardDeck,
  shuffleDeck,
  drawCards,
  getValidOpeningCard,
} from './deck';
import { isLegalPlay } from './rules';
import {
  INITIAL_PENALTY_STATE,
  calculateNextPenaltyState,
} from './penalties';
import { calculateRoundScores } from './scoring';
import { evaluateEliminationAndWinner } from './elimination';
import { getNextActivePlayerIndex } from './turn';

const BOT_NAMES = ['Marcus', 'Sophia', 'Elena', 'Liam', 'Zoe'];

/**
 * Possessive form for log copy. The human seat is usually named "You", where
 * the mechanical `${name}'s` would read "You's".
 */
function possessiveName(name: string): string {
  return name.trim().toLowerCase() === 'you' ? 'Your' : `${name}'s`;
}

/**
 * Initializes a new match with 2 to 6 players.
 */
export function initMatch(
  playerCount: number = 4,
  humanName: string = 'You'
): GameState {
  const count = Math.max(2, Math.min(6, playerCount));
  const players: Player[] = [];

  // Player 0 is the human
  players.push({
    id: 'player_0',
    name: humanName,
    isHuman: true,
    hand: [],
    cumulativeScore: 0,
    lastRoundScore: 0,
    isEliminated: false,
    immuneThisRound: false,
    avatarSeed: 0,
  });

  // Computer opponents
  for (let i = 1; i < count; i++) {
    players.push({
      id: `player_${i}`,
      name: BOT_NAMES[i - 1] || `Bot ${i}`,
      isHuman: false,
      hand: [],
      cumulativeScore: 0,
      lastRoundScore: 0,
      isEliminated: false,
      immuneThisRound: false,
      avatarSeed: i,
    });
  }

  const initialState: GameState = {
    matchPhase: 'setup',
    roundNumber: 0,
    players,
    activePlayerIndex: 0,
    drawPile: [],
    discardPile: [],
    declaredSuit: null,
    pendingPenalty: INITIAL_PENALTY_STATE,
    roundResults: [],
    matchWinnerId: null,
    logs: ['Match initialized.'],
  };

  return initRound(initialState);
}

/**
 * Starts a new round.
 * Deals 7 cards to each active player, flips a neutral opening card,
 * and sets the turn to the designated starting player.
 */
export function initRound(state: GameState, rng: () => number = Math.random): GameState {
  const roundNumber = state.roundNumber + 1;
  const activePlayers = state.players.filter(p => !p.isEliminated);

  if (activePlayers.length <= 1) {
    return {
      ...state,
      matchPhase: 'match_over',
    };
  }

  // Clear temporary round immunity from previous round
  let currentPlayers: Player[] = state.players.map(p => ({
    ...p,
    hand: [] as Card[],
    immuneThisRound: false,
  }));

  // Create and shuffle standard 52-card deck
  let deck = shuffleDeck(createStandardDeck(), rng);

  // Deal 7 cards to each active player
  for (let round = 0; round < 7; round++) {
    for (let pIdx = 0; pIdx < currentPlayers.length; pIdx++) {
      if (!currentPlayers[pIdx].isEliminated) {
        const card = deck.shift()!;
        currentPlayers[pIdx].hand.push(card);
      }
    }
  }

  // Turn up neutral opening card (rejects 2, J, A, 7♥, 8)
  const { openingCard, updatedDrawPile } = getValidOpeningCard(deck);
  const discardPile = [openingCard];

  // Determine starting player:
  // Round 1: first active player (human seat 0)
  // Round > 1: Winner of previous round (as per spec)
  let starterIndex = 0;
  if (state.roundResults.length > 0) {
    const lastWinnerId = state.roundResults[state.roundResults.length - 1].winnerId;
    const foundIdx = currentPlayers.findIndex(p => p.id === lastWinnerId);
    if (foundIdx !== -1 && !currentPlayers[foundIdx].isEliminated) {
      starterIndex = foundIdx;
    } else {
      starterIndex = getNextActivePlayerIndex(currentPlayers, 0, 0);
    }
  } else {
    // Round 1
    starterIndex = currentPlayers.findIndex(p => !p.isEliminated);
  }

  return {
    ...state,
    matchPhase: 'in_round',
    roundNumber,
    players: currentPlayers,
    activePlayerIndex: starterIndex,
    drawPile: updatedDrawPile,
    discardPile,
    declaredSuit: null,
    pendingPenalty: INITIAL_PENALTY_STATE,
    logs: [
      `Round ${roundNumber} started. Neutral opening card: ${openingCard.rank} of ${openingCard.suit}. ${possessiveName(currentPlayers[starterIndex].name)} turn.`,
      ...state.logs,
    ],
  };
}

/**
 * Executes playing a card.
 */
export function executePlayCard(
  state: GameState,
  playerId: string,
  cardId: string,
  declaredSuit?: Suit,
  rng: () => number = Math.random
): GameState {
  if (state.matchPhase !== 'in_round') {
    throw new Error('Cannot play card when match is not in an active round');
  }

  const currentPlayer = state.players[state.activePlayerIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error(`It is ${currentPlayer.name}'s turn, not ${playerId}`);
  }

  const cardIndex = currentPlayer.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error(`Card ${cardId} is not in ${currentPlayer.name}'s hand`);
  }

  const card = currentPlayer.hand[cardIndex];
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  // Validate legality
  if (!isLegalPlay(card, topDiscard, state.declaredSuit, state.pendingPenalty)) {
    throw new Error(`Card ${card.rank} of ${card.suit} is not legal to play`);
  }

  // Handle Jack suit declaration
  if (card.rank === 'J' && !declaredSuit) {
    throw new Error('Must declare a suit when playing a Jack');
  }

  // Remove card from hand
  const newHand = currentPlayer.hand.filter((_, idx) => idx !== cardIndex);
  let updatedPlayers = state.players.map((p, idx) =>
    idx === state.activePlayerIndex ? { ...p, hand: newHand } : p
  );

  const newDiscardPile = [...state.discardPile, card];
  let logs = [`${currentPlayer.name} played ${card.rank} of ${card.suit}.`, ...state.logs];

  // Check round end conditions:
  // 1. Hand emptied
  // 2. Played 7 of Hearts
  const isSevenOfHearts = card.rank === '7' && card.suit === 'hearts';
  const isHandEmpty = newHand.length === 0;

  if (isHandEmpty || isSevenOfHearts) {
    const winReason = isSevenOfHearts ? 'seven_of_hearts' : 'empty_hand';
    let forcedPenaltyPlayerId: string | undefined;
    let forcedPenaltyCards: number | undefined;

    let currentDrawPile = state.drawPile;
    let currentDiscard = newDiscardPile;

    // SPECIAL END-OF-ROUND EXCEPTION:
    // If the winning card is a 2 or A♠, the next player must draw the penalty before scoring!
    // Next player cannot answer it.
    if (card.rank === '2' || (card.rank === 'A' && card.suit === 'spades')) {
      const nextPlayerIdx = getNextActivePlayerIndex(updatedPlayers, state.activePlayerIndex);
      const cardsToDraw = card.rank === '2' ? 2 : 5;
      forcedPenaltyPlayerId = updatedPlayers[nextPlayerIdx].id;
      forcedPenaltyCards = cardsToDraw;

      const drawResult = drawCards(currentDrawPile, currentDiscard, cardsToDraw, rng);
      currentDrawPile = drawResult.newDrawPile;
      currentDiscard = drawResult.newDiscardPile;

      updatedPlayers = updatedPlayers.map((p, idx) =>
        idx === nextPlayerIdx ? { ...p, hand: [...p.hand, ...drawResult.drawn] } : p
      );

      logs = [
        `FINAL PENALTY: ${updatedPlayers[nextPlayerIdx].name} forced to draw ${cardsToDraw} cards before scoring!`,
        ...logs,
      ];
    }

    // Score the round
    const roundScores = calculateRoundScores(updatedPlayers, currentPlayer.id, winReason);

    // Evaluate elimination and match winner
    const eliminationResult = evaluateEliminationAndWinner(
      updatedPlayers,
      roundScores,
      currentPlayer.id
    );

    const roundResult: RoundResult = {
      roundNumber: state.roundNumber,
      winnerId: currentPlayer.id,
      winnerName: currentPlayer.name,
      winReason,
      playerRoundScores: roundScores,
      eliminatedPlayerIds: eliminationResult.eliminatedThisRound,
      lastCardPlayed: card,
      forcedPenaltyPlayerId,
      forcedPenaltyCards,
    };

    const nextPhase: MatchPhase = eliminationResult.isMatchOver ? 'match_over' : 'round_over';

    return {
      ...state,
      matchPhase: nextPhase,
      players: eliminationResult.updatedPlayers,
      drawPile: currentDrawPile,
      discardPile: currentDiscard,
      declaredSuit: null,
      pendingPenalty: INITIAL_PENALTY_STATE,
      roundResults: [...state.roundResults, roundResult],
      matchWinnerId: eliminationResult.matchWinnerId,
      logs: [
        `Round ${state.roundNumber} ended! ${currentPlayer.name} won (${winReason === 'seven_of_hearts' ? '7♥ Instant Win' : 'Emptied Hand'}).`,
        ...logs,
      ],
    };
  }

  // Round continues
  // Calculate new penalty state
  const nextPenalty = calculateNextPenaltyState(card, state.pendingPenalty);
  const nextDeclaredSuit = card.rank === 'J' ? (declaredSuit || null) : null;

  if (card.rank === 'J' && declaredSuit) {
    logs = [`${currentPlayer.name} declared suit: ${declaredSuit.toUpperCase()}.`, ...logs];
  }

  // Advance turn to next active player
  const nextActiveIndex = getNextActivePlayerIndex(updatedPlayers, state.activePlayerIndex);

  return {
    ...state,
    players: updatedPlayers,
    activePlayerIndex: nextActiveIndex,
    discardPile: newDiscardPile,
    declaredSuit: nextDeclaredSuit,
    pendingPenalty: nextPenalty,
    logs,
  };
}

/**
 * Executes drawing one card during a normal turn.
 * Drawing ends the turn immediately (drawn card cannot be played on that turn).
 */
export function executeDrawCard(
  state: GameState,
  playerId: string,
  rng: () => number = Math.random
): GameState {
  if (state.matchPhase !== 'in_round') {
    throw new Error('Cannot draw card when not in active round');
  }

  const currentPlayer = state.players[state.activePlayerIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error(`It is ${currentPlayer.name}'s turn, not ${playerId}`);
  }

  if (state.pendingPenalty.active) {
    throw new Error(
      'A penalty is pending! Must play matching counter or use ACCEPT_PENALTY'
    );
  }

  const { drawn, newDrawPile, newDiscardPile } = drawCards(
    state.drawPile,
    state.discardPile,
    1,
    rng
  );

  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.activePlayerIndex ? { ...p, hand: [...p.hand, ...drawn] } : p
  );

  const nextActiveIndex = getNextActivePlayerIndex(updatedPlayers, state.activePlayerIndex);

  return {
    ...state,
    players: updatedPlayers,
    activePlayerIndex: nextActiveIndex,
    drawPile: newDrawPile,
    discardPile: newDiscardPile,
    logs: [`${currentPlayer.name} drew a card. Turn passed.`, ...state.logs],
  };
}

/**
 * Executes accepting a pending penalty (cannot or chosen not to counter).
 * - For 2-penalty: draws accumulated cards (2, 4, 6, 8).
 * - For Ace-penalty: draws 5 cards.
 * - For 8-skip: loses turn without drawing.
 */
export function executeAcceptPenalty(
  state: GameState,
  playerId: string,
  rng: () => number = Math.random
): GameState {
  if (state.matchPhase !== 'in_round') {
    throw new Error('Cannot accept penalty when not in active round');
  }

  const currentPlayer = state.players[state.activePlayerIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error(`It is ${currentPlayer.name}'s turn, not ${playerId}`);
  }

  if (!state.pendingPenalty.active || !state.pendingPenalty.type) {
    throw new Error('No pending penalty to accept');
  }

  const { type, cardsOwed } = state.pendingPenalty;
  let drawnCards: Card[] = [];
  let currentDrawPile = state.drawPile;
  let currentDiscardPile = state.discardPile;

  if (type === 'two' || type === 'ace') {
    const drawResult = drawCards(currentDrawPile, currentDiscardPile, cardsOwed, rng);
    drawnCards = drawResult.drawn;
    currentDrawPile = drawResult.newDrawPile;
    currentDiscardPile = drawResult.newDiscardPile;
  }

  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.activePlayerIndex ? { ...p, hand: [...p.hand, ...drawnCards] } : p
  );

  const penaltyDesc =
    type === 'skip'
      ? `${currentPlayer.name} was skipped.`
      : `${currentPlayer.name} drew ${cardsOwed} penalty cards (${type === 'two' ? '2-Stack' : 'A♠'}).`;

  const nextActiveIndex = getNextActivePlayerIndex(updatedPlayers, state.activePlayerIndex);

  return {
    ...state,
    players: updatedPlayers,
    activePlayerIndex: nextActiveIndex,
    drawPile: currentDrawPile,
    discardPile: currentDiscardPile,
    pendingPenalty: INITIAL_PENALTY_STATE,
    logs: [penaltyDesc, ...state.logs],
  };
}
