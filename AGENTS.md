# OUTLAST 502 — Agent Instructions & Working Conventions

This document specifies conventions for AI agents working in this repository.

## 1. Project Overview
OUTLAST 502 is an original React Native / Expo mobile game implementation of the 502 card game.
Reference: https://502-game.vercel.app/
Target Platform: Android & iOS (via Expo), portrait orientation.

## 2. Mandatory Architectural Constraints
- **Pure Game Engine Isolation**: Game logic must remain strictly inside `src/engine/` as pure, deterministic TypeScript functions without any React, React Native, or DOM imports.
- **No Direct Rule Modifications**: All rules must conform strictly to `docs/RULES_SPEC.md`. Do not invent or alter card penalties or scoring without consulting the spec.
- **No Paid APIs**: Never introduce paid third-party services or dependencies requiring paid accounts.
- **Expo Compatibility**: Install any native modules using `npx expo install <package>` to guarantee SDK version compatibility.
- **Never Modify Other Projects**: Keep all file reads, writes, and commands isolated to `C:\Users\hp\Downloads\Outlast502`.

## 3. Key Rule Invariants
- Opening card must never be `{ 2, J, A, 7♥, 8 }`.
- Pending penalties take precedence: Jack and 7♥ cannot cancel pending penalties.
- End-of-round final 2 or A♠ forces the next player to draw before round scoring without answering.
- Cumulative score >= 502 eliminates a player, unless they are the round winner (protected for that round).
- 52-card standard deck (no jokers). 7 cards dealt per player.

## 4. Documentation Maintenance
Whenever code or architecture is updated, ensure `PROJECT_STATUS.md`, `docs/FILE_MAP.md`, and other relevant docs are updated to reflect the changes.
