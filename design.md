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

Curated impressionist / post-impressionist plates. Group the gallery by artist:

Van Gogh · Monet · Sisley · Pissarro · Cézanne · Morisot · Paper · Classic · Custom

Locked core ids (do not replace): `cypresses`, `wheat-field-cypresses`,
`women-picking-olives`, `morning-seine`, `haystacks`.

Existing production ids also remain: `flowering-orchard`, `water-lilies`,
`vetheuil`, `museum-paper`.

Artwork must come from authoritative museum Open Access sources (Met, NGA,
AIC). No runtime museum requests.

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
- Copy: "Add goal", "Update", "Enter Atelier". No marketing voice.
- Do not bring back generic pill buttons.

## Responsive
iPhone 7 / 375pt-wide devices are a first-class layout target.

IMPORTANT INFORMATION MUST NOT ELLIPSIZE ON NARROW DEVICES.

- "September" must never become "Septe..."
- Artwork titles may wrap deliberately
- Data tables may scroll horizontally when appropriate

## Modals
Square-ish paper panels, hairline rules, Fraunces title, mono kicker.

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
Calm museum collection. Thumbnails, artist, title, year, museum, palette dots,
selected mark. Titles wrap. Classic and custom remain.

## ASCII
Texture, not a gimmick. One Text node per plate. Ramp: ` .:-=+*#%@`.
~52 columns. Generated at build time by `scripts/build-art-assets.js`.

## Persistence
Visual redesign never renames AsyncStorage keys or reshapes stored objects.
See `utils/storage.js` and `AGENTS.md`.
