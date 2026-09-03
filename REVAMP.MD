# ATELIER MOTION + TACTILE INTERACTION PHASE

The visual rebrand and art-theme collection are now established.

The next phase focuses on how Atelier Tracker FEELS to use.

Creative direction:

ANALOG INSTRUMENT
×
ARCHIVAL INDEX
×
QUIET DIGITAL MOTION

This remains part of `feature/revamp`.

Do not create a separate branch.
Do not modify or merge into `main`.

All existing storage/business-logic safety requirements still apply.

---

# 1. PRIMARY OBJECTIVE

Current goal update interactions are functional but still feel like conventional mobile-app controls.

Examples that should be reconsidered:

- large `EDIT / UPDATE / DELETE` button rows
- count goal `- / number / +`
- milestone `NOT YET / DONE`
- static percentage changes
- static progress bars
- abrupt modal transitions

Redesign these interactions so they feel native to Atelier Tracker.

Do NOT sacrifice usability for novelty.

Motion should:

- acknowledge input
- communicate data changes
- make tracking satisfying
- reinforce the archival/editorial identity

Motion should NOT:

- become gamification
- bounce constantly
- use confetti
- use flashy particles
- distract from the artwork
- make routine actions slower

---

# 2. MOTION LANGUAGE

Use four motion levels.

## MICRO — ~100–180ms

For:

- button press feedback
- habit state changes
- counter ticks
- toggles
- focus/selection

Potential treatment:

- 0.98 scale
- slight opacity/tonal shift
- border/keyline darkening
- subtle haptic

No exaggerated bounce.

## INTERACTION — ~180–300ms

For:

- progress updates
- counter snapping
- tabs
- drawers
- state transitions

Use restrained springs where appropriate.

## COMPLETION — ~450–800ms

Reserved for:

- completing a goal
- completing a milestone

These should feel meaningful but mature.

## AMBIENT — ~30–60 seconds

Reserved for:

- barely perceptible art movement
- subtle ASCII/paper movement

Ambient animation must be almost invisible.

---

# 3. CREATE THE ATELIER COUNTER

Replace the generic count-goal interaction:

`[-] [3] [+]`

with a purpose-built tactile counter.

Visual concept:

CURRENT / TARGET

             003
             ───
       001 002 [003] 004 005

       +++.................

              15%

The interaction should evoke:

- a mechanical counter
- film advance
- an archival index
- a precision instrument

Do not literally copy another product.

Create Atelier's own interpretation.

---

# 4. ATELIER COUNTER INTERACTION

Support multiple input methods.

## Horizontal scrub

Dragging horizontally adjusts progress.

As values cross integer boundaries:

- provide a light haptic tick
- animate neighboring values
- center value remains visually dominant
- values should magnetically snap

On release:

- settle naturally to the nearest valid value

## Tap

Allow single-step increment/decrement through intuitive tap regions or subtle controls.

Do not require precise swiping for a simple +1.

## Long press

Allow controlled repeated increment/decrement.

Acceleration may increase gently during a long hold.

## Direct entry

Tapping the primary number should allow exact numeric input.

This is REQUIRED for large goals.

Example:

`Run 500 miles`

A user must be able to go:

`288 → 337`

without swiping through 49 individual values.

---

# 5. ADAPT COUNTER SCALE TO TARGET SIZE

The visual interaction should adapt intelligently.

Example:

Target 20:

- integer-by-integer wheel works beautifully

Target 500:

- direct entry and faster scrubbing become more important

Target 10,000:

- do not render thousands of neighboring numbers
- virtualize the concept
- keep animation lightweight

Do not create performance issues based on goal target size.

The counter is presentation only.

Use the existing progress persistence handlers.

---

# 6. ANIMATE PROGRESS CHANGES

Important numeric changes should not abruptly replace text.

Examples:

`03 → 04`

`15% → 20%`

`4% yearly → 5% yearly`

Possible treatment:

- vertical roll
- translate/fade
- digit swap

Keep animations short.

Synchronize numeric animation with the ASCII/editorial progress representation.

Example:

`+++.................`

becomes:

`++++................`

The newly added `+` may briefly appear using the active artwork accent before settling into ink.

---

# 7. MILESTONE GOAL INTERACTION

Replace the generic:

`NOT YET / DONE`

segmented control.

Create a simple Atelier milestone control.

Concept:

`○  INCOMPLETE`

becomes:

`●  COMPLETE`

The interaction should feel like applying an archival mark or catalog stamp.

Possible completion sequence:

1. touch response
2. indicator fills
3. label transitions
4. progress line completes
5. success haptic
6. brief Atelier completion notation appears

Example:

`[AT] / GOAL COMPLETE`

Then quietly settle.

No:

- confetti
- fireworks
- coins
- trophy explosions
- loud badges

---

# 8. GOAL COMPLETION MOMENT

When a count goal reaches 100%:

- animate the final number
- animate percentage to 100%
- complete the editorial progress line
- trigger tasteful success haptic
- briefly display an Atelier completion mark
- settle into the EXISTING completed state

Do not change:

- completion calculations
- completed sorting
- hide completed
- persistence

Presentation only.

---

# 9. REDESIGN GOAL ACTIONS

The current three large buttons:

EDIT
UPDATE
DELETE

consume too much visual weight.

Refine this action system.

Goals themselves should remain the focal point.

Explore a quieter editorial interaction such as:

`EDIT     PROGRESS     DELETE`

or an indexed action rail / small textual controls.

Requirements:

- tap targets remain accessible
- destructive action remains clearly differentiated
- controls must work on iPhone 7
- no tiny inaccessible text links
- no generic rounded icon buttons

Consider making the most common action — updating progress — clearly primary without making every goal row visually heavy.

---

# 10. ATELIER DRAWER

Evaluate replacing count/milestone centered update modals with a reusable bottom drawer.

Concept:

────────────────────────────
02 / READ 20 BOOKS

CURRENT PROGRESS

             003

      001 002 [003] 004 005

+++............... 15%

CANCEL APPLY
────────────────────────────

The artwork remains visible above and subtly behind the drawer.

Drawer visual language:

- museum paper
- hairline rule
- Atelier typography
- square edges / minimal corner radius
- no generic SaaS card styling

Motion:

- rise from bottom
- restrained spring
- safe-area aware
- keyboard-aware
- smooth dismissal

Use the drawer for:

- count progress
- milestone state

Potentially use it for editing where appropriate.

Do NOT blindly convert critical or complex dialogs if a standard modal is safer.

---

# 11. HAPTIC LANGUAGE

Create a deliberate haptic hierarchy.

Examples:

## Light tick

- crossing one counter increment
- habit selection
- minor toggle

## Selection

- switching counter mode
- choosing theme/state

## Success

- completing milestone
- reaching 100%

Do not fire strong haptics repeatedly during fast scrubbing.

Throttle appropriately.

Existing habit haptics must continue working.

---

# 12. HABIT ANIMATION REFINEMENT

Keep existing habit logic:

0 = empty
1 = good
2 = bad

Presentation:

`.` → `+` → `×`

Enhance transitions slightly.

Possible treatment:

- quick scale/fade
- accent-color flash
- appropriate haptic

Do not make habit interactions slower.

The character change should remain immediate.

---

# 13. LIVING CANVAS

Add OPTIONAL extremely subtle ambient movement to ArtTheme backgrounds.

Concept:

Artwork transform:

scale:
`1.000 → ~1.012–1.015`

translate:
approximately `3–8px`

duration:
approximately `30–60 seconds`

then reverse smoothly.

ASCII layer may drift independently by only ~1–2px.

The user should NOT immediately think:

"the background is zooming."

They should eventually notice:

"this feels slightly alive."

Avoid obvious Ken Burns effects.

---

# 14. ART-SPECIFIC MOTION MUST REMAIN GENERIC

Do not attempt to animate individual objects inside paintings.

No:

- moving trees
- animated clouds painted from scratch
- AI object segmentation
- generated water motion

The paintings remain paintings.

Motion comes from subtle camera/parallax treatment only.

This keeps:

- artistic integrity
- performance
- offline behavior

---

# 15. REDUCED MOTION

Respect the OS reduced-motion preference.

When enabled:

- disable Living Canvas
- remove long transforms
- drawer may fade/translate minimally
- numeric transitions use simple fades
- all interactions remain fully functional

No feature may depend on animation.

---

# 16. PERFORMANCE

iPhone 7 remains a first-class performance target.

Prefer:

- React Native Reanimated
- UI-thread transforms
- opacity
- transform

Avoid:

- JS-driven frame loops
- runtime blur
- particles
- repeated image processing
- huge animated trees
- unnecessary state updates during drag

One artwork layer remains one artwork layer.

One ASCII layer remains one ASCII layer.

---

# 17. ACCESSIBILITY

The custom counter must remain accessible.

Expose:

- current value
- target
- increment action
- decrement action
- direct-value entry

VoiceOver users must not be required to perform a custom drag gesture.

All motion-enhanced buttons retain meaningful labels.

Milestone controls expose correct checked/completed state.

---

# 18. BUSINESS LOGIC IS FROZEN

Do not modify the underlying semantics of:

- goal progress
- goal target
- completion
- goal CRUD
- habit CRUD
- habit values
- yearly calculations
- history
- rollover
- undo
- reordering
- widgets
- sharing

The motion system consumes existing handlers.

It does not replace them.

AsyncStorage schemas remain unchanged.

---

# 19. DESIGN DOCUMENTATION

Update `design.md` with a formal Motion section.

Document:

- motion durations
- haptic hierarchy
- Atelier Counter
- completion behavior
- Living Canvas
- reduced motion
- performance constraints

Update `AGENTS.md` only where stable engineering rules need clarification.

Keep REVAMP.MD as the implementation specification.

---

# 20. IMPLEMENTATION ORDER

Remain on `feature/revamp`.

Suggested focused commits:

1. `feat/motion-foundation`
2. `feat/atelier-counter`
3. `feat/milestone-interaction`
4. `feat/atelier-drawer`
5. `feat/progress-motion`
6. `feat/living-canvas`

Actual commit names may differ, but keep work separable.

Recommended order:

1. audit current progress handlers/modal flows
2. define motion tokens
3. implement shared animated-number/progress primitives
4. implement Atelier Counter
5. add exact numeric entry
6. implement milestone control
7. implement Atelier Drawer
8. refine goal action controls
9. add completion moments
10. refine habits
11. implement Living Canvas
12. reduced-motion pass
13. performance pass
14. verification

Do not stop after the counter.

Complete the interaction language throughout the app.

---

# 21. VERIFICATION

Run:

`npm run verify:storage`

`npx expo-doctor`

and all other existing relevant checks.

Verify:

- progress values persist exactly as before
- old upgrade fixture still passes
- counter cannot exceed valid bounds
- direct entry validates correctly
- boolean/milestone state persists
- completed sorting still works
- hide completed still works
- undo remains functional
- no duplicate updates
- rapid scrubbing does not flood AsyncStorage/haptics
- reduced motion works
- classic themes do not gain unwanted backdrop motion
- custom themes remain valid
- no native widget contract changed

Inspect diffs for accidental business logic modifications.

Do not claim physical-device testing unless actually performed.

---

# 22. PHYSICAL DEVICE TEST CHECKLIST

After implementation we will test manually:

COUNT GOAL

- +1 feels good
- -1 feels good
- scrub feels predictable
- haptic does not become annoying
- long press works
- direct numeric entry works
- 3 / 20 feels good
- 288 / 500 remains practical

MILESTONE

- incomplete → complete feels satisfying
- complete → incomplete works
- persisted value correct

DRAWER

- iPhone 7
- keyboard
- safe area
- dismissal
- no clipping

ANIMATION

- no dropped frames
- progress transitions smooth
- artwork drift almost imperceptible

ACCESSIBILITY

- reduced motion
- VoiceOver semantics
