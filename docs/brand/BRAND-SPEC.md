# YEARLY TRACKER — BRAND SPECIFICATION
Primary mark **[YT]**. Shipping brand name: **Yearly Tracker**.
All geometry in design units where **U = cap height = 1000**. Every SVG in this package carries
outlined letterforms as cubic Bézier paths — no font is required at runtime.

> Provenance (internal): this system is the approved bracket identity carried over verbatim.
> Bracket geometry, palette, proportions, icon composition and optical rules are unchanged;
> only the letters and the product name are new. The shipping brand is Yearly Tracker.

## 1. COLOUR
| Role | Hex |
|---|---|
| Ink (primary) | #1C1916 |
| Museum paper | #F6F3EC |
| Paper deep | #EDE7DA |
| Muted ink (secondary / disabled) | #6B645C |
| Cypress accent | #3E4F45 |

Background → mark:
| Background | Mark |
|---|---|
| Ink #1C1916 | Ivory #F6F3EC |
| Museum paper #F6F3EC | Ink #1C1916 |
| Paper deep #EDE7DA | Ink #1C1916 |
| Cypress #3E4F45 | Ivory #F6F3EC |

No gradients. No shadows. No new brand colours. Never recolour letters and brackets separately —
the logo is always a single flat colour.

## 2. TYPOGRAPHY
- Mark letters: **Bodoni Moda 500**, optical size 96, tracking **+5/1000 em**
- Small-size mark letters (32 px, 24 px, 16 px builds): **Bodoni Moda 600**, tracking +5/1000
- Wordmark: **Bodoni Moda 400**, uppercase, tracking **+160/1000 em**
- Application UI: Fraunces / Source Serif for editorial text, IBM Plex Mono for data and catalogue labels
- **IBM Plex Mono is never the brand-name treatment.** "Yearly Tracker" is always set in the editorial serif.
- No sans-serif version of the wordmark exists.

## 3. PRIMARY MARK GEOMETRY — [YT]
| Value | design units |
|---|---|
| Cap height (U) | 1000 |
| Bracket height | 1300 (1.30 U) |
| Bracket arm length | 261.44 |
| Bracket stroke | 62.75 |
| Gap bracket → letters (each side) | 204 |
| Letters ink width | 1779.56 |
| **Total mark** | 2710.44 × 1300 |
- **Aspect ratio 2.08 : 1**
- Letters origin inside the mark: x = 465.44, y = 150
- Bracket corners mitred: no radius, no caps. Brackets are filled shapes, never stroked lines.
- In any square container the mark sits **2% of the container height above true centre**.

### Inherited vs adjusted
| | Approved system | [YT] | Note |
|---|---|---|---|
| Bracket stroke | 62.75 | 62.75 | identical |
| Bracket arm | 261.44 | 261.44 | identical |
| Bracket height | 1300 | 1300 | identical |
| Letter gap | 222.22 | 204 | **tightened 8%** — Y's open upper-left sidebearing makes the gap read wider than it measures |
| Letter tracking | +15/1000 | +5/1000 | same reason at letter-to-letter level |
| Letters ink width | 1702.61 | 1779.56 | the Y/T pair is naturally wider than the previous pair |
These are the only optical adjustments in the migration.

## 4. SMALL-SIZE BUILDS
| Target | Letters | Bracket stroke | Gap | Mark units |
|---|---|---|---|---|
| ≥ 64 px | Bodoni 500 | 62.75 | 204 | 2710.44 × 1300 |
| 48 px | Bodoni 500 | 82 | 190 | interpolate |
| 32 px | Bodoni 600 | 143.79 | 143 | 2622 × 1300 |
| 24 px | Bodoni 600 | 169.94 | 110 | 2556 × 1300 |
| 16 px | Bodoni 600, **brackets removed** | — | — | 1813.12 × 1000 |
- Every small size is drawn at its own weight and gap. Never downscale the primary mark to reach them.
- All strokes land on whole pixels at the target size. Snap; do not let a 1 px stem anti-alias into two grey rows.
- **Brackets are removed at 16 px and below** — Y's hairline diagonal plus four bracket strokes cannot
  survive in 16 px. Use `yearly-mark-letters-16.svg` / `yearly-mark-16.png`.

## 5. CLEAR SPACE & MINIMUM SIZE
- Clear space: **0.5 × bracket height** on all four sides (650 units). Nothing enters it.
- Minimum size with brackets: **24 px**.
- Minimum size letters-only: **14 px**.
- App icon: mark width = **68.75% of icon width** (704 of 1024), leaving ≥ 160 px clear per side.

## 6. WORDMARK & LOCKUPS
| Item | Proportion | Spacing |
|---|---|---|
| Wordmark alone | cap 1000, width 14175.28 (14.18 : 1) | — |
| Horizontal lockup | wordmark cap = 0.66 × mark cap | gap 720 units |
| Stacked lockup | wordmark cap = 0.38 × mark cap | gap 520 units below bracket, centred |
- Horizontal lockup is the default for website headers, README files and documentation.
- Stacked lockup is for print, about screens and anywhere vertical.
- Never re-set the wordmark by typing it. Use the supplied outlined files.

## 7. APP ICON
- **1024 × 1024 square PNG. No rounded corners, no transparency, no text, no gradients, no shadows.**
- iOS applies its own superellipse. Android adaptive: place the 1024 artwork on a 432 canvas with 264 safe circle — at 68.75% width the mark clears both masks.
- Primary: ink background, ivory mark. Alternates: museum paper + ink; cypress + ivory. No other icon treatments exist.

## 8. SPLASH / LAUNCH SCREEN
- Mark width = **26% of the shorter screen edge**, centred, optical centre 2% above true centre.
- Keep the mark inside the middle 50% of the screen so no notch or mask crops it.
- Default: museum paper #F6F3EC background, ink mark (`yearly-splash-mark-paper`).
- Dark: ink background, ivory mark (`yearly-splash-mark`).
- No wordmark, no tagline, no loading indicator, no animation. Static and quiet.

## 9. ARTWORK & PHOTOGRAPHY
- Over public-domain artwork the mark is **ivory only**, and only across an area with ≥ 60% tonal contrast and no detail.
- Never place the mark over a face, a focal point, or a busy passage. If no such area exists, put the mark on a paper or ink band instead.
- The mark is never knocked out of artwork, never given a scrim gradient, never blended.

## 10. PROHIBITED
Outlining, embossing, drop shadows, gradients, rotation, stretching, skewing, re-proportioning the brackets,
adding a container or badge behind the mark (the brackets *are* the container), typing the mark in a live font,
recolouring letters separately from brackets, adding a tagline inside the icon, using the mono face for the brand name,
"Yearly Tracker by …", or any secondary consumer brand.

## 11. SUPPORTING LANGUAGE
Approved descriptors: PERSONAL YEARLY ARCHIVE · YEARLY JOURNAL · ART COLLECTION · YOUR CANVAS ·
YEAR IN REVIEW · CURRENT PROGRESS. Set in IBM Plex Mono, uppercase, 0.20–0.24em tracking, muted ink.
Avoid generic productivity language.
