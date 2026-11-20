import { Card, Suit } from './card';

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  cumulativeScore: number;
  lastRoundScore: number;
  isEliminated: boolean;
  immuneThisRound: boolean;
  avatarSeed: number;
}

export type PendingPenaltyType = 'two' | 'ace' | 'skip' | null;

export interface PenaltyState {
  type: PendingPenaltyType;
  cardsOwed: number; // For 'two': 2, 4, 6, 8. For 'ace': 5. For 'skip': 0
  active: boolean;
}

export type MatchPhase =
  | 'idle'
  | 'setup'
  | 'in_round'
  | 'round_over'
  | 'match_over';

export interface RoundResult {
  roundNumber: number;
  winnerId: string;
  winnerName: string;
  winReason: 'empty_hand' | 'seven_of_hearts';
  playerRoundScores: Record<string, number>;
  eliminatedPlayerIds: string[];
  lastCardPlayed?: Card;
  forcedPenaltyPlayerId?: string;
  forcedPenaltyCards?: number;
}

export interface GameState {
  matchPhase: MatchPhase;
  roundNumber: number;
  players: Player[];
  activePlayerIndex: number; // Index into players array
  drawPile: Card[];
  discardPile: Card[];
  declaredSuit: Suit | null; // Set when Jack is played
  pendingPenalty: PenaltyState;
  roundResults: RoundResult[];
  matchWinnerId: string | null;
  logs: string[];
}

export type GameAction =
  | { type: 'START_MATCH'; playerCount: number; humanName?: string }
  | { type: 'START_NEXT_ROUND' }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string; declaredSuit?: Suit }
  | { type: 'DRAW_CARD'; playerId: string }
  | { type: 'ACCEPT_PENALTY'; playerId: string }
  | { type: 'SELECT_JACK_SUIT'; playerId: string; suit: Suit }
  | { type: 'RESET_MATCH' };
