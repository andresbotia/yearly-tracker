# Design — Atelier Tracker

A locked design system for this app. Screen redesigns read this file before
emitting UI. Do not regenerate per screen — extend or amend this file when the
system needs to grow.

Product: Atelier Tracker. Brand mark: `[AT]`.
Genre: editorial. Macrostructure family: museum catalogue (app screens).
Theme: custom museum-paper. Display: Fraunces 700 roman. Body: Source Serif 4.
Data: IBM Plex Mono. Going with: audience = a private person tracking a year ·
use = log today's habits and yearly goals · tone = austere editorial archive.

## Genre
editorial

## Macrostructure family
- App screens: museum catalogue — indexed rows, hairline rules, full-canvas artwork backdrop, monochrome data
- Share cards: editorial print / museum poster
- Widgets: stay native; visible titles may say Atelier Tracker; payload contracts stay

## Identity
`[AT]` is the provisional editorial brand mark until final logo assets exist.

Use it tastefully:

- app header kicker: `[AT]  ATELIER TRACKER  /  2026`
- intro modal kicker
- theme gallery collection label
- splash/brand moments

Do not stamp `[AT]` on every page title. It is identity punctuation.

## Theme
Museum paper, not terminal green.

- `--color-paper`   oklch(96.2% 0.012 92)   `#f6f3ec`
- `--color-paper-2` oklch(97.6% 0.008 92)   `#fbf8f1`
- `--color-ink`     oklch(18% 0.018 72)     `#1c1916`
- `--color-ink-2`   oklch(46% 0.018 72)     `#6b645c`
- `--color-rule`    oklch(84% 0.014 85)     `#d8d0c4`
- `--color-accent`  from the active artwork; Museum Paper uses ink
- `--color-focus`   same as accent
- `--color-danger`  `#9b2c2c`

Classic palettes (`utils/theme.js` THEMES) and custom palettes remain valid.
If artwork metadata is absent, render the classic/fallback layout with the
solid palette background. Never crash because a theme has no artwork.

## Artwork is the environment

ARTWORK IS A FULL-CANVAS BACKDROP FOR ART THEMES.

```
[ FULL SCREEN ARTWORK BACKGROUND ]

        [AT] ATELIER TRACKER
        HABITS / GOALS
        DATA
        CONTENT
```

Layering (one image per screen, stationary while content scrolls):

1. Full-screen painting (`resizeMode="cover"`, edge-to-edge behind safe area)
2. Translucent warm paper veil / tonal scrim (~70–76%)
3. Subtle ASCII print texture (~3–8%)
4. Faint paper washes / 1px keylines on dense clusters only
5. Scrollable app UI

Content should feel lightly held on the page, not boxed.

Use `EditorialSurface` for:

- identity / header
- yearly progress
- CTA toolbars
- history header
- goal action strips
- habit rows (wash only)

Do not add large opaque cards, heavy shadows, rounded floating panels, or
thick borders.

The painting must remain clearly recognizable.

`ArtBackdrop` is the structural component. `ArtHero` is for previews only.

## Atelier collection

Curated Open Access plates (~99 bundled works). Impressionist and
post-impressionist landscapes remain the core; the collection also includes
Edo Japanese prints, Turner, Barbizon, Whistler nocturnes, Redon florals,
and American landscape. Gallery groups by artist:

Van Gogh · Monet · Sisley · Pissarro · Cézanne · Morisot · Hassam ·
Caillebotte · Boudin · Sargent · Hokusai · Hiroshige · Turner · Corot ·
Whistler · Redon · Homer · and related landscape painters · Paper ·
Classic · Custom

Locked core ids (do not replace): `cypresses`, `wheat-field-cypresses`,
`women-picking-olives`, `morning-seine`, `haystacks`.

Existing production ids also remain: `flowering-orchard`, `water-lilies`,
`vetheuil`, `museum-paper`.

`random-art` is a stored theme *mode*. On each cold open it picks one bundled
art plate (never Museum Paper, classic, or custom) and keeps that plate for
the session, including widgets.

Artwork must come from authoritative museum Open Access sources (Met, NGA,
AIC, Cleveland Museum of Art). No runtime museum requests.

## Attribution
Restrained editorial credit:

```
CYPRESSES
VINCENT VAN GOGH · 1889 · THE MET
```

Titles may wrap. Do not ellipsize artwork titles on narrow devices.

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
Four levels. Analog instrument × archival index × quiet digital motion.

- Micro (~140ms): press scale 0.98, habit ticks, counter ticks, toggles
- Interaction (~240ms): drawers, progress updates, digit rolls
- Completion (~620ms): milestone / 100% mark only. `[AT] / GOAL COMPLETE`, then settle
- Ambient (~48s): Living Canvas, art themes only. Scale ~1.000–1.013, 3–8px drift. ASCII may drift 1–2px. Never animate objects inside paintings.

Animate transform and opacity only. Reanimated / UI thread. No JS frame loops, blur, particles, or confetti.

### Haptics
- Light tick: counter increment, habit cycle. Throttle during scrub (~42ms)
- Selection: theme/state/drawer actions
- Success: milestone complete, count goal reaches 100%

### Atelier Counter
Count-goal instrument: padded current value, neighbor strip, horizontal scrub
across the whole reel (not only the center number), ± tap, long-press repeat
on ± only, tap-to-enter exact number. No long-press is required to scrub.
Virtualize neighbors (five values). Do not render thousands of numbers.
Persist only on Apply.

Cue: “Drag the reel · tap the number to type.” One-shot hint motion on first
open. Typed drafts commit on blur, iOS Done accessory, and Apply (`flush()`).
Zero must not block saving a typed value such as 55.

### Milestone
`○ Incomplete` / `● Complete`. Archival mark, not a segmented control.

### Drawer
Bottom sheet, museum paper, hairline, square edges, 3px accent rule. Rise from bottom. Keyboard- and safe-area-aware. Used for progress, add/edit goal, add/edit habit, and Year Archive day detail. Critical/complex dialogs (theme gallery, share, rollover, welcome) may remain centered or existing modals.

Completion flash (presentation only): `[AT] / 04 / COMPLETE` using the goal’s current catalogue index. Do not persist an accession id.

### Reduced motion
Honor OS reduce-motion. Disable Living Canvas, use short fades, keep every control functional. No feature may depend on animation.

Theme selection: simple crossfade. Tabs: instant indicator + light fade.
Sheets: minimal translate/fade. Row insert/delete: opacity only.
Header: immediate/low-motion. Year Archive: no progressive reveal.

### Performance
iPhone 7 is a first-class target. One artwork layer, one ASCII layer. Classic/custom themes must not run Living Canvas. Pause Living Canvas during drawers, sheets, and theme transitions. Crossfade at most two plates, then unmount the outgoing image. Year Archive renders one Text node per month, not hundreds of day views.

### Collapsing header
Sticky kicker: `[AT]  ATELIER TRACKER  /  2026`.
Expanded (scroll top): serif title + artwork credit.
Collapsed: kicker only. Title/credit fade via Reanimated scroll values — no per-frame React state.

### Tabs
HABITS / GOALS share a moving 1px ink indicator (~200ms). Incoming pane fades in from a small opposing offset. Not a carousel. No swipe between tabs (conflicts with habit cells and reorder).

### Theme transitions
Gallery stamp → workspace: selection press, gallery dismisses, new plate scales/fades onto the canvas, previous plate dissolves, veil stays for contrast.
Random Art session start: paper veil first, artwork resolves in ~400–700ms. Do not block JS ready.
Fixed theme changes crossfade. Classic/custom fade art away onto the solid palette.

### Year Archive
Signature accession sheet of the current tracked year, derived only from existing habit checks. No new storage.

Day mark (deterministic):
- G = checks equal to 1, B = checks equal to 2, missing = 0
- `.` if G = 0 and B = 0
- `×` if B > G
- `+` otherwise

Layout: month-labeled ASCII rows (`JAN .++.+…`) on 375pt. Tap a day for a ledger of that date’s habit marks. Access from Habit History (`Archive`), not a third primary tab.

### Share as print
UI-only: `[AT] / PRINT` paper rises while the real card is captured off-screen. Native share is not delayed for the animation. Exported image stays static and capture-sized.

## Microinteractions stance
- Habit cells map 0/1/2 to `.` / `+` / `×` visually. Stored values do not change.
- Progress is the same percentage, drawn as an editorial bar, not a new formula.
- Undo toast remains the recovery path for deletes.

## CTA voice
- One editorial control system per screen: equal hairline cells, short verbs.
- Primary fill is for true confirmation (modal confirm, undo).
- Copy: "Add goal", "Update", "Enter Atelier". No marketing voice.
- Do not bring back generic pill buttons.

## Responsive
iPhone 7 / 375pt-wide devices are a first-class layout target.

IMPORTANT INFORMATION MUST NOT ELLIPSIZE ON NARROW DEVICES.

- "September" must never become "Septe..."
- Artwork titles may wrap deliberately
- Data tables may scroll horizontally when appropriate

## Modals
Museum-paper sheets (`AtelierSheet`): ink hairline, square edges, 3px accent
rule, faint art-primary wash (~5%). No blur, glass, or rounded SaaS cards.

Actions (`AtelierActions`): equal-width hairline cells; Cancel is outline,
confirm is primary fill. Type choices use ink-fill toggles, not pills.

Never display multiple modals at once. Order:

1. Existing onboarding / rollover / habits intro
2. Then the one-time Atelier / revamp introduction

### Atelier introduction
Storage key: `yt_revamp_intro_seen_v1` (additive). Do not reuse
`rt_welcome_seen_v1`.

Existing production users:

- Kicker: `[AT] / NEW EDITION`
- Title: Yearly Tracker is now Atelier Tracker
- CTA: Enter Atelier

Fresh installs:

- Kicker: `[AT] / PRIVATE YEARLY JOURNAL`
- Title: Welcome to Atelier Tracker
- CTA: Enter Atelier
- Do not tell them the app "changed"

## Theme gallery
Stamp-grid / catalog wall, not a long list.

- Random Art tile at the top
- Artist chips to filter the collection; the rail scrolls fully, including the last chip
- Compact plates (3 columns on 375pt, 4 on wider)
- Tile width = (content width − gap × (columns − 1)) / columns
- Equal columns, equal gaps, equal left/right edges — no phantom gutter
- Captions wrap (two lines); long works may use a shorter display title
- Museum Paper, Classic, and Custom remain as index rows below the wall
- Virtualize the stamp grid; do not mount every full-size plate at once

Selected mark is a small ink square on the plate. Titles wrap. Do not ellipsize
artwork titles on the credit line.

## ASCII
Texture, not a gimmick. One Text node per plate. Ramp: ` .:-=+*#%@`.
~52 columns. Generated at build time by `scripts/build-art-assets.js`.

## Widgets
Native widgets keep the existing payload contract. Additive hex fields
(`themePrimary`, `themeBg`, `themeText`, `themeKind`) tint the widget
background. Random Art sends the session’s resolved plate, not `random-art`.
Custom themes send their primary/background. Keep text contrast high.

## Persistence
Visual redesign never renames AsyncStorage keys or reshapes stored objects.
See `utils/storage.js` and `AGENTS.md`.
