# OUTLAST 502 — Game Rules Specification

## 1. Overview & Reference Grounding
This specification defines the formal rules, mathematical penalties, state machine transitions, and resolution logic for the mobile game **OUTLAST 502**, based on the official reference at [502-game.vercel.app](https://502-game.vercel.app/) (SuitSaga Arena by Ali Hamza).

### Reference Inspection Summary
- **Official Rules Page**: `https://502-game.vercel.app/rules`
- **Official FAQ Page**: `https://502-game.vercel.app/faq`
- **House Rules Page**: `https://502-game.vercel.app/house-rules`
- **Strategy Guide**: `https://502-game.vercel.app/strategy`
- **Production Web Bundle Analyzed**: `main.c0cf904e.js` (React client connected to WebSocket backend `502-game-production.up.railway.app`)

---

## 2. Core Game Rules & Mechanics

### 2.1 Deck & Players
- **Deck**: Standard 52-card international deck (No Jokers).
  - 4 suits: Spades (♠), Hearts (♥), Diamonds (♦), Clubs (♣).
  - 13 ranks per suit: 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A.
- **Participants**: 2 to 6 players (1 human player vs 1–5 computer AI opponents).
- **Initial Deal**: Exactly 7 cards dealt to every active (non-eliminated) player at the start of each round.
- **Turn Progression**: Clockwise rotation (`(currentIndex + 1) % activePlayers.length`). There are no reverse cards.

### 2.2 Opening Card & Neutral Card Rule
- At the start of a round, after dealing 7 cards to each active player, the top card of the draw pile is turned face-up to begin the discard (middle) pile.
- **Neutral Card Rule**:
  - The opening card must be a *neutral* card that does not impose an unprovoked penalty, wild state, or skip on the first player.
  - **Documented Exclusions**:
    - Any **2** (2♠, 2♥, 2♦, 2♣) — imposes +2 draw penalty.
    - Any **Jack** (J♠, J♥, J♦, J♣) — wild card requiring suit declaration.
    - Any **Ace** (A♠, A♥, A♦, A♣) — A♠ imposes 5-card penalty; other Aces pass penalty.
    - The **7 of Hearts (7♥)** — wild card that instantly wins round.
  - If any excluded card is revealed as the opening card, it is placed at the bottom of the draw pile and a new card is drawn until a neutral card is revealed.

#### Ambiguity 1: Status of Rank 8 in Opening Exclusion
- **Observation**:
  - The written rules text explicitly lists: *"If the starting card is a 2, a Jack, any Ace or the 7 of Hearts, put it back at the bottom of the deck and turn up another card."* It omits **8**, even though an 8 skips the next player in normal play.
  - If an 8 were permitted as the opening card, either player 1 would be penalized with an immediate skip before taking any action, or the opening 8 would have its skip effect suppressed.
- **Resolution & Selected Interpretation**:
  - In our engine, **Rank 8 is treated as non-neutral and is also excluded from being the opening card** (re-drawn just like 2, Jack, Ace, and 7♥).
  - **Rationale**: An opening card must be strictly neutral and passive (ranks 3, 4, 5, 6, non-heart 7, 9, 10, Q, K). This ensures completely fair start-of-round conditions for the opening player without requiring a synthetic "suppressed effect" edge case.

---

### 2.3 Turn Actions
On their turn, an active player must perform **exactly one** action:
1. **Play a Legal Card**:
   - Matches the current active suit OR current active rank of the discard pile's top card.
   - Or plays a **Jack** (wild on any card, declares new suit).
   - Or plays **7♥** (wild on any card, immediately wins round).
2. **Draw One Card**:
   - The player draws exactly one card from the draw pile.
   - **Drawing ends the turn immediately**. The drawn card *cannot* be played on the turn it is drawn.
   - Drawing is voluntarily permitted even when the player holds one or more legally playable cards (strategic holding).

---

### 2.4 Special Cards & Effects

| Card | Type / Suit | Special Effect | Can It Be Answered? / Counter Action |
| :--- | :--- | :--- | :--- |
| **Jack** | Any Suit (♠, ♥, ♦, ♣) | **Wild**. Can be played on any normal card. The player declares a target suit. The next player must play that declared suit, another Jack, 7♥, or draw. | Normal play resumes under declared suit. |
| **7 of Hearts (7♥)** | Hearts only | **Wild & Instant Win**. Can be played on any normal card. Ends the round immediately with the playing player as round winner. | Cannot be answered. Round ends immediately. |
| **2** | Any Suit (♠, ♥, ♦, ♣) | **Cumulative Draw Penalty**. Next player owes 2 cards. | **Yes**: By playing another 2. The penalty stacks: 2 -> 4 -> 6 -> 8 cards. First player unable or unwilling to play a 2 draws the accumulated total and their turn ends. |
| **Ace of Spades (A♠)** | Spades only | **Fixed Draw Penalty**. Next player owes 5 cards. | **Yes**: By playing *any* Ace (A♥, A♦, A♣, or A♠). The penalty passes to the next player. The penalty **remains 5 cards** (never increases). |
| **Other Aces** | Hearts, Diamonds, Clubs | **Defense Only**. Have no special offensive penalty on their own. | Used strictly to pass on a pending A♠ penalty. (In normal play, they act as ordinary rank 'A' cards). |
| **8** | Any Suit (♠, ♥, ♦, ♣) | **Skip**. Skips the next player's entire turn. | **Yes**: The targeted player may play an 8 of their own to counter and pass the skip to the following player. If they cannot or do not counter with an 8, they lose their turn completely (they do not draw). |

---

### 2.5 Pending Penalty Precedence (Crucial Rule)
- When a penalty is pending against the current player (2-stack, A♠-penalty, or 8-skip), **normal play is strictly paused**.
- The player **cannot** play a Jack or the 7 of Hearts to escape a pending penalty.
- The player's only legal options are:
  1. Play the specific required counter card (a **2** against a 2-penalty, an **Ace** against an Ace-penalty, an **8** against a skip).
  2. Accept the penalty:
     - For 2-penalty: Draw the accumulated penalty cards (2, 4, 6, or 8). Turn ends.
     - For Ace-penalty: Draw 5 cards. Turn ends.
     - For 8-skip: Accept the skip. Turn passes to the next player without drawing.

---

### 2.6 Round Completion & Edge Cases
A round ends immediately when:
1. A player plays their last card (empties hand).
2. A player plays the **7 of Hearts (7♥)**.

#### Special End-of-Round Exception (Final Penalty Card)
- If a player's winning/last card played is a **2** or the **Ace of Spades (A♠)**:
  - The next player in clockwise order **must draw the pending penalty cards (2 or 5 cards) before scoring takes place**.
  - That next player **gets no opportunity to counter or answer the penalty**.
  - Those newly drawn cards are added to that player's hand and counted toward their penalty points.
- If the draw pile empties during any draw action (normal turn, penalty draw, or end-of-round penalty):
  - All cards in the discard pile *except the top face-up card* are reshuffled to form a fresh draw pile.
  - If both draw pile and discard pile have no cards to draw, no additional cards can be drawn.

---

### 2.7 Scoring Specification

At the end of each round, penalty points are calculated for each active player:
- If a player went out by **emptying their hand**, their remaining hand is 0 cards, so they score **0 points**.
- If a player won by playing the **7 of Hearts**, they are declared round winner, but **they still count all remaining cards in their hand** towards their score.
- All non-winning players sum the point values of all cards remaining in their hand.

#### Exact Point Table
| Card / Rank | Point Value |
| :--- | :--- |
| **7 of Hearts (7♥)** | **100 points** |
| **Ace of Spades (A♠)** | **100 points** |
| **2** (all suits) | **30 points** |
| **8** (all suits) | **30 points** |
| **Jack** (all suits) | **30 points** |
| **Ace of Hearts (A♥), Diamonds (A♦), Clubs (A♣)** | **20 points** |
| **10, Queen (Q), King (K)** (all suits) | **10 points** |
| **3, 4, 5, 6, 9, and other 7s (7♠, 7♦, 7♣)** | **5 points** |

---

### 2.8 Elimination, Protection & Match Victory

- **Cumulative Score**: Points accumulate across consecutive rounds.
- **Elimination Threshold**: Any player whose cumulative score reaches **502 or more** is eliminated from the match.
- **Round-Winner Elimination Protection**:
  - The winner of the round (whether by emptying their hand or playing 7♥) is **immune to elimination in that specific round**, even if their remaining cards push their cumulative score to 502 or above!
  - Their elimination status is re-evaluated only at the end of the subsequent round.
- **Match Termination & Tie-Breaks**:
  - The match continues with the remaining non-eliminated players until only **1 player remains** below 502. That player is declared the match winner.
  - **Simultaneous Elimination Tie-Break**: If in a single round all remaining active players cross 502 points, the player with the **lowest cumulative score** wins the match.

---

### 2.9 Next-Round Starter Specification

#### Ambiguity 2: Fewest Points vs Previous Round Winner
- **Observation**:
  - The text states: *"The player who collected the fewest points in the previous round goes first, so the last round's winner always starts."*
  - The FAQ states: *"The player who took the fewest points in the previous round, which is normally the previous round's winner."*
  - In a standard empty-hand win, the winner scored 0 points (the minimum possible), making both definitions identical.
  - However, in a 7♥ win, the winner may have 15–40 points while another player holding fewer cards could theoretically score fewer points in that single round.
- **Resolution & Selected Interpretation**:
  - **The winner of the previous round always starts the next round.**
  - If the round winner was eliminated (not applicable due to protection rule) or in round 1, the starting player is Player 1 (the human host / first seat).
  - **Rationale**: In card gaming nomenclature, winning the round earns the lead (initiative) for the next deal. The author's phrase *"so the last round's winner always starts"* clarifies the intended operational rule.
