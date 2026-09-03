# Atelier Tracker

Operating manual for coding agents working in this repository.

User-facing product name: **Atelier Tracker**. Provisional brand mark: `[AT]`.
Internal package/bundle identifiers remain `ResolutionTracker` /
`com.andresbotia.ResolutionTracker` — do not rename them for cosmetics.

## Project overview

Expo / React Native production mobile app.

- Offline-first. Local-only data. No accounts, analytics, ads, or tracking.
- Goals, habits, history, themes, and widgets all live on-device.
- Visual identity: museum catalogue × impressionism / post-impressionism × personal archive.
- ASCII is texture, not a gimmick.
- Art themes use a full-screen artwork backdrop with a paper veil, subtle ASCII, and faint editorial washes. Classic and custom themes keep solid palettes.

## Source-of-truth documentation

| File | Role |
| --- | --- |
| `AGENTS.md` | Engineering, process, and safety rules |
| `design.md` | Visual design system and UI rules |
| `REVAMP.MD` | Current redesign / rebrand implementation specification |

If visual implementation conflicts with `design.md`, inspect and update `design.md` deliberately. Do not invent a new per-screen system.

`REVAMP.MD` explains the current pass. `design.md` is what screens should look like after that pass.

## Git rules

- Never work directly on `main` unless the user explicitly asks.
- Current redesign branch: `feature/revamp`.
- Stay on that branch. Do not merge into `main`.
- Make focused commits. Inspect `git diff` before claiming work is complete.
- Do not auto-merge, restack onto `main`, or rewrite production history.

## Production persistence contract

**Local AsyncStorage is production user data.**

A user who updates from Yearly Tracker to Atelier Tracker must keep the same goals, habits, history, theme, custom themes, onboarding flags, and current year.

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
| `yt_revamp_intro_seen_v1` | Atelier/revamp intro seen | `"1"` (additive) |

`yt_revamp_intro_seen_v1` is presentation-only. Its absence is not missing or corrupt user data. Do not reuse `rt_welcome_seen_v1` for the rebrand intro.

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
- Rename iOS/Android/widget identifiers because the brand changed

Prefer additive keys and optional fields. Unknown fields on persisted objects must be preserved.

Inventory lives in `utils/storage.js`. Habit keys currently live in `App.js` and must stay named exactly as listed.

## Business logic invariants

Preserve:

- Goal CRUD, progress, hide-completed, drag/reorder
- Habit CRUD, `0/1/2` cycling, swipe edit/delete, drag/reorder, streaks
- Habit history month/year math
- Annual rollover (carry / reset progress / start new / decide later)
- Yearly percentage (average of goal percents — do not invent a new formula)
- Haptics (tick / selection / success hierarchy), undo toast, sharing capture size and data
- Widget payload shape and native widget contracts

Presentation may change. Stored values, IDs, and formulas may not.

Existing art theme ids must keep resolving: `cypresses`, `flowering-orchard`, `water-lilies`, `morning-seine`, `vetheuil`, `museum-paper`.

## Native boundaries

Android and iOS widgets read a native payload from `buildWidgetPayload` in `App.js`. Do not casually change field names, habit state integers, or theme payload shape. Widget UI may map `0/1/2` to `.` / `+` / `×` visually only.

Bundle identifiers stay:

- `com.andresbotia.ResolutionTracker`
- `com.andresbotia.ResolutionTracker.widgets`
- Android package `com.andresbotia.yearlytracker`

## Design rules

Read `design.md` before changing UI.

High-level identity:

**MUSEUM CATALOGUE × IMPRESSIONISM × PERSONAL ARCHIVE**

- `[AT]` is identity punctuation, not a stamp on every title.
- Art themes: one full-screen artwork backdrop per screen, paper veil, one ASCII texture, faint paper washes/keylines on dense clusters.
- Do not add large opaque cards, heavy shadows, or pill buttons.
- Classic / custom / Museum Paper (no artwork): solid palette background.
- Important information must not ellipsize on narrow devices. iPhone 7 / 375pt is a first-class target.
- Motion is presentation only. Progress handlers, habit 0/1/2, and completion math stay unchanged.
- Honor reduced motion. Do not drive artwork with JS frame loops. Living Canvas is art-theme only.

## Offline / artwork rules

- No runtime museum or network requests for artwork.
- Bundle public-domain / Open Access images and ASCII plates from Met, NGA, AIC (or similarly reputable OA programs).
- Keep attribution metadata (`assets/art/catalog.json`).
- Generate assets with `npm run build:art` during development only. Never run that pipeline against a live user install.
- Do not bundle artwork unless `isPublicDomain` is confirmed.

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
4. Theme resolution: art (old and new ids), classic, and custom
5. Narrow-width layout (375pt / iPhone 7 considerations)
6. Inspect full `git diff`
7. Do not claim physical-device verification unless it was actually performed
