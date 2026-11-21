# OUTLAST 502 — Mobile Card Game

OUTLAST 502 is a premium, high-stakes mobile card shedding game built with React Native and Expo. Based on the 502 card game rules, players compete to empty their hands while inflicting heavy penalties on opponents. Cumulative penalty points are tracked across rounds; reach 502 points, and you are eliminated. The last survivor wins!

---

## 🌟 Key Features
- **Official 502 Rules**: Precise implementation of card effects, penalty stacking, wild cards, and scoring based on [502-game.vercel.app](https://502-game.vercel.app/).
- **Original Art Deco Aesthetic**: A private card club in deep ink and emerald, with warm ivory cards, restrained brass detailing and burgundy consequence accents on a responsive mobile-first layout.
- **2 to 6 Players**: Dynamic table configuration supporting 1 human player against 1 to 5 intelligent computer opponents.
- **Decoupled Game Engine**: Pure TypeScript logic isolated from the UI, with comprehensive unit test coverage.
- **Bonus Score History**: Persistent match history with offline AsyncStorage and optional Firebase Firestore synchronization.

---

## 🃏 Card Actions & Point Values

| Card | Effect | Point Value |
| :--- | :--- | :--- |
| **7 of Hearts (7♥)** | Wild & instant round win! (Remaining hand counts against winner) | **100 pts** |
| **Ace of Spades (A♠)** | Next player draws 5 cards; can be passed with any Ace (stays 5) | **100 pts** |
| **2 (all suits)** | Next player draws 2 cards; stacks with another 2 (+2, +4, +6, +8) | **30 pts** |
| **8 (all suits)** | Skips next player; can be countered with another 8 | **30 pts** |
| **Jack (all suits)** | Wild card; declares the active suit for the next player | **30 pts** |
| **Other Aces (♥, ♦, ♣)** | Defensive only (passes pending A♠ penalty) | **20 pts** |
| **10, Queen, King** | Normal matching card | **10 pts** |
| **3, 4, 5, 6, 9, other 7s** | Normal matching card | **5 pts** |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+
- Expo CLI

### Installation
```bash
# Clone and enter directory
cd Outlast502

# Install dependencies
npm install

# Run unit tests
npm test

# Start the Expo development server
npm start
```

### Running on Android
```bash
npm run android
```

### Running on Web
```bash
npm run web
```

---

## 📚 Project Documentation
- [Authoritative Rules Specification](docs/RULES_SPEC.md)
- [System Architecture & State Machine](docs/ARCHITECTURE.md)
- [Complete File Map](docs/FILE_MAP.md)
- [Automated & Manual Test Plan](docs/TEST_PLAN.md)
- [Viva & Code Understanding Guide](docs/VIVA_GUIDE.md)

---

## 📸 Visual Verification

The redesigned UI is rendered from the production web bundle and inspected with Playwright:

```bash
npx expo export --platform web
node scripts/capture_screenshots.js   # screenshots/ + screenshots/final/
node scripts/interaction_smoke.js     # legal play, Jack path, 2P/6P tables, console-error check
```

Evidence is curated in `screenshots/final/` (home, setup, 2P/4P/6P table, action state, rules, scoreboard, history, all four dialogs and desktop). See `PROJECT_STATUS.md` for the verified test/build results and current limitations.

---

## 🏆 Project Rubric Coverage
- **Game rules and logic (25 pts)**: Complete standard and edge-case mechanics, verified by automated unit tests.
- **UI/UX (20 pts)**: Original Art Deco club theme (ink/emerald/ivory/brass/burgundy), adaptive portrait layout, smooth card transitions and a multi-viewport visual audit.
- **React Native implementation (15 pts)**: Modern Expo architecture, functional components, TypeScript typing.
- **Game state management (15 pts)**: Predictable state machine with decoupled engine and React Context.
- **Error handling and stability (5 pts)**: Resilient empty-deck recycling, input sanitization, offline-first fallback.
- **Viva and code understanding (20 pts)**: Documented in `docs/VIVA_GUIDE.md` and `docs/FILE_MAP.md`.
- **Firebase score-history bonus (10 pts)**: Firestore cloud persistence with local offline cache.
