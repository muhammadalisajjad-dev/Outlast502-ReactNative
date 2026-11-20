# OUTLAST 502 — Automated & Manual Test Plan

## 1. Quality Objectives
The test strategy for OUTLAST 502 guarantees strict adherence to the project rubric:
- **Game rules and logic (25 pts)**: Tested with 100% deterministic coverage of every standard and edge-case rule.
- **Game state management (15 pts)**: Tested via reducer transitions, action sequencing, and immutability checks.
- **Error handling and stability (5 pts)**: Verified under empty piles, rapid touches, invalid dispatches, and offline network status.
- **Viva readiness (20 pts)**: Verified through clear test assertions matching `docs/RULES_SPEC.md`.

---

## 2. Test Suites & Coverage Matrix

| Suite File | Target Module | Verified Behaviors & Edge Cases |
| :--- | :--- | :--- |
| `tests/deck.test.ts` | `deck.ts` | - Generates exactly 52 cards (13 per suit).<br>- Opening card rejects all 2s, Jacks, Aces, 7♥, and 8s.<br>- Drawing removes cards from draw pile.<br>- Draw pile recycling when empty (leaving top discard intact). |
| `tests/rules.test.ts` | `rules.ts` | - Normal card matching: same suit or same rank.<br>- Disallowed normal card (different suit AND different rank).<br>- Jack played on any normal card.<br>- Jack declared suit enforcement on subsequent turn.<br>- 7♥ played on any normal card.<br>- Drawing ends turn immediately (cannot play drawn card in same turn).<br>- Voluntarily drawing when playable cards exist is allowed. |
| `tests/penalties.test.ts` | `penalties.ts` | - 2 played: pending penalty becomes 2.<br>- Another 2 played: pending penalty stacks to 4, 6, 8.<br>- Inability/refusal to play a 2 draws the exact accumulated total and clears penalty.<br>- A♠ played: pending penalty becomes 5.<br>- Passing A♠ with A♥, A♦, or A♣ keeps penalty at 5 (never increases).<br>- Jack or 7♥ CANNOT be played against pending penalty.<br>- 8 played: skips next player.<br>- Answering 8 with another 8 passes skip onward.<br>- Skipped player draws 0 cards and loses turn. |
| `tests/scoring.test.ts` | `scoring.ts` | - Point values: 7♥ (100), A♠ (100), 2/8/J (30), other Aces (20), 10/Q/K (10), 3-6/9/other 7s (5).<br>- Player who emptied hand scores 0.<br>- 7♥ winner counts remaining cards in hand.<br>- Multi-player round score aggregation. |
| `tests/elimination.test.ts` | `elimination.ts` | - Cumulative scores carry over across rounds.<br>- Player with >= 502 points is eliminated.<br>- Round winner is IMMUNE to elimination for that round even if >= 502 points.<br>- Immunity expires after the following round.<br>- Multiple simultaneous eliminations handled properly.<br>- Last remaining player below 502 declared match winner.<br>- Simultaneous elimination tie-break: lowest score wins. |
| `tests/engine.test.ts` | `gameEngine.ts` | - Full round simulation from deal to round end.<br>- Special exception: Last card is a 2 -> next player forced to draw 2 before scoring without answering.<br>- Special exception: Last card is A♠ -> next player forced to draw 5 before scoring without answering.<br>- Next round starting player assignment (previous round winner).<br>- Draw pile exhaustion and discard pile reshuffle.<br>- Match reset and replay. |
| `tests/ai.test.ts` | `botStrategy.ts` | - AI never makes an illegal move.<br>- AI answers pending 2 with a 2 if available.<br>- AI answers pending A♠ with an Ace if available.<br>- AI answers pending skip with an 8 if available.<br>- AI declares optimal suit when playing a Jack.<br>- AI holds or plays 7♥ rationally based on hand cost. |

---

## 3. Test Fixtures & Deterministic Scenarios
All tests use fixed mock hands, controlled deck ordering, and deterministic state transitions so that random shuffling never causes flaky tests.

### Key Fixture Scenarios:
1. **`FIXTURE_TWO_CHAIN`**: Player 1 plays 2♠ -> Player 2 plays 2♥ (penalty 4) -> Player 3 plays 2♦ (penalty 6) -> Player 4 has no 2, draws 6 cards.
2. **`FIXTURE_ACE_CHAIN`**: Player 1 plays A♠ (penalty 5) -> Player 2 plays A♦ (penalty remains 5) -> Player 3 draws 5 cards.
3. **`FIXTURE_FINAL_TWO_WIN`**: Player 1 holds only 2♣. Discard is 9♣. Player 1 plays 2♣ (hand now 0). Player 2 must immediately draw 2 cards before round scoring. Player 2 cannot counter.
4. **`FIXTURE_7HEARTS_IMMUNITY`**: Player 1 cumulative score is 490. Player 1 plays 7♥ with cards totaling 25 points remaining. Final score becomes 515. Player 1 is NOT eliminated because they won the round.
