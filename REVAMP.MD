Continue Atelier Tracker on `feature/revamp`.

Do not merge main.
Do not run EAS/native builds.
Read AGENTS.md, REVAMP.MD and design.md first.

This is a focused FIRST-LAUNCH / ONBOARDING / HABITS-SCROLL polish pass.
Do not redesign unrelated screens and do not touch working widget architecture.

DEVICE QA FEEDBACK

The latest native development build looks substantially improved and the
widgets are working/syncing correctly. LEAVE WIDGETS ALONE unless a shared
theme-storage change naturally requires the existing sync path to run.

====================================================

1. # CONSOLIDATE THE DUPLICATE WELCOME EXPERIENCES

The app currently shows multiple first-user welcome experiences:

- legacy main welcome with the James Clear quote
- Atelier RevampIntroModal
- potentially the legacy Habits welcome flow

Consolidate these.

NEW USERS must see ONE Atelier-branded welcome only.

Use RevampIntroModal / the current Atelier art-led card as the basis.

Fresh-user layout/copy:

kicker:
PERSONAL YEARLY ARCHIVE

title:
Welcome to Atelier Tracker

Include the existing James Clear quote:

“Success is the product of daily habits—not once-in-a-lifetime transformations.”
— James Clear

Then retain concise product copy along the lines of:

Track your habits, goals, and year through a quiet, art-led interface.

No account. No tracking. Your data stays on your device.

CTA:
ENTER ATELIER

Retain:

- real Atelier mark
- artwork hero
- museum/editorial styling
- hairline rules
- Fraunces / body / mono hierarchy

Remove the separate legacy first-run welcome UI so a fresh install cannot see
two welcome cards back-to-back.

Also retire the separate legacy Habits onboarding modal from presentation.

IMPORTANT:
DO NOT delete or rename old storage keys:

- rt_welcome_seen_v1
- yt_habits_welcome_seen_v1
- yt_revamp_intro_seen_v1

They are part of production migration/history.

They may remain as compatibility signals, but there must be only one visual
fresh-user welcome flow going forward.

==================================================== 2. NEW USERS DEFAULT TO RANDOM ART
====================================================

A truly fresh install should start with the Random Art theme.

Use the EXISTING Random Art system and existing rt_hue_v1 persistence contract.

Do not invent another random-art implementation.

Fresh user:
themeChoice -> random-art
resolve one real bundled artwork
persist through existing theme mechanism
widget receives same resolved artwork through existing sync

Do not overwrite an existing user's saved theme.

Starter goals/habits seeding semantics remain unchanged.

==================================================== 3. EXISTING USERS: SECONDARY STYLE CHOICE
====================================================

Existing users should keep their current saved theme unless they explicitly
choose otherwise.

Their flow should be:

STEP 1:
existing rebrand introduction:
Yearly Tracker is now Atelier Tracker

Keep the reassurance that goals, habits, history and local data remain intact.

STEP 2:
after dismissing that card, show a second small Atelier-styled decision card.

Suggested copy:

kicker:
NEW VISUAL EDITION

title:
Try the new Atelier canvas?

body:
Atelier Tracker can now rotate artwork from the collection as the background
of your yearly journal. You can try it now or keep your current theme.

actions:
TRY RANDOM ART
KEEP MY CURRENT THEME

Behavior:

TRY RANDOM ART:

- set theme through the normal existing theme persistence path
- select random-art
- allow normal widget synchronization
- user can change theme later as usual

KEEP MY CURRENT THEME:

- DO NOT WRITE A NEW THEME VALUE
- leave their exact current theme untouched

Add an additive migration flag, for example:
yt_revamp_theme_choice_seen_v1

Do not overload yt_revamp_intro_seen_v1 for this because users who already
opened an earlier revamp build should still receive this new choice exactly once.

Update storage verification for the additive key.

==================================================== 4. MINIMAL CONTEXTUAL ONBOARDING FOR NEW USERS
====================================================

After a NEW user presses ENTER ATELIER, provide a short guided tour using the
REAL app screen.

Do NOT create a generic full-screen carousel.

Use Atelier-style contextual catalogue annotations / coach marks.

Goal:
teach the app without destroying the quiet minimal visual language.

Suggested 4 steps:

01 / DAILY LEDGER
Point toward the habit marks/rows.
Explain:
Tap a mark to record today.
. empty + good × bad

02 / HABITS + GOALS
Point toward the tab strip.
Explain that Habits tracks daily rhythm and Goals tracks longer-term progress.

03 / YOUR CANVAS
Point toward Theme.
Explain that the Theme control changes the artwork/atmosphere and Random Art
rotates through the collection.

04 / MAKE IT YOURS
Point toward Add Habit / Add Goal as appropriate.
Explain that these controls grow the journal with the user's year.

DESIGN:

- small museum-paper annotation
- thin hairline
- mono catalogue number: [01 / 04]
- short text only
- no giant rounded speech bubbles
- no cartoon hands
- no blue system coach marks
- no dark generic tooltip styling
- no excessive dimming
- no gamification
- no confetti

A tiny pointer/hairline toward the relevant real control is encouraged.

Transitions:

- subtle fade / translate
- use existing motion tokens
- Reduced Motion = fade only
- no long delays

Allow:
SKIP
NEXT / GOT IT as appropriate

If target geometry is not ready yet, wait until layout measurement is available
rather than positioning incorrectly.

Must work at approximately 375pt width.

Only NEW users receive this guided tour.

Use an additive key:
yt_onboarding_seen_v1

Once completed OR skipped, persist it.

Do not show onboarding while another drawer/modal is open.

==================================================== 5. HABITS BOTTOM-OVERSCROLL GLITCH
====================================================

I supplied a physical-device screen recording.

The Goals bottom overscroll is now correct.

Habits still glitches when the user reaches the bottom and continues dragging:
the list/header visibly jumps instead of stretching/releasing naturally.

Inspect Goals vs Habits implementation carefully rather than rewriting the
scroll system.

IMPORTANT CURRENT DIFFERENCE:

Goals DraggableFlatList currently has:

ListFooterComponent={<View style={styles.listBottomSpacer} />}

Habits does NOT appear to have the equivalent ListFooterComponent.

Both already use:

- contentContainerStyle={styles.listContent}
- onScrollOffsetChange={onListScrollOffset}
- bounces
- alwaysBounceVertical
- overScrollMode="always"
- contentInsetAdjustmentBehavior="never"
- automaticallyAdjustContentInsets={false}

The shared onListScrollOffset already clamps ONLY headerScrollY to
HEADER_ANIM_RANGE, which is correct.

First investigate whether the missing real Habits footer/spacer is causing the
short bottom content boundary to fight the collapsing-header geometry.

Make the Habits bottom geometry behave like the now-correct Goals list.

Likely desired pattern:

- real ListFooterComponent bottom spacer
- safe bottom breathing room
- no mutation/clamping of native list scroll position
- header animation derived separately
- native iOS elastic overscroll remains enabled

Be careful not to accidentally double-apply padding/spacers.

Test mentally/static-review:

- 0 habits
- starter 4 habits
- many habits
- drag/reorder
- open swipe row
- 375pt iPhone
- header expanded
- header collapsed
- repeated bottom overscroll

The last habit and toolbar must remain reachable and the release must be smooth.

==================================================== 6. DO NOT REGRESS
====================================================

Preserve:

- all production AsyncStorage data
- all key names
- goal/habit CRUD
- history
- rollover
- reorder
- swipe behavior
- exact counter behavior
- themes/custom themes
- Random Art same-app/widget resolution
- share cards
- widgets
- bundle/package IDs
- reduced motion
- accessibility

Do not touch native widget files for this pass.

==================================================== 7. VERIFICATION
====================================================

Run:
npm run verify:storage

Run Babel/static parse checks on touched JS.

Explicitly audit these launch cases:

A. totally fresh install
ONE welcome -> Random Art -> guided onboarding

B. old Yearly Tracker user
existing theme remains untouched
rebrand popup -> style-choice popup
KEEP means no theme write

C. existing user chooses TRY RANDOM ART
random-art persists and existing widget sync path follows it

D. user who already saw revamp intro but has no new style-choice flag
receives ONLY the style-choice prompt, not the old first-run welcome

E. onboarding completed
does not appear again

F. onboarding skipped
does not appear again

G. Habits bottom overscroll
matches Goals behavior

Make focused commits.
Do not merge main.
Do not run EAS.

Report:

- welcome flows removed/consolidated
- fresh-vs-existing detection logic
- Random Art default logic
- exact existing-user theme-choice behavior
- new additive storage keys
- onboarding structure
- Habits scroll root cause/fix
- storage verification results
- commit(s)

Stop when ready for physical-device Metro QA.
