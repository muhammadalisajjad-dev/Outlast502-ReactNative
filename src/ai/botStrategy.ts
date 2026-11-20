import { Card, Suit, SUITS } from '../types/card';
import { GameState, Player } from '../types/game';
import { getPlayableCards } from '../engine/rules';
import { calculateHandPoints } from '../engine/scoring';

export type BotDecision =
  | { type: 'PLAY_CARD'; cardId: string; declaredSuit?: Suit }
  | { type: 'DRAW_CARD' }
  | { type: 'ACCEPT_PENALTY' };

/**
 * Chooses the best suit for the bot to declare when playing a Jack.
 * Selects the suit the bot holds the most cards in (excluding the Jack itself).
 */
export function chooseBestJackSuit(hand: Card[], jackId: string): Suit {
  const suitCounts: Record<Suit, number> = {
    spades: 0,
    hearts: 0,
    diamonds: 0,
    clubs: 0,
  };

  for (const card of hand) {
    if (card.id !== jackId) {
      suitCounts[card.suit]++;
    }
  }

  let bestSuit: Suit = 'spades';
  let maxCount = -1;

  for (const suit of SUITS) {
    if (suitCounts[suit] > maxCount) {
      maxCount = suitCounts[suit];
      bestSuit = suit;
    }
  }

  return bestSuit;
}

/**
 * Decides the bot's move based on current game state.
 *
 * Rules:
 * 1. If penalty is pending:
 *    - Play matching counter card (2 against 2, Ace against Ace, 8 against skip) if held.
 *    - Otherwise accept penalty.
 * 2. If no penalty is pending:
 *    - If no playable card: draw card.
 *    - If 7♥ is playable:
 *      - Evaluate hand cost without 7♥. If low (<= 30) or any opponent is low on cards (<= 2), play 7♥!
 *    - Otherwise choose the highest-penalty card to shed risk (A♠, 2, 8, J, etc.)
 *    - If playing a Jack, pick optimal suit.
 */
export function decideBotMove(state: GameState, botPlayer: Player): BotDecision {
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  // 1. Pending penalty active
  if (state.pendingPenalty.active && state.pendingPenalty.type !== null) {
    const pType = state.pendingPenalty.type;
    let counterCard: Card | undefined;

    if (pType === 'two') {
      counterCard = botPlayer.hand.find(c => c.rank === '2');
    } else if (pType === 'ace') {
      counterCard = botPlayer.hand.find(c => c.rank === 'A');
    } else if (pType === 'skip') {
      counterCard = botPlayer.hand.find(c => c.rank === '8');
    }

    if (counterCard) {
      return {
        type: 'PLAY_CARD',
        cardId: counterCard.id,
      };
    }

    return { type: 'ACCEPT_PENALTY' };
  }

  // 2. Normal turn
  const playable = getPlayableCards(
    botPlayer.hand,
    topDiscard,
    state.declaredSuit,
    state.pendingPenalty
  );

  if (playable.length === 0) {
    return { type: 'DRAW_CARD' };
  }

  // Check 7 of Hearts
  const sevenOfHearts = playable.find(c => c.rank === '7' && c.suit === 'hearts');
  if (sevenOfHearts) {
    const remainingCards = botPlayer.hand.filter(c => c.id !== sevenOfHearts.id);
    const handCost = calculateHandPoints(remainingCards);
    const anyOpponentLow = state.players.some(
      p => p.id !== botPlayer.id && !p.isEliminated && p.hand.length <= 2
    );

    // Play 7♥ if safe hand cost, opponent about to go out, or it's our only card!
    if (handCost <= 30 || anyOpponentLow || remainingCards.length === 0) {
      return {
        type: 'PLAY_CARD',
        cardId: sevenOfHearts.id,
      };
    }
  }

  // Prefer shedding high-scoring danger cards first (Ace of Spades, 2s, 8s, Jacks)
  const sortedPlayable = [...playable].sort((a, b) => {
    // Priority order: A♠ (100) -> 2, 8, J (30) -> other Aces (20) -> 10, Q, K (10) -> others (5)
    const scoreA = (a.rank === 'A' && a.suit === 'spades') ? 100 : (a.rank === '2' || a.rank === '8' || a.rank === 'J') ? 30 : a.rank === 'A' ? 20 : (a.rank === '10' || a.rank === 'Q' || a.rank === 'K') ? 10 : 5;
    const scoreB = (b.rank === 'A' && b.suit === 'spades') ? 100 : (b.rank === '2' || b.rank === '8' || b.rank === 'J') ? 30 : b.rank === 'A' ? 20 : (b.rank === '10' || b.rank === 'Q' || b.rank === 'K') ? 10 : 5;
    return scoreB - scoreA;
  });

  const chosenCard = sortedPlayable[0];

  if (chosenCard.rank === 'J') {
    const declaredSuit = chooseBestJackSuit(botPlayer.hand, chosenCard.id);
    return {
      type: 'PLAY_CARD',
      cardId: chosenCard.id,
      declaredSuit,
    };
  }

  return {
    type: 'PLAY_CARD',
    cardId: chosenCard.id,
  };
}
