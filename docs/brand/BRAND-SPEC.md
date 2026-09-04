# ATELIER TRACKER — IMPLEMENTATION SPEC
Identity 1D (approved). All geometry expressed in design units where **U = cap height = 1000**.
Every SVG in this package has letters already outlined — no font is required at runtime.

## 1. COLOUR
| Role | Hex |
|---|---|
| Ink (primary) | #1C1916 |
| Museum paper (light bg) | #F6F3EC |
| Paper deep (icon bg) | #EDE7DA |
| Muted ink (secondary/disabled) | #6B645C |
| Cypress accent | #3E4F45 |
No gradients, no shadows, no additional hues in any logo artwork.

## 2. TYPE
- Mark letters: **Bodoni Moda 500**, optical size 96, tracking **+15/1000 em** (0.015em)
- Small-size mark letters (32px and 24px builds): **Bodoni Moda 600**, tracking +10/1000
- Wordmark: **Bodoni Moda 400**, uppercase, tracking **+160/1000 em** (0.16em)
- Cap-height ratio of Bodoni Moda: 0.765 of font size (used to derive all em values below)

## 3. PRIMARY MARK GEOMETRY  ( [AT] )
| Value | em of type size | design units |
|---|---|---|
| Type size (F) | 1.000 | 1307.19 |
| Cap height (U) | 0.765 | 1000 |
| Bracket height | — (1.30 U) | 1300 |
| Bracket arm length | 0.200 | 261.44 |
| Bracket stroke | 0.048 | 62.75 |
| Gap bracket → letters (each side) | 0.170 | 222.22 |
| Letters ink width | — | 1702.61 |
| **Total mark** | — | 2669.93 × 1300 |
- **Aspect ratio: 2.05 : 1** (2.05:1)
- Letters origin inside the mark: x = 483.66, y = 150
- Bracket corners are mitred: no radius, no stroke caps. Brackets are filled shapes, not stroked lines.
- Vertical placement in any square container: mark sits **2% of the container above true centre**.

## 4. SMALL-SIZE BUILDS (brackets thicken, gaps tighten)
| Target | Letters | Bracket stroke | Gap | Mark units |
|---|---|---|---|---|
| ≥ 64 px | Bodoni 500 | 0.048 em (62.75) | 0.170 em (222.22) | 2669.93 × 1300 |
| 48 px | Bodoni 500 | 0.062 em | 0.150 em | interpolate |
| 32 px | Bodoni 600 | 0.110 em (143.79) | 0.120 em (156.86) | 2570.26 × 1300 |
| 24 px | Bodoni 600 | 0.130 em (169.93) | 0.090 em (117.65) | 2491.84 × 1300 |
| 16 px | Bodoni 600, **brackets removed** | — | — | 1733.66 × 1000 |
- All strokes must land on whole pixels at the target size. Snap, do not anti-alias a 1px stem into 2 grey rows.
- **Brackets disappear at 16px and below.** Two letters at full weight read better than four crowded strokes. Use `atelier-mark-letters-16.svg` / `atelier-mark-16.png`.

## 5. CLEAR SPACE & MINIMUM SIZE
- Clear space: **0.5 × bracket height** on all four sides (= 650 units = 50% of mark height). Nothing enters it.
- Minimum size with brackets: **24 px** wide-side.
- Minimum size letters-only: **14 px**.
- App icon padding: mark width = **68.75% of icon width** (704 of 1024), giving ≥ 160 px clear on each side.

## 6. WORDMARK & LOCKUPS
| Item | Ratio | Spacing |
|---|---|---|
| Wordmark alone | cap 1000, width 14108.23 (14.11 : 1) | — |
| Horizontal lockup | wordmark cap = 0.66 × mark cap | gap 720 units (0.52 × mark height) |
| Stacked lockup | wordmark cap = 0.38 × mark cap | gap 520 units below bracket, centred |
- The wordmark is set in the serif only. Never set "Atelier Tracker" in monospace.
- Monospace (IBM Plex Mono) is for data and catalogue labels in the UI, never for the brand name.

## 7. SPLASH / LAUNCH SCREEN
- Mark width = **26% of the shorter screen edge**; centred horizontally, optical centre 2% above true vertical centre.
- Safe area: keep the mark inside the middle 50% of the screen so no device notch/mask crops it.
- Dark launch screen: background #1C1916, mark #F6F3EC (`atelier-splash-mark.svg`).
- Paper launch screen: background #F6F3EC, mark #1C1916 (`atelier-splash-mark-paper.svg`).
- Optional strapline (mono, 0.22em tracking, #6B645C) sits at 88% screen height — never inside the mark's clear space.

## 8. DARK / LIGHT USAGE RULES
| Background | Mark colour |
|---|---|
| Ink #1C1916 | Ivory #F6F3EC |
| Museum paper #F6F3EC / #EDE7DA | Ink #1C1916 |
| Cypress #3E4F45 | Ivory #F6F3EC |
| Photography / artwork | Ivory only, and only over an area with ≥ 60% tonal contrast |
- Cypress is an accent, not a default: one cypress surface per screen at most.
- Never ink on cypress, never cypress on ink, never ivory on paper.
- Never recolour the brackets independently of the letters in the logo (the in-app UI may tint brackets cypress; the logo may not).
- Never outline, emboss, rotate, stretch, or add a container to the mark. The brackets are the container.

## 9. APP ICON
- Export **1024 × 1024 square PNG, no rounded corners, no transparency, no wordmark.**
- iOS applies its own superellipse; Android adaptive icon: place the 1024 artwork on a 432 canvas with 264 safe circle — the mark at 68.75% width sits safely inside both masks.
- Primary: ink background, ivory mark. Alternates: paper background + ink mark; cypress background + ivory mark.
