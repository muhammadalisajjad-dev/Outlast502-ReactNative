import { Card, Suit } from '../types/card';
import { PenaltyState } from '../types/game';

/**
 * Checks whether a card can be legally played in the current state.
 *
 * Rules:
 * 1. Pending penalties take absolute precedence:
 *    - 2-penalty: only a 2 can be played.
 *    - Ace-penalty: only an Ace can be played.
 *    - Skip-penalty: only an 8 can be played.
 *    - Jack and 7♥ CANNOT cancel or answer a pending penalty!
 * 2. Normal play:
 *    - Jack (any suit) is wild and can be played on any normal card.
 *    - 7 of Hearts (7♥) is wild and can be played on any normal card.
 *    - If a declared suit is active (from a prior Jack), the card must match declared suit (or be a Jack or 7♥).
 *    - Otherwise, card must match discard top card by suit or rank.
 */
export function isLegalPlay(
  card: Card,
  topDiscard: Card,
  declaredSuit: Suit | null,
  pendingPenalty: PenaltyState
): boolean {
  // 1. Pending penalty takes precedence
  if (pendingPenalty.active && pendingPenalty.type !== null) {
    if (pendingPenalty.type === 'two') {
      return card.rank === '2';
    }
    if (pendingPenalty.type === 'ace') {
      return card.rank === 'A';
    }
    if (pendingPenalty.type === 'skip') {
      return card.rank === '8';
    }
    return false;
  }

  // 2. Normal play (no pending penalty)
  // Jack is wild on any card
  if (card.rank === 'J') {
    return true;
  }

  // 7 of Hearts is wild on any card
  if (card.rank === '7' && card.suit === 'hearts') {
    return true;
  }

  // If a Jack previously declared a suit
  if (declaredSuit !== null) {
    return card.suit === declaredSuit;
  }

  // Match by suit or by rank
  return card.suit === topDiscard.suit || card.rank === topDiscard.rank;
}

/**
 * Returns all cards in the player's hand that are legal to play.
 */
export function getPlayableCards(
  hand: Card[],
  topDiscard: Card,
  declaredSuit: Suit | null,
  pendingPenalty: PenaltyState
): Card[] {
  return hand.filter(card =>
    isLegalPlay(card, topDiscard, declaredSuit, pendingPenalty)
  );
}

/**
 * Checks if the player has any legal counter to a pending penalty.
 */
export function hasPenaltyCounter(
  hand: Card[],
  pendingPenalty: PenaltyState
): boolean {
  if (!pendingPenalty.active || pendingPenalty.type === null) return false;
  if (pendingPenalty.type === 'two') {
    return hand.some(c => c.rank === '2');
  }
  if (pendingPenalty.type === 'ace') {
    return hand.some(c => c.rank === 'A');
  }
  if (pendingPenalty.type === 'skip') {
    return hand.some(c => c.rank === '8');
  }
  return false;
}
