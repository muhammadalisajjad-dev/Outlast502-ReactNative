export interface PlayerHistoryScore {
  playerId: string;
  name: string;
  isHuman: boolean;
  finalScore: number;
  isEliminated: boolean;
  isWinner: boolean;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  totalRounds: number;
  playerCount: number;
  winnerName: string;
  players: PlayerHistoryScore[];
  syncedToFirebase?: boolean;
}
