# Design — Yearly Tracker

A locked design system for this app. Screen redesigns read this file before
emitting UI. Do not regenerate per screen — extend or amend this file when the
system needs to grow.

Genre: editorial. Macrostructure family: museum catalogue (app screens).
Theme: custom museum-paper. Display: Fraunces 700 roman. Body: Source Serif 4.
Data: IBM Plex Mono. Going with: audience = a private person tracking a year ·
use = log today's habits and yearly goals · tone = austere editorial.

## Genre
editorial

## Macrostructure family
- App screens: museum catalogue — indexed rows, hairline rules, artwork plate, monochrome data
- Share cards (later): editorial print / museum poster
- Widgets: stay native; do not restyle until Phase 6

## Theme
Museum paper, not terminal green.

- `--color-paper`   oklch(96.2% 0.012 92)   `#f6f3ec`
- `--color-paper-2` oklch(97.6% 0.008 92)   `#fbf8f1`
- `--color-ink`     oklch(18% 0.018 72)     `#1c1916`
- `--color-ink-2`   oklch(46% 0.018 72)     `#6b645c`
- `--color-rule`    oklch(84% 0.014 85)     `#d8d0c4`
- `--color-accent`  from the active artwork (cypress green, orchard umber, lily teal, …); Museum Paper uses ink
- `--color-focus`   same as accent
- `--color-danger`  `#9b2c2c`

Classic palettes (`utils/theme.js` THEMES) and custom palettes remain valid.
If artwork metadata is absent, render the classic/fallback layout.

## Typography
- Display: Fraunces, weight 700, style normal. Fallback Georgia.
- Body: Source Serif 4, weight 400. Fallback system.
- Mono / data: IBM Plex Mono, weight 400. Fallback Courier New.
- Display tracking: 0.4
- Kickers: 10px, uppercase, 1.6 tracking, mono or small caps
- Never italicise headings

## Spacing
4-point named scale in `utils/tokens.js` (`SPACE`). Screens must use named
tokens, never ad-hoc magic numbers for new UI.

## Motion
- Duration: 160–240ms. Reduced-motion: opacity only, ≤ 120ms.
- Animate transform and opacity only.
- Haptics stay as they are today (selection / success / drag).
- Silent success. No celebratory confetti.

## Microinteractions stance
- Habit cells map 0/1/2 to `.` / `+` / `×` visually. Stored values do not change.
- Progress is the same percentage, drawn as an editorial bar, not a new formula.
- Undo toast remains the recovery path for deletes.

## CTA voice
- Primary: square-ish fill, hairline, no giant pills.
- Secondary: hairline outline on paper.
- Copy: "Add goal", "Update", short verbs. No marketing voice.

## Per-page allowances
- Goals / Habits / History MAY use a single artwork plate + ASCII overlay.
- Theme gallery MAY show artwork thumbnails.
- Share cards: museum poster / archival print. Same capture size and data.
- Widgets: native layouts stay; habit symbols map 0/1/2 to `.` / `+` / `×` only.

## What screens MUST share
- Paper / ink / rule colours (or the active theme palette)
- Display + body + data roles
- Hairline rules instead of stacked cards where we touch UI
- Museum-style attribution under artwork

## What screens MAY differ on
- Whether the artwork plate is present (classic themes: no)
- Accent sampled from the active artwork
- Habit grid vs goal index vs history matrix

## ASCII
Texture, not a gimmick. Overlay at ~14% opacity on a recognisable painting.
One Text node per plate. Ramp: ` .:-=+*#%@`. ~52 columns. Generated at
build time by `scripts/build-art-assets.js`.

## Persistence
Visual redesign never renames AsyncStorage keys or reshapes stored objects.
See the inventory in `utils/storage.js`.
