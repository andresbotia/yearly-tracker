# ATELIER POLISH PHASE — RANDOM THEMES, EXPANDED GALLERY, COUNTER FIXES, SHEET REWORK, WIDGET THEMING

Continue on `feature/revamp`.

Before changing code:

1. Read `AGENTS.md`
2. Read `REVAMP.MD`
3. Read `design.md`
4. Inspect current implementation and recent commits
5. Stay on `feature/revamp`
6. Do not modify or merge into `main`

This is a continuation of the Atelier Tracker overhaul.
Do not treat this as a separate project or rewrite.

All existing production-safety rules still apply:

- preserve AsyncStorage compatibility
- preserve existing goal/habit/history logic
- preserve widget contract compatibility where possible
- preserve existing user data
- keep all changes additive and upgrade-safe

---

# 1. RANDOM ART MODE

Add a new theme option that randomizes the artwork automatically when the app opens.

## Goal

Allow users to choose a theme mode like:

- specific artwork theme
- Museum Paper
- classic/custom theme
- RANDOM ART

When RANDOM ART is selected:

- every app launch / cold open chooses a random bundled art theme
- the artwork should come only from bundled art themes
- selection should feel curated, not broken
- all other theme behavior should still work

## Requirements

- implement random-art as a real theme option in the theme system
- do not break old stored theme values
- store this mode safely using the existing theme persistence approach
- random choice should happen from valid bundled art themes only
- exclude non-art themes such as Museum Paper, classic themes, and custom themes from the random pool unless explicitly intended
- preserve user choice: if they choose a fixed art theme, it should stay fixed
- theme resolution should remain safe if artwork is missing

## Suggested behavior

If current theme is:
`random-art`

then on app open:

- choose one random art theme from the bundled collection
- resolve all UI/background/widget theme behavior from that selected artwork for the current session

Optionally:

- remember the last random pick and avoid repeating it immediately on the very next launch if easy to implement

Do not overcomplicate this if it risks breaking theme persistence.

---

# 2. EXPAND THE ART COLLECTION BY ~50 MORE WORKS

The current 18-work collection is strong.
Now expand it significantly.

Target:

- add approximately 50 MORE public-domain / Open Access works
- these should be selectable in the app
- keep the collection cohesive and on-brand

This means the app should move from a small set to a substantial Atelier art library.

## Curation rules

The new works should still fit the Atelier identity:

- atmospheric
- painterly
- elegant
- readable behind editorial UI
- mostly landscape / garden / river / floral / softly architectural
- not visually chaotic
- not portrait-dominant
- not too dark or high-contrast

## Preferred artists for expansion

Continue prioritizing:

- Claude Monet
- Vincent van Gogh
- Alfred Sisley
- Camille Pissarro
- Paul Cézanne
- Berthe Morisot

Additional artists are welcome if they clearly fit the same museum/editorial atmosphere.

Possible expansion artists:

- Gustave Caillebotte
- John Singer Sargent (carefully selected landscapes/gardens only)
- Childe Hassam
- Mary Cassatt only if a work truly fits the backdrop aesthetic
- Pierre Bonnard only if the work remains readable and not too busy

Do not include works merely because they are famous.
The backdrop quality matters more than name recognition.

## Sourcing rules

Use ONLY authoritative museum Open Access / public-domain sources.
No Pinterest.
No random wallpaper sites.
No unofficial reproductions.

Maintain metadata for each work:

- id
- title
- artist
- year
- museum
- museumObjectId if available
- source URL
- rights
- isPublicDomain

Generate:

- optimized mobile derivative
- ASCII derivative
- palette metadata

No runtime museum API calls.

## Performance / bundle-size responsibility

Because 50 more works is substantial:

- optimize all derivatives carefully
- keep quality high enough for full-screen backdrops
- be mindful of bundle size
- report the approximate asset impact in the final summary

If needed, preserve a compact derivative strategy, but do not silently skip the collection expansion.

---

# 3. REDESIGN THE THEME GALLERY

The current theme picker is becoming too much of a long scroll list.

It now needs to feel like browsing a curated visual collection.

## Inspiration direction

Take inspiration from visually rich collection browsing / stamp-grid / gallery-wall interactions.

The result should feel more like:

- a curated exhibition browser
- a catalog wall
- a collectible print/stamp selection surface

and less like:

- a plain long settings list

Do not directly copy another design.
Translate the feeling into Atelier Tracker.

## Requirements

Redesign the gallery so the artwork is easier and more enjoyable to browse.

Possible ideas:

- artist-grouped sections with a more visual layout
- a grid / masonry / stamp-board feeling
- compact plates that open larger detail
- a featured section + grouped collections
- a denser “collection browser” with better visual hierarchy
- tabs or segmented artist group browsing if helpful

The final experience must support:

- art themes
- Random Art option
- Museum Paper
- Classic themes
- Custom themes

All should remain accessible and understandable.

## UX goals

Users should be able to:

- browse a lot of works without feeling overwhelmed
- see artwork more quickly
- understand which theme is active
- switch between artists/collections more fluidly
- still access custom/classic options

Avoid:

- endless giant cards
- visually repetitive list rows
- cluttered metadata overload
- tiny unreadable thumbnails

---

# 4. REWORK SHEETS / MODALS

The current add/edit/share sheets work, but the button treatment and paper blocks still feel too generic.

Rework:

- Add Goal
- Add Habit
- Edit Habit
- Edit Goal
- Share
- Theme / Custom Theme flows where relevant

## Goal

These interactions should feel integrated with the art aesthetic.

The sheets should not feel like generic white popups dropped on top of a painting.

## Direction

Blend the sheet language more thoughtfully with the artwork.

Possible techniques:

- museum-paper sheet with subtle tonal depth
- faint art-aware tinting
- subtle top hairline / framing
- minimal translucent wash or softly integrated surface treatment
- restrained layering so the art still belongs to the environment

Do NOT use:

- heavy blur
- loud glassmorphism
- thick rounded cards
- generic iOS stock popup styling
- overdesigned decorative frames

The result should feel:

- editorial
- quiet
- premium
- integrated
- tactile

## Button treatment

The current action buttons in these sheets still need refinement.

Revisit:

- Save
- Cancel
- Share
- Back
- Apply
- Template choices
- Type toggles

Improve hierarchy, spacing, and visual language so the controls fit Atelier better.

Do not hurt accessibility or tap-target size.

---

# 5. COUNTER SCRUB FIX + DISCOVERABILITY

The Atelier Counter concept is good, but the current interaction is not working well enough.

Fix it.

## Problems to solve

- the scrub/scroll area feels too small
- it is not obvious enough that the user can scrub
- the interaction is less reliable than intended
- the animation/gesture handling needs refinement

## Requirements

Make the counter easier to understand and easier to manipulate.

### Improve gesture area

- enlarge the interactive scrub region significantly
- user should not need to hit a tiny exact strip
- the whole number zone / rail should feel draggable

### Improve discoverability

Users should be able to tell that the counter is interactive.

Consider:

- more visual emphasis around the rail
- slight cue text
- subtle motion hint on first open
- directional cues
- a more obviously “scrollable” or “scrubbable” treatment

Do this tastefully.
Do not turn it into a tutorial-heavy control.

### Improve motion quality

The scrubbing should feel smoother and more reliable.

Potential direction:

- a more legible horizontal reel / slider / index track
- stronger snap behavior
- larger center emphasis
- better relationship between drag distance and value change
- more forgiving gesture recognition

It should feel beautiful and satisfying.

Do not directly copy external references.
Use them only as inspiration.

---

# 6. COUNTER EXACT-ENTRY BUG FIX

There is a current bug:

If the counter is at 0 and the user types a value such as 55 and then taps Apply, the new value may not persist correctly.

This must be fixed.

## Requirements

- entering a valid number manually must always save correctly
- the value should persist through the existing handlers
- typed values must clamp to 0…target
- if the value is valid, Apply must commit it
- the current zero-state must not break manual entry

## Keyboard UX

The current keyboard flow also feels buggy.

The numeric entry should be improved so it is obvious how to finish input.

Potential improvements:

- add an explicit keyboard accessory / Done control on iOS
- commit typed draft cleanly on blur and/or Apply
- ensure number-pad behavior does not trap the user
- separate draft string state from committed numeric state properly

Do not rely on the user pressing a return key that may not exist on the current keyboard.

This exact-entry path must be reliable, especially for larger goals.

---

# 7. WIDGET THEME INTEGRATION

Implement the selected app theme into the widgets.

This was already part of the broader vision and should now be completed.

## For art themes

If the user has selected an art theme:

- propagate that selection into widget rendering in a practical widget-safe way
- use the selected artwork / palette appropriately
- if full artwork usage is too heavy or constrained, use a widget-safe crop / derivative / themed background approach
- keep widget readability high

## For Random Art

If the user selected Random Art:

- decide on a stable widget behavior
- recommended: widget uses the currently resolved random artwork/palette for the current session update payload, not a separate random choice on every widget refresh
- avoid jarring inconsistency

## For custom themes

If the user selected a custom theme:

- use the custom primary/background palette in the widget background treatment
- at minimum, apply the custom primary color meaningfully
- keep text contrast and legibility safe

## Safety

Do NOT break:

- widget payload contracts
- existing widget functionality
- existing update paths

If payload changes are needed:

- keep them additive / backward-compatible when possible
- document them clearly

---

# 8. CUSTOM THEMES

Do NOT remove custom themes in this pass.

Keep them working.

We may revisit whether to simplify/remove them later, but that is not part of this implementation.

You may improve how custom themes are presented inside the redesigned gallery if helpful.

---

# 9. GOAL ACTIONS / VISUAL POLISH

Continue refining the visual presentation of:

- Progress action
- Edit action
- Delete action
- CTA rows
- inline control groupings

The action system is better than before, but still deserves another polish pass.

The controls should feel:

- quieter
- more intentional
- more museum/editorial
- less like generic button boxes

Do not reduce usability.

---

# 10. DOCUMENTATION

Update docs as needed.

At minimum review:

- AGENTS.md
- REVAMP.MD
- design.md
- README.md if necessary

Document:

- Random Art mode
- expanded art library
- redesigned gallery
- counter interaction changes
- exact-entry bug fix
- widget theme integration
- any additive widget payload considerations

Do not let docs drift from implementation.

---

# 11. SAFETY RULES

Do NOT break:

- AsyncStorage compatibility
- goal CRUD
- habit CRUD
- history
- rollover
- progress calculations
- habit 0/1/2 semantics
- widgets
- sharing
- art theme compatibility
- custom theme compatibility

Do NOT rename:

- existing AsyncStorage keys
- bundle identifiers
- package identifiers
- widget identifiers/contracts unless absolutely necessary

Do not reseed or wipe existing user data.

This must still feel like a seamless upgrade.

---

# 12. IMPLEMENTATION ORDER

Suggested order:

1. inspect current theme/gallery/modal/counter/widget implementation
2. add Random Art theme mode
3. expand art collection by ~50 more works
4. redesign gallery for larger collection
5. rework sheets/modals
6. fix counter gesture area and discoverability
7. fix exact-entry persistence/keyboard bug
8. integrate theme selection into widgets
9. polish actions/controls
10. update docs
11. run verification
12. inspect diff
13. make focused commits

Stay on `feature/revamp`.
Do not merge to `main`.

---

# 13. VERIFICATION

Before finishing:

- run `npm run verify:storage`
- run `npx expo-doctor`
- verify old stored theme IDs still resolve
- verify Random Art persists and resolves safely
- verify expanded art catalog loads correctly
- verify gallery is usable with the larger collection
- verify Add Goal / Add Habit / Share / Theme flows still work
- verify exact numeric entry works from 0 and non-zero states
- verify Apply always persists correctly
- verify widgets receive theme/custom color data correctly
- inspect narrow layouts
- inspect accidental business-logic changes

At the end report:

1. what changed
2. files changed
3. Random Art behavior
4. expanded art catalog
5. gallery redesign
6. modal/sheet redesign
7. counter fixes
8. exact-entry bug fix
9. widget theme integration
10. storage/build verification
11. commits created
12. remaining physical-device testing

---

# 14. IMPLEMENTED (this pass)

Shipped on `feature/revamp` without merging to `main`.

- Random Art: stored as `random-art` on `rt_hue_v1`. Launch picks a bundled
  art plate, avoiding the previous pick via additive `yt_random_art_last_v1`.
  `makeTheme` receives the resolved plate id. Widgets use that session plate.
- Catalog: 18 locked plates + 54 additional OA landscapes (72 total) from AIC
  and Cleveland, with bundled JPEG + ASCII derivatives.
- Gallery: stamp-grid with artist chips, Random Art tile, Paper / Classic /
  Custom index rows.
- Sheets: `AtelierSheet` + `AtelierActions` + ink toggles for Add/Edit Goal,
  Add/Edit Habit, Share, Theme, and the progress drawer footer.
- Counter: larger framed scrub, cue copy, one-shot hint, `flush()` on Apply,
  iOS Done accessory. Typed 55 from 0 now persists.
- Widgets: additive `themeKind` / `themePrimary` / `themeBg` / `themeText`.
  Native iOS/Android tint from those hex values; legacy `theme` still required.
