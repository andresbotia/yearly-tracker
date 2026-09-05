# YEARLY TRACKER — PRODUCTION EXPORT PACKAGE
Primary mark **[YT]**. Letters are cubic Bézier outlines in every SVG; nothing depends on Bodoni Moda
at runtime. Recolour by editing the `fill` attribute only — never rescale or re-space the artwork.

## App icons — 1024×1024 square, no rounded corners, no text
| File | Background | Mark |
|---|---|---|
| yearly-app-icon-1024.png / .svg | Ink #1C1916 | Ivory — **primary shipping icon** |
| yearly-app-icon-paper-1024.png / .svg | Museum paper #F6F3EC | Ink |
| yearly-app-icon-cypress-1024.png / .svg | Cypress #3E4F45 | Ivory |

## Marks
| File | Use |
|---|---|
| yearly-mark-ink.svg / -ivory.svg / -cypress.svg | primary vector mark |
| yearly-mark-ink-1024.png / -ivory-1024.png / -cypress-1024.png | transparent raster, 1024 wide |
| yearly-mark-32.svg / yearly-mark-24.svg | small-size optical builds |
| yearly-mark-letters-16.svg | 16 px fallback, brackets removed |
| yearly-mark-128.png / -64.png / -32.png / -24.png / -16.png | square transparent tiles, ink, built per size |

## Splash / launch
| File | Use |
|---|---|
| yearly-splash-mark-paper.svg / .png | ink mark — **default paper launch screen** |
| yearly-splash-mark.svg / .png | ivory mark — dark launch screen |
Mark = 26% of the shorter screen edge; optical centre 2% above true centre. No wordmark, no tagline.

## Wordmarks
yearly-wordmark-ink.svg / -ivory.svg · yearly-wordmark-ink.png / -ivory.png (cap height 200 px, transparent)

## Lockups
yearly-lockup-horizontal-ink.svg / -ivory.svg + .png — default for website and README
yearly-lockup-stacked-ink.svg / -ivory.svg + .png — print, about screens, vertical space

## Favicon / web
yearly-favicon.svg (32 px optics) · yearly-favicon-16.png / -32.png / -48.png · yearly-favicon.ico (16 + 32 + 48 in one file)

```html
<link rel="icon" href="/yearly-favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="/yearly-favicon.ico" sizes="16x16 32x32 48x48">
```

## Documents
| File | Contents |
|---|---|
| BRAND-SPEC.md | colour, type, geometry, clear space, minimum sizes, icon/splash/artwork usage, prohibited treatments |
| CONSTRUCTION.md | exact mark geometry, bracket path, Y and T construction, optical adjustments, placement maths, outline provenance |

## Implementation notes
- The app icon is square by design. Never pre-round the corners; iOS and Android apply their own masks.
- Below 24 px use the letters-only file. Brackets do not survive 16 px.
- Small marks are drawn at each size, not downscaled — use the file that matches your target.
- Clear space is 0.5 × mark height on all sides.
- Mark aspect ratio is 2.08 : 1; wordmark is 14.18 : 1. Scale proportionally only.
