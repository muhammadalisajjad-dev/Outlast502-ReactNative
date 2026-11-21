# OUTLAST 502 — Comprehensive File Map

This document catalogues every file in the project, explaining its exact responsibility, exports, and relationships. It is an essential reference during viva and code walkthroughs.

---

## 1. Project Configuration & Root Files

| File | Purpose | Key Contents / Exports |
| :--- | :--- | :--- |
| `package.json` | Project manifest and dependencies | Expo 52+, React Native 0.76+, React 19, TypeScript, Jest |
| `tsconfig.json` | TypeScript configuration | Strict type checking, path aliases, JSX settings |
| `app.json` | Expo application manifest | App name, slug, orientation (portrait), bundle identifiers, splash & icon config |
| `App.tsx` | Main application entry point | Root navigation / screen switcher wrapped in `GameProvider` |
| `README.md` | Primary project documentation | Project description, setup instructions, rules summary, and rubric alignment |
| `PROJECT_STATUS.md` | Continuous status tracker | Phase-by-phase completion log, verified criteria, and test results |
| `AGENTS.md` | Agent roles and conventions | Architecture decisions and conventions for AI assistants working on this repo |

---

## 2. Documentation (`/docs`)

| File | Purpose |
| :--- | :--- |
| `docs/RULES_SPEC.md` | Authoritative rules specification based on 502-game.vercel.app inspection, edge cases, and ambiguity resolutions. |
| `docs/ARCHITECTURE.md` | System design, separation of concerns, state machine, and data flow diagrams. |
| `docs/FILE_MAP.md` | Complete index of every source and test file with concise explanations. |
| `docs/TEST_PLAN.md` | Unit test suite plan, coverage matrix, test fixtures, and edge-case verifications. |
| `docs/VIVA_GUIDE.md` | Viva prep questions & answers explaining design choices, engine logic, and state management. |

---

## 3. Data Models & Types (`/src/types`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/types/card.ts` | Type definitions for card entities | `Suit`, `Rank`, `Card`, `SuitColor`, `SUITS`, `RANKS` |
| `src/types/game.ts` | Game state, players, penalties, and actions | `Player`, `GameState`, `RoundState`, `PenaltyState`, `GameAction`, `RoundResult` |
| `src/types/history.ts` | Match and round history persistence models | `MatchRecord`, `RoundScoreRecord`, `PlayerScoreSummary` |

---

## 4. Pure Game Engine (`/src/engine`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/engine/deck.ts` | Standard 52-card deck generator, shuffle, neutral card selection | `createStandardDeck()`, `shuffleDeck()`, `drawCards()`, `isNeutralOpeningCard()`, `getValidOpeningCard()` |
| `src/engine/rules.ts` | Move legality verification and playable card detection | `isLegalPlay()`, `getPlayableCards()`, `canAnswerPenalty()` |
| `src/engine/penalties.ts` | Mathematical penalty calculations for 2, A♠, and 8 | `calculateNextPenalty()`, `resolvePenaltyDraw()`, `canCounterPenalty()` |
| `src/engine/scoring.ts` | Point computation according to official 502 point table | `CARD_POINTS`, `calculateCardPoints()`, `calculateHandPoints()`, `calculateRoundScores()` |
| `src/engine/elimination.ts` | 502 threshold, round winner immunity, and match victory logic | `checkEliminations()`, `evaluateMatchWinner()` |
| `src/engine/turn.ts` | Clockwise turn advancement and active player cycling | `getNextActivePlayerIndex()`, `advanceTurn()` |
| `src/engine/gameEngine.ts` | Central deterministic state reducer executing player and bot moves | `initMatch()`, `initRound()`, `executePlayCard()`, `executeDrawCard()`, `executeAcceptPenalty()`, `executeJackDemand()` |

---

## 5. Artificial Intelligence (`/src/ai`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/ai/botStrategy.ts` | Rule-compliant bot decision heuristics (safe card shedding, 7♥ timing, defense preservation) | `selectBotMove()`, `selectBotJackSuit()` |
| `src/ai/botPlayer.ts` | Turn execution coordinator with realistic turn pacing | `scheduleBotTurn()` |

---

## 6. State Management (`/src/context`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/context/GameContext.tsx` | React context providing reactive state, dispatchers, and turn orchestration | `GameProvider`, `useGame()` |

---

## 7. UI Components (`/src/components`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/components/card/PlayingCard.tsx` | Custom ivory playing card component with suit artwork, badges, and interaction | `PlayingCard` |
| `src/components/card/CardHand.tsx` | Responsive scrolling/fanned hand displaying playable glows | `CardHand` |
| `src/components/table/EmeraldTable.tsx` | Rich green felt table surface layout with center piles and player seats | `EmeraldTable` |
| `src/components/table/DiscardPile.tsx` | Discard stack with top face-up card and active declared suit indicator | `DiscardPile` |
| `src/components/table/DrawPile.tsx` | Face-down deck with card count indicator and draw trigger | `DrawPile` |
| `src/components/table/OpponentSeat.tsx` | Opponent avatar, active turn indicator, remaining card count, and score | `OpponentSeat` |
| `src/components/table/TableMotionOverlay.tsx` | Animated card dealing sequence, flying card trajectories (hand/draw/discard), and special card announcement banners | `TableMotionOverlay` |
| `src/components/table/TableHeader.tsx` | Round status, match info, and game controls | `TableHeader` |
| `src/components/modals/JackSuitModal.tsx` | Modal dialog for choosing suit after playing a Jack | `JackSuitModal` |
| `src/components/modals/PenaltyModal.tsx` | Banner/modal detailing pending penalty and required response | `PenaltyModal` |
| `src/components/modals/RoundOverModal.tsx` | Round results summary, hand points breakdown, and immunity badge | `RoundOverModal` |
| `src/components/modals/GameOverModal.tsx` | Final game podium, match winner, and replay options | `GameOverModal` |
| `src/components/common/Button.tsx` | Custom gold/emerald styled button component | `Button` |
| `src/components/common/Badge.tsx` | Status pill badges for scores, penalties, and suits | `Badge` |

---

## 8. Screens (`/src/screens`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/screens/HomeScreen.tsx` | Main landing screen with branding, game modes, and navigation | `HomeScreen` |
| `src/screens/SetupScreen.tsx` | Match setup screen allowing 2–6 player selection and difficulty/names | `SetupScreen` |
| `src/screens/GameScreen.tsx` | Active portrait gameplay table screen | `GameScreen` |
| `src/screens/ScoreboardScreen.tsx` | Multi-round cumulative score table with elimination markers | `ScoreboardScreen` |
| `src/screens/HistoryScreen.tsx` | Score history viewer for Firebase / local saved matches | `HistoryScreen` |
| `src/screens/RulesScreen.tsx` | In-app quick reference for rules, scoring table, and card actions | `RulesScreen` |

---

## 9. Services & Theme (`/src/services`, `/src/theme`, `/src/utils`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/services/storage.ts` | Local persistence using AsyncStorage for offline match records | `saveMatchHistory()`, `getMatchHistory()`, `clearMatchHistory()` |
| `src/services/firebase.ts` | Optional Firebase Firestore sync for score-history bonus | `syncMatchToFirebase()`, `fetchFirebaseLeaderboard()`, `isFirebaseAvailable()` |
| `src/theme/colors.ts` | Color tokens: emerald table, gold foil, ivory card, crimson alerts | `Colors` |
| `src/theme/typography.ts` | Standardized typography sizes and font weights | `Typography` |
| `src/utils/haptics.ts` | Tactile and audio feedback helper | `triggerHaptic()` |
| `src/utils/sound.ts` | Procedural Web Audio API sound synthesizer for card deals, snaps, draws, penalties, and victory chimes | `playCardSnap()`, `playCardDeal()`, `playCardDraw()`, `playPenalty()`, `playVictoryChime()`, `playClick()` |

---

## 10. Automated Tests (`/tests`)

| File | Coverage Focus |
| :--- | :--- |
| `tests/deck.test.ts` | 52-card composition, shuffle randomness, neutral opening card exclusion |
| `tests/rules.test.ts` | Suit/rank matching, Jack wild behavior, 7♥ instant win, drawing ends turn |
| `tests/penalties.test.ts` | 2-stack (+2..8), A♠ 5-penalty passing, 8-skip chaining, non-counter draws |
| `tests/scoring.test.ts` | Every card point category, 0 points for empty hand, 7♥ remaining hand scoring |
| `tests/elimination.test.ts` | 502 threshold, round winner immunity, simultaneous elimination tie-break |
| `tests/engine.test.ts` | Full round simulations, final 2 / final A♠ penalty forced draw, draw pile recycling |
| `tests/ai.test.ts` | Bot move validation, legal play guarantee, penalty answering |
