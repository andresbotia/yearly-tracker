# CONSTRUCTION — [YT] PRIMARY MARK

Coordinate system: viewBox `0 0 2710.44 1300`, cap height U = 1000, y axis down.
Brackets are **shapes, not glyphs**. Letters are **cubic Bézier outlines**, so nothing depends on Bodoni at runtime.

## 1. Bracket — exact path (left)
```
M0 0H261.44V62.75H62.75V1237.25H261.44V1300H0Z
```
Stem s = 62.75, arm a = 261.44, height = 1300 (1.30 U). Values carried over unchanged from the
approved system. Right bracket is the same path mirrored:
`transform="translate(2710.44 0) scale(-1 1)"`
Corners are mitred; the shape is closed and filled. Do not reproduce it with `stroke`.

## 2. Y construction
Bodoni Moda 500 cap Y, outlined. The Didone Y is asymmetric by design: the left arm carries the
thick stroke and terminates in a bracketed slab serif; the right arm is a hairline that meets the
left at the junction just above the vertical midpoint. The stem descends from that junction to a
footed serif on the baseline. The hairline arm is the most fragile element in the identity — it is
why the 32 and 24 px builds move to weight 600, and why 16 px drops the brackets rather than the letters.

## 3. T construction
Bodoni Moda 500 cap T, outlined. Flat crossbar with bracketed downward serifs at both ends,
hairline-to-thick transition into a centred stem, footed serif on the baseline. Crossbar top aligns
exactly with the Y's arm tops — both sit on the cap line, no overshoot.

## 4. Spacing & proportions
| | units |
|---|---|
| Gap bracket → letters, each side | 204 |
| Letters ink width | 1779.56 |
| Letters origin | translate(465.44 150) |
| Total | 2710.44 × 1300 — aspect 2.08 : 1 |
Letter tracking inside the pair is **+5/1000 em** (the previous pair used +15/1000 — the Y/T
junction already opens the pair, so less tracking reaches the same visual density).

## 5. Optical adjustments
1. **Gap 222.22 → 204** (−8%). Y's open upper-left sidebearing lets the bracket read further away than it measures.
2. **Letter tracking +15 → +5/1000 em**, same reason at the letter-to-letter level.
3. **Weight step to Bodoni 600** at 32 px and below, protecting the Y hairline.
4. **Brackets removed at 16 px**; letters only, weight 600, 1813.12 × 1000 units.
Bracket stroke, arm length, bracket height, clear space and optical centring are untouched.

## 6. Full SVG structure
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2710.44 1300">
  <g fill="#1C1916" fill-rule="evenodd">
    <path d="M0 0H261.44V62.75H62.75V1237.25H261.44V1300H0Z"/>
    <g transform="translate(2710.44 0) scale(-1 1)"><path d="M0 0H261.44V62.75H62.75V1237.25H261.44V1300H0Z"/></g>
    <g transform="translate(465.44 150)"><path d="&lt;YT outline — copy from yearly-mark-ink.svg&gt;"/></g>
  </g>
</svg>
```
`fill-rule="evenodd"` is required: the letter counters are subpaths, not separate shapes.

## 7. App icon placement
Canvas 1024 × 1024, flat background rect, no corner radius.
Mark width 704 (68.75%), scale = 704 / 2710.44 = 0.259736.
Placement: `translate(160 322.69)` — horizontally centred,
vertically 2% of the canvas above true centre.

## 8. Splash placement
Frame 1080 × 1080 reference. Mark width = 26% of the shorter screen edge.
Scale = (0.26 × shortEdge) / 2710.44. Horizontally centred; vertical centre 2% above true centre.
Transparent background — the host screen supplies paper or ink.

## 9. Small-size variants
Identical structure, substituting from the spec table:
- `yearly-mark-32.svg` — stroke 143.79, gap 143, Bodoni 600 outline, 2622 × 1300
- `yearly-mark-24.svg` — stroke 169.94, gap 110, Bodoni 600 outline, 2556 × 1300
- `yearly-mark-letters-16.svg` — letters only, 1813.12 × 1000

## 10. Outline provenance
Letterforms derive from Bodoni Moda (SIL Open Font License 1.1). Each glyph was rendered
individually at 3000 px (mark) or 2400 px (wordmark), its contours extracted with 8-connected
marching squares, resampled at uniform arc length, and fitted with least-squares cubic Béziers
at a 0.4-unit tolerance with sharp corners preserved. Contour counts are asserted per glyph
(Y 1, T 1, E 1, A 2, R 2, L 1, C 1, K 1) so no stroke can be dropped or severed.
Total deviation from live type — trace plus fit — stays under **0.06% of cap height**.
Mark: 210 curve segments. Wordmark: 2499 across 18 contours.
In these files, colour is the only value that should ever be edited.
