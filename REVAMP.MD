# ATELIER SPATIAL MOTION + YEAR ARCHIVE PHASE

The counter/haptic/micro-motion foundation is implemented.

The next goal is to make Atelier Tracker feel like one continuous physical
editorial object rather than a set of separate screens and dialogs.

Creative direction:

SHARED OBJECTS
×
PHYSICAL PAPER
×
ARCHIVAL NAVIGATION
×
RESTRAINED CINEMATIC MOTION

Continue on `feature/revamp`.

Do not merge into `main`.

All production data/business-logic requirements remain unchanged.

---

# 1. PRIMARY MOTION PRINCIPLE

Prefer motion that explains:

"this object became that object"

over arbitrary enter/exit animations.

Examples:

theme thumbnail
→ full-screen artwork

Progress button
→ progress drawer

Add Goal control
→ goal creation sheet

Goal row
→ collapses after delete

Habits tab underline
→ moves to Goals

Use spatial continuity.

Do not make every object bounce.

---

# 2. THEME SELECTION TRANSITION

The new 72-art stamp-grid gallery is now a major Atelier experience.

Selecting artwork should feel special.

Current conceptual behavior:

tap artwork
→ theme swaps

Improve this into an Atelier transition.

Desired feeling:

the user takes a work from the collection
and places it onto their personal workspace.

## Possible sequence

1. user taps a stamp/artwork
2. selected stamp receives a subtle selection response
3. gallery begins dismissing
4. new painting expands/fades toward full-canvas presence
5. old backdrop dissolves away
6. paper veil resolves
7. UI returns above the selected painting

Do not require a fragile true shared-element library if the current stack does
not support it cleanly.

A convincing visual approximation using:

- position
- scale
- opacity

is acceptable.

Performance and reliability matter more than technical novelty.

---

# 3. RANDOM ART REVEAL

Random Art should make opening Atelier feel slightly different each time.

When Random Art resolves a new session painting:

avoid an abrupt image swap.

Suggested entry:

Museum Paper / neutral veil
→ artwork slowly resolves underneath
→ interface appears clearly above it

Approximately 400–700ms after JS is ready.

Do not slow app startup waiting for this.

Do not turn this into a long intro animation.

---

# 4. THEME CROSSFADE

Any normal fixed-theme change should crossfade cleanly.

Old artwork:
fade out

New artwork:
fade in

Paper veil:
remain stable enough that text does not flash or lose contrast

ASCII:
transition subtly after/with artwork

Palette-dependent UI accents:
transition where practical

Avoid flashing solid backgrounds between artwork images.

Classic/custom themes should transition gracefully too.

---

# 5. HABITS / GOALS TAB MOTION

Refine the primary navigation.

Current underline should become a moving indicator.

Tap HABITS / GOALS:

- indicator glides to the selected label
- outgoing content shifts/fades slightly
- incoming content enters from a small opposing offset
- total interaction should remain fast

Suggested:
~180–240ms

Do not use full-screen carousel motion.

This is navigation, not a slideshow.

Swipe navigation may be considered only if it does not conflict with habit/counter
gestures.

---

# 6. ACTION → DRAWER CONTINUITY

Refine:

PROGRESS
→ Atelier progress drawer

ADD GOAL
→ Add Goal sheet

ADD HABIT
→ Add Habit sheet

The pressed action should feel visually related to the surface it opens.

A perfect shared-element morph is not required.

Possible approach:

1. action wash fills slightly
2. surrounding content subtly de-emphasizes
3. bottom sheet rises immediately
4. matching accent/keyline continues into the sheet

The purpose is continuity.

Do not create slow theatrical modal transitions.

---

# 7. NEW GOAL / HABIT INSERTION

After successfully adding a goal or habit:

do not simply reload the list.

Animate the new record into its correct position.

Desired behavior:

- sheet closes
- new row appears with slight translate/fade
- existing rows move naturally
- numbering/indexing resolves smoothly

Keep existing data ordering logic.

Do not create duplicate temporary objects.

---

# 8. DELETE / UNDO MOTION

Deletion should communicate removal clearly.

Suggested sequence:

1. destructive action confirmation
2. item briefly enters danger-ink state
3. opacity reduces
4. row height collapses
5. surrounding rows close the space
6. existing Undo recovery remains available

If Undo is used:

- row should reappear smoothly
- restore correct position
- do not duplicate

Do NOT make items fly dramatically off-screen.

---

# 9. REORDER MOTION

Existing drag/reorder behavior remains.

Improve tactile presentation.

While held:

- slight scale ~1.01–1.015
- stronger editorial surface wash
- selection haptic once
- neighboring rows smoothly make room
- perhaps faint index/drag marker

On release:

- row settles into position
- numbering updates smoothly

Avoid large floating shadows.

---

# 10. COLLAPSING ATELIER HEADER

The full Atelier header is beautiful but consumes significant vertical space.

Create a restrained scroll-responsive header.

## Expanded state

[AT] ATELIER TRACKER / 2026

Atelier Tracker

WHEAT FIELD WITH CYPRESSES
VINCENT VAN GOGH · 1889 · THE MET

## Collapsed state

[AT] ATELIER TRACKER 2026

As the user scrolls:

- large serif title fades/translates away
- artwork metadata reduces/fades
- compact header becomes sticky
- backdrop remains visible
- content gains usable screen space

Do NOT make it feel like a standard opaque navigation bar.

Keep it light and editorial.

### Performance

Avoid per-frame JS state updates from scroll.

Prefer native/Reanimated scroll values.

---

# 11. HISTORY MONTH NAVIGATION

Improve Habit History navigation.

The existing long archive can remain available, but introduce a stronger month
navigation treatment if it improves usability.

Concept:

JAN FEB MAR APR MAY JUN JUL AUG SEP
───

Horizontal scrub/tap navigation:

- selected month is emphasized
- haptic tick at month changes
- month content transitions smoothly

Do not remove history data.

Do not compromise access to older months.

---

# 12. NEW FEATURE — YEAR ARCHIVE

Add a new Year / 365 archival view.

This should become a signature Atelier feature.

It should visualize the user's year as a personal archive rather than another
generic analytics dashboard.

Possible label:

YEAR ARCHIVE

or

2026 / ARCHIVE

---

# 13. YEAR ARCHIVE DATA

Use existing habit data.

Do NOT introduce a second tracking database.

Represent each calendar day from Jan 1 → Dec 31.

Possible visual encoding:

`.` = no meaningful completion / empty

`+` = positive activity

`×` = negative / intentionally marked bad

For days with multiple habits, derive a visual density/summary using existing
checks.

The exact aggregate formula should be simple, deterministic, and documented.

Do not rewrite existing habit history.

---

# 14. YEAR ARCHIVE VISUAL

Think:

museum accession sheet
×
ASCII calendar
×
365-day contribution map

But NOT GitHub clone styling.

Potential layout:

JAN .++.+...++++....
FEB ++++..×.+.......
MAR ...+++++++......
...

or a carefully spaced 365-cell grid.

Must work on 375pt width.

Possible behavior:

- month separators
- tiny mono date labels
- artwork visible beneath
- paper surfaces only where necessary

---

# 15. YEAR ARCHIVE ENTRY MOTION

When entering the Year Archive:

cells may populate/reveal progressively.

Keep it restrained.

Example:
Jan → current month reveal over ~400–700ms.

Do not individually animate hundreds of views with expensive JS timers.

Use a performant reveal/mask/opacity technique.

Reduced motion:
show immediately.

---

# 16. DAY DETAIL

Tapping a date may reveal a small Atelier ledger detail:

03 SEPTEMBER 2026

WORKOUT +
CARDIO ×
DRINK WATER +
READ .

This should consume existing habit checks.

Do not create new daily-note schemas in this phase.

---

# 17. YEAR ARCHIVE NAVIGATION PLACEMENT

Integrate this without cluttering the primary Habits / Goals tabs.

Possible access points:

- Habit History
- a small Archive action
- existing ledger/history navigation

Use judgment based on current app structure.

Do NOT add a third huge primary tab unless it genuinely improves hierarchy.

---

# 18. SHARE AS PRINT

Rework the final share-generation experience to feel like producing an archival
print.

Do not alter actual image capture/share contracts.

Flow:

Choose share format
→ Generate
→ card reveals vertically like a print emerging
→ user previews result
→ native Share

Possible microcopy:

[AT] / PRINT

or

PREPARING PRINT

Do not artificially delay sharing for long animation.

The reveal should occur while/after the real card becomes available.

---

# 19. SHARE CARD MOTION DOES NOT ENTER OUTPUT

The animation is UI only.

The exported image itself remains:

- static
- correctly sized
- deterministic
- existing capture-compatible

Do not accidentally capture transitional animation frames.

---

# 20. COMPLETION ACCESSION LANGUAGE

Continue evolving the `[AT] / GOAL COMPLETE` concept.

A brief completion mark may include the current goal index:

[AT] / 04 / COMPLETE

or similarly restrained accession-style notation.

Do NOT permanently clutter completed goal rows.

Do not generate a new persistent accession identifier.

This is presentation.

---

# 21. BUTTON MICROINTERACTION CONSISTENCY

Audit buttons/controls across the app.

Make sure:

- same press timing
- same scale philosophy
- same paper/ink response
- same haptic reasoning

Particularly:

- gallery stamps
- theme artist chips
- toolbar actions
- sheet actions
- Share
- Back
- Apply
- Save
- Cancel

Avoid each component inventing its own spring.

---

# 22. LIVING CANVAS AUDIT

The Living Canvas is already implemented.

Do not make it stronger during this phase.

Audit whether:

- gallery transition
- collapsing header
- tab motion
- sheet motion

combined with ambient artwork movement becomes visually excessive.

If necessary, temporarily pause Living Canvas during:

- active drawer/sheet interactions
- large theme transitions

Resume after transition.

---

# 23. REDUCED MOTION

Everything in this phase must obey the existing reduced-motion system.

Reduced motion alternatives:

Theme selection:
simple crossfade

Tabs:
instant indicator + light fade

Sheets:
minimal translate/fade

Row insert/delete:
simple opacity

Header:
immediate/low-motion state change

Year Archive:
no progressive reveal

All functionality remains identical.

---

# 24. PERFORMANCE

This phase must not compromise physical-device performance.

iPhone 7 remains a baseline.

Be especially careful with:

- 72 artwork assets
- gallery scrolling
- artwork crossfade
- Living Canvas
- scroll-responsive header
- Year Archive
- row animations

Avoid:

- large JS scroll handlers
- simultaneous high-resolution images staying mounted unnecessarily
- hundreds of independently animated components
- repeated layout measurements
- runtime image effects

---

# 25. DO NOT IMPLEMENT BRAND-BLOCKED ITEMS YET

The following remain in the Brand Asset Backlog:

- final app icon
- final `[AT]` SVG
- final wordmark
- production splash artwork
- splash → exact-logo shared transition
- store marketing assets

Do not improvise final assets.

Continue using the text `[AT]` placeholder where needed.

---

# 26. DATA SAFETY

Do not change:

- AsyncStorage schemas
- storage keys
- goal data
- habit semantics
- yearly history
- rollover
- custom themes
- Random Art persistence
- bundle identifiers
- widget contracts except backward-compatible additions already approved

Year Archive derives from existing habit checks.

Do not create duplicate history storage.

---

# 27. VERIFICATION

Run:

`npm run verify:storage`

`npx expo-doctor`

Verify:

- Habits/Goals switching
- theme crossfade
- Random Art startup
- gallery selection
- drawer actions
- add insertion
- delete + Undo
- drag reorder
- history
- Year Archive calculations
- share capture
- reduced motion
- widget payload remains valid
- classic/custom themes still work

Do not claim physical-device testing unless performed.

---

# 28. FINAL REPORT

Report:

1. motion/navigation changes
2. gallery theme transition
3. tab transition
4. drawer/action continuity
5. insert/delete/reorder animation
6. collapsing header
7. Year Archive implementation
8. History navigation updates
9. share-as-print behavior
10. reduced-motion handling
11. performance considerations
12. storage verification
13. build/test results
14. commits
15. remaining device tests
16. items still waiting on Claude Design

Stay on `feature/revamp`.

DO NOT MERGE TO MAIN.
