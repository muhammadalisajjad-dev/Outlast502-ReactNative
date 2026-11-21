# OUTLAST 502 — Comprehensive File Map

This document catalogues every file in the project, explaining its exact responsibility, exports, and relationships. It is an essential reference during viva and code walkthroughs.

---

## 1. Project Configuration & Root Files

| File | Purpose | Key Contents / Exports |
| :--- | :--- | :--- |
| `package.json` | Project manifest and dependencies | Expo ~58, React Native 0.88, React 19, TypeScript, Jest, Playwright (dev) |
| `tsconfig.json` | TypeScript configuration | Strict type checking, path aliases, JSX settings |
| `app.json` | Expo application manifest | App name, slug, portrait orientation, dark interface style and ink background, icon/adaptive-icon config |
| `App.tsx` | Main application entry point | Root navigation / screen switcher wrapped in `GameProvider`; web-only brass keyboard focus styling |
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
| `src/components/card/PlayingCard.tsx` | Ivory deco card face with suit artwork, special-card tabs, emerald lattice back and badges | `PlayingCard`, `CARD_SIZES` |
| `src/components/card/CardHand.tsx` | Adaptive fanned hand with rotation/arc, playable highlights, card count and score header | `CardHand` |
| `src/components/table/DrawPile.tsx` | Layered face-down deck with card-count badge, draw trigger and active aura | `DrawPile` |
| `src/components/table/DiscardPile.tsx` | Discard stack with top face-up card, declared-suit lozenge and play-count badge | `DiscardPile` |
| `src/components/table/OpponentSeat.tsx` | Opponent medallion, mini card fan, active-turn glow, score and remaining-card count | `OpponentSeat` |
| `src/components/table/TableHeader.tsx` | Monogram, Roman round numeral, turn indicator, circular scoreboard/rules buttons | `TableHeader` |
| `src/components/table/TableMotionOverlay.tsx` | Staggered deal sequence, flying-card trajectories, Art Deco special-event banners | `TableMotionOverlay` |
| `src/components/modals/JackSuitModal.tsx` | Suit declaration picker shown after a Jack | `JackSuitModal` |
| `src/components/modals/PenaltyModal.tsx` | Inline burgundy penalty ticket with counter guidance and draw action | `PenaltyModal` |
| `src/components/modals/RoundOverModal.tsx` | Round winner, forced-penalty notice and per-player score ledger | `RoundOverModal` |
| `src/components/modals/GameOverModal.tsx` | Champion showcase, final standings ledger and replay/menu actions | `GameOverModal` |
| `src/components/common/Button.tsx` | Emerald/brass/burgundy/outline/subtle button variants with press spring | `Button` |
| `src/components/common/Deco.tsx` | Shared Art Deco primitives: backdrop, felt surface, monogram, ornament divider, diamond, club header, ledger section | `DecoBackdrop`, `FeltSurface`, `Monogram`, `OrnamentDivider`, `BrassDiamond`, `ClubHeader`, `LedgerSection`, `ClubScreen` |
| `src/components/common/DecoModal.tsx` | Shared dialog shell with clipped corners, double brass hairline and restrained entrance | `DecoModal` |
| `src/components/common/ScreenTransition.tsx` | Restrained fade/settle transition used between screens | `ScreenTransition` |
| `src/components/common/Badge.tsx` | Status pill badges (currently unused by the redesigned screens; retained as a utility) | `Badge` |

---

## 8. Screens (`/src/screens`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/screens/HomeScreen.tsx` | Club masthead hero with floating house-card fan, primary invitation and Roman-numeral ledger navigation | `HomeScreen` |
| `src/screens/SetupScreen.tsx` | Guest-list setup: host identity, 2–6 seat tiles, seating-order roster and start action | `SetupScreen` |
| `src/screens/GameScreen.tsx` | Full-bleed atmospheric table: opponent rail, felt frame, center piles, inline penalty ticket and player hand | `GameScreen` |
| `src/screens/ScoreboardScreen.tsx` | Editorial survival standings with debt progress lines and round-by-round ledger | `ScoreboardScreen` |
| `src/screens/HistoryScreen.tsx` | Archive of local/cloud saved matches with sync notice and clear action | `HistoryScreen` |
| `src/screens/RulesScreen.tsx` | In-app rule book: object, deal/turn, powers, scoring and elimination sections | `RulesScreen` |

---

## 9. Services & Theme (`/src/services`, `/src/theme`, `/src/utils`)

| File | Purpose | Key Exports |
| :--- | :--- | :--- |
| `src/services/storage.ts` | Local persistence using AsyncStorage for offline match records | `saveMatchHistory()`, `getMatchHistory()`, `clearMatchHistory()` |
| `src/services/firebase.ts` | Optional Firebase Firestore sync for score-history bonus | `syncMatchToFirebase()`, `fetchFirebaseLeaderboard()`, `isFirebaseAvailable()` |
| `src/theme/colors.ts` | Art Deco club palette: ink/emerald foundations, warm ivory paper, brass foil, burgundy consequence | `Colors` |
| `src/theme/typography.ts` | Serif display + sans label type system using platform fonts | `Typography`, `Fonts` |
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

---

## 11. Visual Verification Scripts (`/scripts`)

| File | Purpose |
| :--- | :--- |
| `scripts/capture_screenshots.js` | Serves the exported web bundle and captures Home, Setup, Game Table, Rules, Scoreboard and History at 360×800, 375×812, 390×844, 412×915, 430×932 and desktop 1280×800 with Chromium. |
| `scripts/interaction_smoke.js` | Playwright smoke test: starts a match, plays a legal card (including the Jack suit path), navigates Scoreboard/Rules, verifies 2-seat and 6-seat layouts, and fails on browser console/page errors. |
