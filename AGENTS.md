# Yearly Tracker

Operating manual for coding agents working in this repository.

## Project overview

Expo / React Native production mobile app.

- Offline-first. Local-only data. No accounts, analytics, ads, or tracking.
- Goals, habits, history, themes, and widgets all live on-device.
- Visual identity: museum catalogue × old computer terminal × personal journal.
- ASCII is texture, not a gimmick.
- Art themes use a full-screen artwork backdrop. Classic and custom themes keep solid palettes.

## Source-of-truth documentation

| File | Role |
| --- | --- |
| `AGENTS.md` | Engineering, process, and safety rules |
| `design.md` | Visual design system and UI rules |
| `REVAMP.MD` | Historical / current revamp specification and rationale |

If visual implementation conflicts with `design.md`, inspect and update `design.md` deliberately. Do not invent a new per-screen system.

`REVAMP.MD` explains why a pass exists. `design.md` is what screens should look like after that pass.

## Git rules

- Never work directly on `main` unless the user explicitly asks.
- Current redesign branch: `feature/revamp`.
- Stay on that branch. Do not merge into `main`.
- Make focused commits. Inspect `git diff` before claiming work is complete.
- Do not auto-merge, restack onto `main`, or rewrite production history.

## Production persistence contract

**Local AsyncStorage is production user data.**

Treat every install as a live upgrade. A user who updates the app must keep the same goals, habits, history, theme, custom themes, onboarding flags, and current year.

### Current keys

| Key | Purpose | Schema |
| --- | --- | --- |
| `rt_goals_v1` | Current-year goals | `Goal[]` |
| `rt_hue_v1` | Theme choice | string id, numeric hue, or `custom:<id>` |
| `rt_welcome_seen_v1` | Welcome modal seen | `"1"` |
| `rt_year_v1` | Legacy stored year | number string |
| `yt_current_year_v1` | Current tracked year | number string |
| `yt_goal_history_v1` | Yearly goal snapshots | `HistoryEntry[]` |
| `yt_custom_themes_v1` | User-created palettes | `CustomTheme[]` |
| `yt_habits_v1` | Habits + daily checks | `Habit[]` (App.js) |
| `yt_habits_welcome_seen_v1` | Habits intro seen | `"1"` (App.js) |
| `yt_revamp_intro_seen_v1` | Revamp visual intro seen | `"1"` (additive) |

`yt_revamp_intro_seen_v1` is presentation-only. Its absence is not missing or corrupt user data.

### Shapes

- Goal: `{ id, title, type: "count"|"boolean", target, progress, createdAt }`
- Habit: `{ id, title, checks: { "YYYY-MM-DD": 0|1|2 } }` — `0` empty, `1` good, `2` bad
- HistoryEntry: `{ year, savedAt, goals: Goal[], summary: { avgPercent, completedCount, totalCount } }`
- CustomTheme: `{ id, name, palette, createdAt }`

Never:

- Rename keys casually
- Reset storage
- Reseed existing users
- Alter IDs
- Drop unknown fields
- Change persisted shapes without an explicit migration
- Change habit `0 / 1 / 2` semantics
- Reuse or reset `rt_welcome_seen_v1` for a new visual introduction

Prefer additive keys and optional fields. Readers of new fields must default (`??`) rather than fail. Unknown fields on persisted objects must be preserved.

Inventory lives in `utils/storage.js`. Habit keys currently live in `App.js` and must stay named exactly as listed.

## Business logic invariants

Preserve:

- Goal CRUD, progress, hide-completed, drag/reorder
- Habit CRUD, `0/1/2` cycling, swipe edit/delete, drag/reorder, streaks
- Habit history month/year math
- Annual rollover (carry / reset progress / start new / decide later)
- Yearly percentage (average of goal percents — do not invent a new formula)
- Haptics, undo toast, sharing capture size and data
- Widget payload shape and native widget contracts

Presentation may change. Stored values, IDs, and formulas may not.

## Native boundaries

Android and iOS widgets read a native payload from `buildWidgetPayload` in `App.js`. Do not casually change field names, habit state integers, or theme payload shape. Widget UI may map `0/1/2` to `.` / `+` / `×` visually only.

## Design rules

Read `design.md` before changing UI.

High-level identity:

**MUSEUM CATALOGUE × OLD COMPUTER TERMINAL × PERSONAL JOURNAL**

- Art themes: one full-screen artwork backdrop per screen, plus a paper veil and a single subtle ASCII texture layer.
- Classic / custom / Museum Paper (no artwork): solid palette background. Never crash on missing artwork.
- Do not put a large rectangular art plate in the Goals / Habits / History content flow.
- Important information must not ellipsize on narrow devices. Reflow or scale type first. iPhone 7 / 375pt is a first-class target.
- Hairline rules, editorial type, no generic pill buttons on screens we touch.

## Offline / artwork rules

- No runtime museum or network requests for artwork.
- Bundle public-domain / Open Access images and ASCII plates.
- Keep attribution metadata (`assets/art/catalog.json`).
- Generate assets with `npm run build:art` during development only. Never run that pipeline against a live user install.

## Commands

From `package.json` — do not invent scripts:

```bash
npm install
npm start                 # expo start
npm run android           # expo run:android
npm run ios               # expo run:ios
npm run web               # expo start --web
npm run build:art         # rebuild bundled art + ASCII (dev only)
npm run verify:storage    # old AsyncStorage fixture vs current contracts
```

There is no lint or test script. Also run:

```bash
npx expo-doctor
```

Do not perform unrelated dependency upgrades.

## Verification checklist

Before declaring work complete:

1. `npm run verify:storage` — frozen old-storage fixture still passes; new keys are additive
2. `npx expo-doctor`
3. Syntax / import checks on touched files
4. Theme resolution: art, classic, and custom
5. Narrow-width layout (375pt / iPhone 7 considerations)
6. Inspect full `git diff`
7. Do not claim physical-device verification unless it was actually performed
