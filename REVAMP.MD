# ATELIER COLLECTION 99 + REEL INTERACTION REFINEMENT

Continue on `feature/revamp`.

Before changing code:

1. Read `AGENTS.md`
2. Read `REVAMP.MD`
3. Read `design.md`
4. Inspect current implementation and recent commits
5. Stay on `feature/revamp`
6. Do not modify or merge into `main`

This is a focused refinement of:

- Atelier Counter reel interaction
- gallery spacing/responsiveness
- art collection curation

All existing production compatibility rules remain in force.

---

# 1. FIX THE ATELIER COUNTER REEL GESTURE

The current progress reel concept is correct, but the physical interaction is not.

Current problem:

The user appears to need to press/hold deliberately before the number begins to scrub.

The reel should instead feel like a physical horizontal instrument.

Desired behavior:

TOUCH
→ DRAG IMMEDIATELY
→ VALUES MOVE

There should be no perceived long-press requirement before scrubbing.

---

# 2. THE ENTIRE REEL IS DRAGGABLE

Do not make only the center number draggable.

The ENTIRE counter/reel container should be a horizontal gesture surface.

Conceptually this whole region:

001 002 [003] 004 005

should accept dragging.

Also include the visual space immediately above/below the numbers as part of the hit area where practical.

The user should be able to put their finger almost anywhere on the instrument and scrub.

Use a generous gesture target.

---

# 3. HORIZONTAL PAN SHOULD ACTIVATE QUICKLY

Use a pan gesture that activates after a small natural movement threshold.

Do NOT require long press.

Suggested philosophy:

- very small horizontal movement begins scrubbing
- horizontal intent wins when abs(dx) clearly exceeds abs(dy)
- vertical movement should still allow the containing drawer/scroll behavior where appropriate
- do not make the user fight gesture recognition

A threshold in the general range of a few points is appropriate.

Tune on device rather than blindly using one number.

If gesture-handler/Reanimated is used:

- keep the gesture work on the UI thread
- avoid per-frame React setState

---

# 4. SEPARATE PAN FROM LONG-PRESS REPEAT

Long press remains useful for repeated + / − controls.

It should NOT gate reel scrubbing.

Interaction model:

DRAG REEL
→ immediate continuous scrub

TAP − / +
→ one increment

HOLD − / +
→ repeating increment

TAP CENTER NUMBER
→ exact numeric entry

These are separate interaction paths.

---

# 5. REEL SHOULD FEEL PHYSICAL

While scrubbing:

- values translate continuously
- centered value grows / darkens slightly
- neighboring values fade toward the edges
- crossing integer boundaries gives a light throttled haptic tick
- release snaps cleanly to the nearest value
- fast flick may travel farther, but remain predictable

Do not make it feel like dragging static labels.

The reel should visually move under the finger.

Think:

MECHANICAL INDEX
×
FILM COUNTER
×
PRECISION SLIDER

Do not directly copy external references.

---

# 6. REEL DISCOVERABILITY

The user should understand the reel can move without reading instructions.

Improve visual affordance.

Possible treatment:

‹ 001 002 [003] 004 005 ›

or edge fading / partial neighboring values.

The first time the drawer opens, an extremely subtle one-shot motion hint may move the rail a few pixels left/right and settle.

Do not repeatedly animate the hint.

Existing cue copy such as "DRAG TO REEL" may remain if it helps, but the control should be understandable from its visual behavior alone.

---

# 7. EXACT ENTRY REMAINS

Do not remove direct numeric entry.

Tapping the large current number should continue opening exact entry.

Ensure the earlier 0 → 55 bug stays fixed.

Apply must commit the currently typed draft even if:

- keyboard is still open
- field has not blurred
- starting progress was 0

Do not regress this while rewriting the reel gesture.

---

# 8. ART COLLECTION TARGET: 99 TOTAL

The current collection has 72 plates.

Curate the collection toward a FINAL TARGET OF APPROXIMATELY 99 ART THEMES.

Do not simply append exactly 27 arbitrary paintings.

This is now a curatorial pass.

If several current works feel redundant, weak as mobile backdrops, or nearly identical, they may be replaced.

Target:

~99 total excellent plates

rather than:

72 current + 27 mediocre additions

Preserve IDs already used by existing users/dev storage whenever possible.

Never silently delete an existing persisted theme ID without a fallback/alias strategy.

---

# 9. EXPAND ACROSS ART HISTORY

The collection is currently concentrated heavily around Impressionism and
Post-Impressionism.

Broaden Atelier into a more interesting private museum.

The new works should come from different periods and visual traditions while
still fitting the Atelier interface.

Core principle:

DIFFERENT ERA
SAME ATMOSPHERE

Works still need to function behind typography.

---

# 10. NEW CURATORIAL GROUPS

Explore high-quality Open Access works from these directions.

## EDO JAPANESE LANDSCAPE

Priority artists:

- Katsushika Hokusai
- Utagawa Hiroshige

Look for:

- mountains
- rivers
- snow
- mist
- sea
- bridges
- restrained architectural landscapes

Japanese prints are especially interesting for Atelier because:

- flat compositions work well behind UI
- large quiet regions help readability
- strong linework complements ASCII / mono typography
- they broaden the collection historically and culturally

Do not overfill with only Great Wave-style high-drama compositions.

Prefer quiet atmospheric prints too.

---

## ROMANTIC / EARLY 19TH-CENTURY LANDSCAPE

Priority:

- J. M. W. Turner
- similar Open Access landscape painters

Look for:

- mist
- water
- sunrise/sunset
- broad skies
- atmospheric color fields

Prefer Turners with enough quiet space for interface text.

Avoid extremely stormy/busy works if they fight the UI.

---

## BARBIZON / PRE-IMPRESSIONIST LANDSCAPE

Priority:

- Jean-Baptiste-Camille Corot
- related landscape painters

This group should add:

- silver-gray skies
- olive greens
- calm rivers
- soft pastoral environments

These may become some of the strongest practical backgrounds because of their
restrained palettes.

---

## TONALISM / NOCTURNE

Priority:

- James McNeill Whistler

Consider atmospheric Nocturnes where the museum media is confirmed public
domain/Open Access.

These can provide:

- deep slate
- fog
- gray-blue
- sepia
- quieter dark themes

Do not make the whole library light/pastel.

---

## SYMBOLIST / FLORAL

Priority:

- Odilon Redon

Use selectively.

Floral works can introduce:

- unusual color
- dreamlike atmosphere
- stronger accent palettes

Only include pieces that remain usable beneath text.

---

## AMERICAN LANDSCAPE / LIGHT

Consider carefully curated works from:

- Winslow Homer
- Childe Hassam
- John Singer Sargent landscapes/gardens
- other museum Open Access landscape artists

Some of these are already represented.

Avoid adding near-duplicates just to increase artist counts.

---

# 11. POSSIBLE COLLECTION BALANCE

Do not rigidly enforce counts, but aim for a healthy library.

Conceptual balance could be approximately:

- Impressionism / Post-Impressionism: ~45–50
- Edo Japanese prints: ~10–15
- Romantic / atmospheric landscape: ~8–10
- Barbizon / pre-Impressionist: ~8–10
- Tonalist / Nocturne: ~5–8
- Symbolist / floral / unusual quiet works: ~5–8
- other carefully curated Open Access landscapes: remaining slots

The final library should feel broad but coherent.

---

# 12. COPYRIGHT / OPEN ACCESS REQUIREMENT

This rule is absolute.

Do NOT include an image simply because:

"the artist died a long time ago."

The reproduction/media itself must be suitable for bundling.

For every candidate verify the authoritative museum page/API explicitly provides:

- Public Domain / CC0 / Open Access status
  AND
- downloadable media appropriate for reuse

Preferred authoritative sources remain:

- The Metropolitan Museum of Art
- National Gallery of Art
- Art Institute of Chicago
- Cleveland Museum of Art
- Rijksmuseum if its API/object media provides appropriate open reuse
- similarly reputable museum Open Access programs

Do NOT source shipped assets from:

- Pinterest
- WikiArt
- blogs
- wallpaper websites
- Google image results
- random CDNs

Search/previews may help discovery only.

The final bundled image must come from the authoritative Open Access source.

---

# 13. RIGHTS EDGE CASE

Some museum records may label the underlying artwork Public Domain while still
restricting the displayed digital media.

If the actual image cannot be downloaded/reused under the museum's Open Access
terms:

DO NOT BUNDLE IT.

Find another authoritative version or choose another work.

Record:

- title
- artist
- date
- museum
- object id
- source
- rights
- isPublicDomain

for every included plate.

---

# 14. ART QUALITY CONTROL

Before finalizing ~99 works, inspect each derivative as a phone backdrop.

Reject/reconsider works that:

- become muddy under the paper veil
- have important content constantly hidden by the UI
- become illegible when `cover` cropped vertically
- are nearly indistinguishable from another theme
- are excessively busy
- are too dark for the current type system
- add little curatorial value

Quality beats hitting exactly 99.

99 is the ceiling/target, not a requirement to keep weak works.

---

# 15. BUNDLE SIZE

The 72-work collection already adds meaningful asset size.

Before and after expansion, report:

- total JPEG count
- total JPEG bytes
- approximate increase from this pass
- largest individual derivatives

Optimize intelligently.

Do not ship museum-master images.

Do not destroy visual quality to hit an arbitrary tiny size.

If 99 optimized images produce an unreasonable app-size increase, report the
tradeoff clearly rather than silently reducing quality.

---

# 16. GALLERY GRID SPACING

The current stamp-grid has a layout issue:

Each row has three images, but the third tile leaves an awkward empty area /
the spacing does not visually fill the available width evenly.

Fix the grid geometry.

For 375pt layout:

- exactly 3 equal-width tile columns
- exactly 2 equal inter-column gaps
- equal left/right content margins
- artwork image fills its tile width
- label aligns with the artwork width
- no phantom fourth-column space
- no oversized trailing gutter

Do not solve this with arbitrary per-device pixel values.

Calculate tile width from:

available content width
− total intended gaps

divided by number of columns.

Conceptually:

tileWidth =
(containerWidth - gap \* (columns - 1)) / columns

Use consistent gap tokens.

---

# 17. RESPONSIVE GALLERY COLUMNS

Keep the grid responsive.

At narrow mobile widths:
3 columns

At wider phone/tablet widths:
4 or another appropriate count

But every configuration must distribute columns evenly across available width.

Avoid `space-around` behavior that creates different edge gaps from internal
gaps.

Prefer explicit column width + consistent `gap`, or equivalent stable layout.

---

# 18. GALLERY LABELS

Titles below stamps should remain legible.

Allow:

- 2 lines where needed

Avoid:

- ugly `...` truncation where reasonable

Very long works may use a deliberate shorter display title while retaining the
full canonical title in metadata/detail view.

Do not let one tall title destroy row rhythm.

---

# 19. ARTIST FILTER STRIP

The current artist chip strip also needs polish.

In the physical-device gallery, artist names can become partially cut off at
the right edge.

Make the artist/filter rail clearly horizontally scrollable.

Requirements:

- full chip text remains available
- comfortable left/right padding
- selected state remains obvious
- last chip can scroll completely into view
- do not leave a permanently clipped half-chip as if the layout broke

A tiny intentional partial-next-chip affordance is acceptable only if it looks
deliberate.

---

# 20. RANDOM ART

Random Art should automatically include the final approved ~99 art themes.

Do not include:

- Museum Paper
- Classic
- Custom

unless intentionally changed later.

Preserve:

- current session behavior
- skip-last-pick behavior
- widget consistency

---

# 21. THEME TRANSITION PERFORMANCE

A 99-work library should NOT mean 99 full-resolution images mounted at once.

The gallery should only mount/render what it needs.

Continue using efficient list/grid virtualization.

Theme selection crossfade should still keep at most the necessary outgoing +
incoming canvas images mounted.

Do not preload all full-size images into memory.

---

# 22. DO NOT TOUCH BLOCKED BRAND ASSETS

Claude Design backlog remains blocked:

- final `[AT]` SVG
- app icon
- wordmark
- production splash
- exact splash → header logo transition
- App Store marketing assets

Do not improvise those assets.

---

# 23. VERIFICATION

Before completion:

Run:

`npm run verify:storage`

`npx expo-doctor`

Verify:

COUNTER:

- touching anywhere on reel starts drag naturally
- no long-hold required
- vertical drawer interaction still usable
- small target feels precise
- large target remains usable
- - / − tap works
- - / − long press works
- exact entry still works
- 0 → 55 → Apply persists
- haptic does not spam

GALLERY:

- 3-column spacing is mathematically even on 375pt
- wider layouts remain even
- artist filter strip scrolls fully
- title labels behave consistently
- gallery remains smooth with ~99 works
- Random Art includes new works

ART:

- every bundled image has authoritative Open Access provenance
- every derivative exists
- no duplicate IDs
- no broken requires
- no restricted reproduction accidentally bundled

STORAGE:

- all existing theme IDs still resolve
- existing user selection remains safe
- random-art remains safe
- custom themes remain safe

Report:

1. counter gesture changes
2. gallery layout changes
3. final number of art themes
4. works/artists/eras added
5. works removed/replaced and why
6. authoritative museum sources
7. rights validation
8. asset-size impact
9. build/storage verification
10. commits
11. remaining physical-device testing

Stay on `feature/revamp`.

DO NOT MERGE TO MAIN.
