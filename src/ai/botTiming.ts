import { GameState, Player } from '../types/game';
import { getPlayableCards } from '../engine/rules';
import { decideBotMove } from './botStrategy';

/**
 * How long a bot pauses before acting.
 *
 * The delay is derived from the decision the bot actually has to make, not
 * from a fixed timer and not from randomness:
 * - Accepting a penalty is forced, so it needs no deliberation.
 * - Drawing means the bot had no playable card, so there was no choice.
 * - A single legal card is also a foregone conclusion.
 * - Choosing between several cards, or weighing an instant-win 7♥, are the
 *   only turns that involve a real decision and get the longest pause.
 *
 * Keeping the pause tied to the decision keeps the table moving while still
 * letting genuine choices read as choices.
 */
export function botThinkDelay(
  decision: ReturnType<typeof decideBotMove>,
  state: GameState,
  bot: Player
): number {
  if (decision.type === 'ACCEPT_PENALTY') return 260;
  if (decision.type === 'DRAW_CARD') return 300;

  const top = state.discardPile[state.discardPile.length - 1];
  const playable = top
    ? getPlayableCards(bot.hand, top, state.declaredSuit, state.pendingPenalty)
    : [];
  const chosen = decision.cardId
    ? bot.hand.find(c => c.id === decision.cardId)
    : null;

  if (chosen && chosen.rank === '7' && chosen.suit === 'hearts') return 620;
  if (playable.length <= 1) return 340;
  return 520;
}
