# CONSTRUCTION — [AT] PRIMARY MARK

Coordinate system: viewBox `0 0 2669.93 1300`, cap height U = 1000, y down.
The brackets are **shapes, not glyphs**. The letters are **outlined polygons**, so no font is needed at runtime.

## Bracket (left) — exact path
```
M0 0H261.44V62.75H62.75V1237.25H261.44V1300H0Z
```
Derivation: stem width s = 62.75 (0.048 em), arm length a = 261.44 (0.20 em),
bracket height = 1300 (1.30 U). Right bracket is the same path mirrored:
`transform="translate(2669.93 0) scale(-1 1)"`.

## Letters
Outlined `AT` (Bodoni Moda 500, tracking +15/1000), cap height normalised to 1000 units,
ink width 1702.61, placed at `translate(483.66 150)`, filled with `fill-rule="evenodd"`
(the A's counter is a subpath, not a separate shape).
The full path data is the `<path>` inside `atelier-mark-ink.svg` — copy it verbatim.

## Full structure
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2669.93 1300">
  <g fill="#1C1916" fill-rule="evenodd">
    <path d="M0 0H261.44V62.75H62.75V1237.25H261.44V1300H0Z"/>
    <g transform="translate(2669.93 0) scale(-1 1)"><path d="M0 0H261.44V62.75H62.75V1237.25H261.44V1300H0Z"/></g>
    <g transform="translate(483.66 150)"><path d="&lt;AT outline — see atelier-mark-ink.svg&gt;"/></g>
  </g>
</svg>
```

## Small-size builds
Identical structure; substitute s and gap from the spec table and swap in the
Bodoni 600 outline (`atelier-mark-32.svg`, `atelier-mark-24.svg`, ink width 1733.66).

## Provenance
Outlines were generated from Bodoni Moda (SIL Open Font License 1.1) at high resolution and
reduced with a 0.3px tolerance, so on-screen deviation from live type is under 0.05% of cap height.
Colour, not geometry, is the only thing that should ever be edited in these files.
