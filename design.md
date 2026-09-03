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
- App screens: museum catalogue — indexed rows, hairline rules, full-canvas artwork backdrop, monochrome data
- Share cards: editorial print / museum poster
- Widgets: stay native; do not restyle until a dedicated widget pass

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
If artwork metadata is absent, render the classic/fallback layout with the
solid palette background. Never crash because a theme has no artwork.

## Artwork is the environment

ARTWORK IS A FULL-CANVAS BACKDROP FOR ART THEMES.

Not a rectangular hero plate inside the content flow.

```
[ FULL SCREEN ARTWORK BACKGROUND ]

        YEARLY TRACKER
        HABITS / GOALS
        DATA
        CONTENT
```

Layering (one image per screen, stationary while content scrolls):

1. Full-screen painting (`resizeMode="cover"`, edge-to-edge behind safe area)
2. Translucent warm paper veil / tonal scrim (~65–80%)
3. Subtle ASCII print texture (~3–8%)
4. Scrollable app UI

The painting must remain clearly recognizable. Do not raise the veil until the
art disappears. Text contrast must stay excellent. Tune per theme rather than
treating opacity numbers as law.

Prefer Image + absolute fill + simple overlays. Avoid runtime blur.

Classic themes, custom themes, and Museum Paper (no plate) use their palette
`bg` only.

`ArtBackdrop` (`components/art/ArtBackdrop.js`) is the structural component.
Do not recreate the image on every list row.

`ArtHero` may still be used for gallery thumbnails, compact previews, and share
cards. Primary Goals / Habits / History screens must not also show the same
giant rectangular plate.

## Attribution
Restrained editorial credit, not a second hero.

```
CYPRESSES
VINCENT VAN GOGH · 1889 · THE MET
```

Titles may wrap. Do not ellipsize artwork titles on narrow devices.
Keep museum attribution; shorten known names when it helps (The Met).

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
- One editorial control system per screen: equal hairline cells, short verbs.
- Primary fill is for true confirmation (modal confirm, undo).
- Copy: "Add goal", "Update", "Explore the new look". No marketing voice.
- Do not mix an outlined primary with floating ghost actions on the same row.
- Do not bring back generic pill buttons.

Goal row actions (edit / update / delete) are one designed strip, not mixed
icon + pill + icon. Keep 44pt tap targets, including near the bottom safe area.

## Responsive
iPhone 7 / 375pt-wide devices are a first-class layout target.

IMPORTANT INFORMATION MUST NOT ELLIPSIZE ON NARROW DEVICES.

Responsive typography should scale or reflow first.

- "September" must never become "Septe..."
- Artwork titles may wrap deliberately
- Data tables may scroll horizontally when appropriate
- Habit date cells stay aligned with their header numerals
- History is archival and data-dense: smaller hierarchy than Habits/Goals,
  more room for the month matrices

Verify safe area, scroll, clipping, tap targets, iPhone 7, modern iPhones, and
Android. Do not change underlying behavior to fix layout.

## Modals
Square-ish paper panels, hairline rules, Fraunces title, mono kicker. No
generic rounded SaaS cards.

Never display multiple modals at once. Order:

1. Existing onboarding / rollover / critical modal
2. Then the one-time revamp introduction

### Revamp introduction
One-time visual intro. Storage key: `yt_revamp_intro_seen_v1` (additive).
Do not reuse `rt_welcome_seen_v1`.

- Title: Meet the new Yearly Tracker
- Body: same private offline tracker; art-led year; data stays on the phone
- Primary CTA: Explore the new look
- Small artwork crop or ASCII detail allowed
- Persist `"1"` after dismiss; never show again unless a future versioned intro is added

## Theme gallery
Thumbnails of bundled plates for ArtThemes. Classic and custom rows keep
palette dots. Selecting an ArtTheme changes the full-screen backdrop.

## ASCII
Texture, not a gimmick. One Text node per plate. Ramp: ` .:-=+*#%@`.
~52 columns. Generated at build time by `scripts/build-art-assets.js`.
Backdrop ASCII is extremely subtle (~3–8%). Never thousands of React elements.
Never compromise text readability.

## Per-page allowances
- Goals / Habits / History use the full-canvas backdrop when artwork exists.
- Theme gallery MAY show artwork thumbnails.
- Share cards: museum poster / archival print. Same capture size and data.
- Widgets: native layouts stay; habit symbols map 0/1/2 to `.` / `+` / `×` only.

## What screens MUST share
- Paper / ink / rule colours (or the active theme palette)
- Display + body + data roles
- Hairline rules instead of stacked cards where we touch UI
- Museum-style attribution when artwork is present
- Readable type over the backdrop (paper veil, not heavier blur)

## What screens MAY differ on
- Whether the backdrop is present (classic / custom / no artwork: no)
- Accent sampled from the active artwork
- Habit grid vs goal index vs history matrix
- History uses a more compact archival header than the primary tabs

## Persistence
Visual redesign never renames AsyncStorage keys or reshapes stored objects.
See the inventory in `utils/storage.js` and `AGENTS.md`.
