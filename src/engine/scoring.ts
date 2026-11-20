import { Card } from '../types/card';
import { Player } from '../types/game';

/**
 * Point values according to the official 502 scoring table:
 * - 7♥ and A♠: 100 points
 * - 2, 8, Jack: 30 points
 * - A♥, A♦, A♣: 20 points
 * - 10, Queen, King: 10 points
 * - 3, 4, 5, 6, 9, other 7s: 5 points
 */
export function calculateCardPoints(card: Card): number {
  if (card.rank === '7' && card.suit === 'hearts') {
    return 100;
  }
  if (card.rank === 'A' && card.suit === 'spades') {
    return 100;
  }
  if (card.rank === '2' || card.rank === '8' || card.rank === 'J') {
    return 30;
  }
  if (card.rank === 'A') {
    return 20; // A♥, A♦, A♣
  }
  if (card.rank === '10' || card.rank === 'Q' || card.rank === 'K') {
    return 10;
  }
  // 3, 4, 5, 6, 9, and other 7s (7♠, 7♦, 7♣)
  return 5;
}

/**
 * Calculates the total point value of a hand.
 */
export function calculateHandPoints(hand: Card[]): number {
  return hand.reduce((total, card) => total + calculateCardPoints(card), 0);
}

/**
 * Calculates scores for all players at the end of a round.
 *
 * Rules:
 * - If won by emptying hand (hand.length === 0): winner scores 0.
 * - If won by 7♥: winner scores the value of all remaining cards in their hand.
 * - All other players score the value of all remaining cards in their hands.
 */
export function calculateRoundScores(
  players: Player[],
  winnerId: string,
  winReason: 'empty_hand' | 'seven_of_hearts'
): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const player of players) {
    if (player.isEliminated) {
      scores[player.id] = 0;
      continue;
    }

    if (player.id === winnerId) {
      if (winReason === 'empty_hand') {
        scores[player.id] = 0;
      } else {
        // seven_of_hearts winner counts remaining cards
        scores[player.id] = calculateHandPoints(player.hand);
      }
    } else {
      scores[player.id] = calculateHandPoints(player.hand);
    }
  }

  return scores;
}
