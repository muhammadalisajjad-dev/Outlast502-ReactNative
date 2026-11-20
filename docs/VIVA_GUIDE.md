# OUTLAST 502 — Viva & Code Understanding Guide

This guide prepares you for any question the professor or examiner might ask during the viva presentation.

---

## 1. High-Level Concepts & Rules

### Q1: What is 502, and what is the winning/losing condition?
**Answer**: 502 is a shedding card game played with a standard 52-card deck for 2–6 players. Players attempt to empty their hand. The cards left in players' hands at the end of each round are converted into penalty points according to the official point table. Cumulative points are tracked across rounds. Anyone reaching or exceeding **502 points is eliminated**. The last remaining player below 502 wins the game. If all remaining players cross 502 in the same round, the player with the lowest score wins.

### Q2: What special cards exist in 502, and how do they function?
**Answer**:
1. **Jack (any suit)**: Wild card. Can be played on any normal card. The player names a suit, and subsequent players must follow that suit (or play another Jack, 7♥, or draw).
2. **7 of Hearts (7♥)**: Wild card and instant round winner. It ends the round immediately. However, any cards remaining in the winner's hand are still counted as penalty points.
3. **2 (any suit)**: Forces the next player to draw 2 cards. Stacks if the next player counters with another 2 (+2 each time: 2, 4, 6, 8). The first player who cannot or does not play a 2 draws the entire total.
4. **Ace of Spades (A♠)**: Forces the next player to draw 5 cards. Can be passed by playing any other Ace (A♥, A♦, A♣). The penalty stays at 5 cards; it never stacks.
5. **8 (any suit)**: Skips the next player's turn completely. The skipped player can counter by playing an 8 of their own, passing the skip to the next player.

### Q3: Can a player play a Jack or 7♥ to escape a pending penalty?
**Answer**: **No.** Pending penalties take strict precedence. If a 2-penalty, A♠-penalty, or 8-skip is pending against a player, they may only answer with the required counter card (a 2, an Ace, or an 8) or accept the penalty. Wild cards cannot cancel pending penalties.

### Q4: What happens if a player ends a round by playing a 2 or Ace of Spades as their final card?
**Answer**: This is the **Final Penalty Rule**: The next player must draw the pending penalty (2 or 5 cards) *before* the round is scored, and they are not allowed to answer or counter it. Those drawn cards count against that player in that round's scoring.

### Q5: What is the Round-Winner Elimination Protection rule?
**Answer**: A player who wins a round (either by emptying their hand or playing 7♥) is immune from elimination in that specific round, even if their cumulative score reaches or exceeds 502 points (e.g., from 7♥ remaining hand points). Their elimination status is checked again only at the end of the subsequent round.

---

## 2. Architecture & Code Understanding

### Q6: How is the codebase structured, and why is the game logic decoupled from React Native?
**Answer**: The project follows strict architectural separation:
- `src/engine/`: Pure, deterministic TypeScript logic containing no React Native or UI dependencies. It includes `deck.ts`, `rules.ts`, `penalties.ts`, `scoring.ts`, `elimination.ts`, and `gameEngine.ts`.
- **Why decoupled?**:
  1. Allows 100% testability via Jest in Node.js without mocking React Native native modules.
  2. Guarantees deterministic state transitions and prevents UI re-render bugs from corrupting game state.
  3. Enables easy portability, simulation, and headless AI benchmarking.

### Q7: How does the opening-card neutral check work?
**Answer**: In `src/engine/deck.ts`, when the round begins, cards are dealt, and the top card of the draw pile is turned up. If the card is in `{ 2, Jack, Ace, 7♥, 8 }`, `isNeutralOpeningCard()` returns `false`, and the card is placed at the bottom of the draw pile. This repeats until a passive, neutral card is revealed.

### Q8: How is state managed in the application?
**Answer**: State is managed via React Context (`GameContext.tsx`) wrapping our pure functional reducer (`gameEngine.ts`). Components dispatch strongly-typed actions (`PLAY_CARD`, `DRAW_CARD`, `ACCEPT_PENALTY`, `JACK_SELECT_SUIT`, `NEXT_ROUND`, `RESET_MATCH`). The context coordinates bot turns asynchronously with realistic thinking delays while preserving pure state predictability.

### Q9: How do computer opponents (AI) make decisions?
**Answer**: In `src/ai/botStrategy.ts`:
1. If a penalty is pending, the AI checks if it holds a legal counter (2, Ace, or 8) and plays it; otherwise, it accepts the penalty.
2. If no penalty is pending, it evaluates playable cards:
   - Evaluates whether to play 7♥ (if remaining hand points are low, e.g. < 25 points, or if an opponent has ≤ 2 cards).
   - Prioritizes high-penalty cards (A♠, Jacks, 8s, 2s) to shed risk early.
   - If playing a Jack, chooses the suit in which the bot holds the most cards.
   - If no card is playable, draws a card.
   - The bot never makes an illegal move because its selection is constrained by `getPlayableCards()`.

### Q10: How does the Firebase score history bonus work?
**Answer**: In `src/services/firebase.ts` and `src/services/storage.ts`:
1. Completed matches are saved locally first using `AsyncStorage` (offline-first resilience).
2. If Firebase credentials/config are provided and network is connected, the match record is mirrored to Cloud Firestore in the `matches` collection.
3. The History screen gracefully displays locally persisted and cloud matches, providing full functionality even when offline.
