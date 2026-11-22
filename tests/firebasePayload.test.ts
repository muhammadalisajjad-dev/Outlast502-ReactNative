import { buildMatchDocument } from '../src/services/firebase';
import { MatchRecord } from '../src/types/history';

/**
 * These assertions mirror every constraint in `firestore.rules` for
 * `users/{userId}/matches/{matchId}`. If the app payload and the rules ever
 * drift apart, this test fails before the rules are published.
 */

function makeRecord(): MatchRecord {
  // Same construction as the match-completion effect in GameContext.tsx.
  return {
    id: `${Date.now()}_abcde`,
    timestamp: Date.now(),
    totalRounds: 3,
    playerCount: 2,
    winnerName: 'You',
    players: [
      {
        playerId: 'player_0',
        name: 'You',
        isHuman: true,
        finalScore: 120,
        isEliminated: false,
        isWinner: true,
      },
      {
        playerId: 'player_1',
        name: 'Mira',
        isHuman: false,
        finalScore: 240,
        isEliminated: false,
        isWinner: false,
      },
    ],
  };
}

describe('Firestore match document payload matches security rules', () => {
  const uid = 'test-uid-123';
  const now = 1700000000000;

  test('adds userId and syncedAt without mutating the source record', () => {
    const record = makeRecord();
    const doc = buildMatchDocument(record, uid, now);

    expect(doc.userId).toBe(uid);
    expect(doc.syncedAt).toBe(now);
    expect(doc.id).toBe(record.id);
    expect(record).not.toHaveProperty('userId');
  });

  test('id is a string and equals the Firestore document id used by the app', () => {
    const record = makeRecord();
    const doc = buildMatchDocument(record, uid, now);

    // syncMatchToFirebase writes to doc(db, 'users', uid, 'matches', match.id)
    expect(typeof doc.id).toBe('string');
    expect(doc.id.length).toBeGreaterThan(0);
  });

  test('timestamp and syncedAt are numbers, not Firestore Timestamps', () => {
    const doc = buildMatchDocument(makeRecord(), uid, now);

    expect(typeof doc.timestamp).toBe('number');
    expect(typeof doc.syncedAt).toBe('number');
    expect(Number.isInteger(doc.timestamp)).toBe(true);
    expect(Number.isInteger(doc.syncedAt)).toBe(true);
  });

  test('totalRounds is an integer within 1..1000', () => {
    const doc = buildMatchDocument(makeRecord(), uid, now);

    expect(Number.isInteger(doc.totalRounds)).toBe(true);
    expect(doc.totalRounds).toBeGreaterThanOrEqual(1);
    expect(doc.totalRounds).toBeLessThanOrEqual(1000);
  });

  test('playerCount is an integer within 2..6 and matches players length', () => {
    const doc = buildMatchDocument(makeRecord(), uid, now);

    expect(Number.isInteger(doc.playerCount)).toBe(true);
    expect(doc.playerCount).toBeGreaterThanOrEqual(2);
    expect(doc.playerCount).toBeLessThanOrEqual(6);
    expect(doc.players).toHaveLength(doc.playerCount);
  });

  test('winnerName is a non-empty string of at most 64 characters', () => {
    const doc = buildMatchDocument(makeRecord(), uid, now);

    expect(typeof doc.winnerName).toBe('string');
    expect(doc.winnerName.length).toBeGreaterThan(0);
    expect(doc.winnerName.length).toBeLessThanOrEqual(64);
  });

  test('players is a list of 2..6 well-formed score objects', () => {
    const doc = buildMatchDocument(makeRecord(), uid, now);

    expect(Array.isArray(doc.players)).toBe(true);
    expect(doc.players.length).toBeGreaterThanOrEqual(2);
    expect(doc.players.length).toBeLessThanOrEqual(6);

    doc.players.forEach(player => {
      expect(Object.keys(player).sort()).toEqual(
        ['finalScore', 'isEliminated', 'isHuman', 'isWinner', 'name', 'playerId'].sort()
      );
      expect(typeof player.playerId).toBe('string');
      expect(typeof player.name).toBe('string');
      expect(typeof player.isHuman).toBe('boolean');
      expect(typeof player.finalScore).toBe('number');
      expect(typeof player.isEliminated).toBe('boolean');
      expect(typeof player.isWinner).toBe('boolean');
    });
  });

  test('userId is a non-empty string equal to the authenticated uid', () => {
    const doc = buildMatchDocument(makeRecord(), uid, now);

    expect(typeof doc.userId).toBe('string');
    expect(doc.userId).toBe(uid);
  });

  test('optional syncedToFirebase is absent rather than undefined', () => {
    // Firestore rejects explicitly-undefined field values; the app never sets
    // this flag on the record it syncs, so the key must not be present.
    const doc = buildMatchDocument(makeRecord(), uid, now);

    expect(Object.prototype.hasOwnProperty.call(doc, 'syncedToFirebase')).toBe(false);
  });

  test('payload works for every supported seat count (2-6)', () => {
    for (let count = 2; count <= 6; count += 1) {
      const record = makeRecord();
      record.playerCount = count;
      record.players = Array.from({ length: count }, (_, i) => ({
        playerId: `player_${i}`,
        name: `Player ${i}`,
        isHuman: i === 0,
        finalScore: 100 + i,
        isEliminated: false,
        isWinner: i === 0,
      }));

      const doc = buildMatchDocument(record, uid, now);

      expect(doc.playerCount).toBe(count);
      expect(doc.players).toHaveLength(count);
      expect(doc.players.length).toBeGreaterThanOrEqual(2);
      expect(doc.players.length).toBeLessThanOrEqual(6);
    }
  });
});
