Continue Atelier Tracker on `feature/revamp`.

Do not merge main.
Do not run EAS/native builds.
Widgets are working perfectly — leave native/widget architecture alone.

Read:

- AGENTS.md
- REVAMP.MD
- design.md
- latest commits

Implement this focused physical-device QA polish pass.

==================================================

1. # MAKE ONBOARDING STEP 1 ACTUALLY INTERACTIVE

Current problem:

[01 / 04] DAILY LEDGER says:
“Tap a mark to record today.”

But CatalogueOnboarding blocks the real habit interaction because the
full-screen overlay captures pointer events.

Fix this without making the rest of the app interactive during onboarding.

For Step 1 only:

- highlight the ACTUAL today's habit mark/cell, preferably the first starter
  habit's today cell, not the entire habit row
- allow that highlighted cell to be tapped while onboarding remains visible
- it must call the SAME real habit state-change path used normally
- preserve the exact semantics:
  . -> + -> × -> .
- preserve real persistence
- preserve haptics
- widget sync can occur naturally through the existing path
- user may tap it multiple times
- do NOT auto-advance after one tap
- NEXT remains the way to continue

Do not simply make the whole onboarding overlay `pointerEvents="box-none"`.

Everything outside the explicitly highlighted interactive target must remain
blocked so users cannot accidentally:

- switch tabs
- open Theme
- open Add Habit
- Share
- drag rows
- trigger unrelated actions

Preferred architecture:
full blocking overlay

- one transparent/positioned interactive hit target matching the measured real
  today cell
- that hit target invokes the real habit toggle handler.

If there are no habits, gracefully fall back to highlighting the ledger header
and keep Step 1 informational rather than crashing.

================================================== 2. DYNAMIC ONBOARDING CARD MEASUREMENT
==================================================

CatalogueOnboarding currently uses an estimated card height (~168px) when
deciding whether to place the annotation above or below its target.

Remove that assumption.

Measure the actual rendered annotation card height using layout measurement,
then position/clamp using the true card height.

Requirements:

- never run off the top/bottom of screen
- work around 375x667 devices
- work on taller devices
- tolerate longer localized/accessibility text
- pointer hairline still connects correctly
- avoid visual jump if possible; initial hidden measurement or stable
  second-pass positioning is fine
- reduced-motion behavior remains correct

Also clamp horizontally as today.

================================================== 3. SHORT-SCREEN WELCOME SAFETY
==================================================

The new Atelier welcome looks good. Do NOT redesign it.

Make it safe for shorter devices / larger text.

Keep:

- mark
- PERSONAL YEARLY ARCHIVE
- artwork
- title
- James Clear quote
- product copy
- ENTER ATELIER
- existing styling

If the content cannot fit vertically:

- allow the CARD CONTENT to scroll
- keep sensible top/bottom padding
- CTA must remain reachable
- do not permanently force scrolling on normal/tall devices
- preserve modal appearance

Do not shrink typography aggressively just to make it fit.

================================================== 4. DEV-ONLY QA / FIRST-RUN STATE MENU
==================================================

Add a small QA tool for development testing only.

Suggested trigger:
LONG PRESS the small `[AT]` brand mark in the main header.

This QA system MUST NOT work in production.

Use React Native's compile-time development flag:
`__DEV__`

Defense in depth:

A. QA trigger only exists/attaches when `__DEV__ === true`

B. QA UI only renders when `__DEV__ === true`

C. EVERY QA mutation/reset function must start with:
`if (!__DEV__) return;`

D. Production/TestFlight/App Store behavior must contain:

- no visible QA affordance
- no long-press QA action
- no QA modal
- no QA reset/mutation path that can execute

Do not use an environment string that could accidentally be left configured.
`__DEV__` is the primary hard gate.

QA card should match Atelier styling and say something like:

[DEV] / FIRST-RUN STATES

Options:

1. SIMULATE FRESH INSTALL
2. SIMULATE OLD YEARLY TRACKER USER
3. SIMULATE EARLIER REVAMP USER
4. REPLAY ONBOARDING
5. RESET THEME-CHOICE PROMPT
6. CLOSE

IMPORTANT:
Do NOT wipe real goals/habits/history/custom themes unless an option explicitly
says it will.

The first-run-state simulations should manipulate PRESENTATION / MIGRATION
FLAGS only wherever possible.

OLD YEARLY TRACKER USER should produce a state equivalent to:

- rt_welcome_seen_v1 = "1"
- yt_revamp_intro_seen_v1 absent
- yt_revamp_theme_choice_seen_v1 absent
- yt_onboarding_seen_v1 = "1"
- preserve current rt_hue_v1
- preserve all goals/habits/history

Then reload/re-evaluate the launch flow so we can test:
rebrand intro -> visual-edition choice.

EARLIER REVAMP USER:

- rt_welcome_seen_v1 = "1"
- yt_revamp_intro_seen_v1 = "1"
- yt_revamp_theme_choice_seen_v1 absent
- yt_onboarding_seen_v1 = "1"
- preserve current theme/data

Expected:
only the visual-edition choice.

REPLAY ONBOARDING:

- only reset yt_onboarding_seen_v1
- do not reset user data/theme
- set state so onboarding can appear again appropriately

RESET THEME-CHOICE:

- only reset yt_revamp_theme_choice_seen_v1

For SIMULATE FRESH INSTALL, do NOT silently destroy the developer's real data.
Either:

- simulate fresh presentation flags in-memory, OR
- clearly make this a presentation-only fresh-launch simulation.

Do not delete:
rt_goals_v1
yt_habits_v1
yt_goal_history_v1
yt_custom_themes_v1

unless an explicitly labeled destructive dev action is later added.
We do not need a destructive action now.

If AsyncStorage.removeItem is needed for additive flags, keep that code inside
the **DEV** guarded QA helper only.

================================================== 5. OPTIONAL REPLAY GUIDE ENTRY
==================================================

Add a very subtle normal-user way to replay the guide later.

Good location:
Theme / collection area, low-priority metadata/action.

Copy:
REPLAY GUIDE

This is NOT dev-only.

Behavior:

- reopens the same catalogue onboarding
- does NOT modify goals/habits/theme
- may reset/write yt_onboarding_seen_v1 as necessary
- should not make onboarding automatically appear every launch afterward

Keep this visually quiet.

================================================== 6. DO NOT REGRESS
==================================================

Preserve:

- production storage keys
- existing-user migration behavior
- fresh-user Random Art
- widgets
- widget sync
- theme persistence
- custom themes
- goals/habits/history
- drag/reorder
- swipe
- share
- rollover
- haptics
- reduced motion
- accessibility
- bundle/package IDs

No native changes should be necessary.

================================================== 7. VERIFY
==================================================

Run:
npm run verify:storage

Run Babel/static parse on touched JS.

Audit:

A. **DEV** true:
long-press [AT] opens QA menu

B. **DEV** false by code inspection:
no trigger
no rendered QA UI
QA mutation functions no-op

C. old-user QA state:
rebrand -> theme choice

D. earlier-revamp QA state:
theme choice only

E. KEEP CURRENT:
rt_hue_v1 unchanged

F. TRY RANDOM ART:
normal random-art persistence path

G. Step 1:
real today habit mark can be cycled . + × . while popup remains open

H. other controls remain blocked during onboarding

I. annotation cards remain onscreen on short viewport

J. welcome remains usable on short viewport

K. Replay Guide works without creating repeated automatic onboarding

Make focused commits.
Stay on feature/revamp.
Do not run EAS.

Report:

- interactive Step 1 implementation
- measured-card positioning changes
- short-screen welcome handling
- exact **DEV** QA guards
- QA state simulation behavior
- Replay Guide placement
- verification
- commit hashes

Stop ready for Metro physical-device QA.
