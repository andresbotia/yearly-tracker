Continue work on the existing Yearly Tracker revamp.

You are working ONLY on:

feature/revamp

Do not switch to, modify, or merge into main.

Before making changes:

1. Read `REVAMP.MD` completely.
2. Read `design.md` completely.
3. Inspect the current implementation on `feature/revamp`.
4. Review recent commits.
5. Treat all existing application behavior and AsyncStorage data as production contracts.

This is a focused second visual pass based on physical-device testing.

The redesign direction is working, but the artwork implementation and several responsive details now need to evolve.

==================================================
PRIMARY DESIGN CHANGE
ARTWORK IS THE ENVIRONMENT, NOT A HERO CARD
==================================================

The current implementation places artwork inside a relatively short rectangular ArtHero / artwork plate.

That is no longer the intended direction.

For ArtThemes, the selected painting should become a large, full-screen / full-canvas background behind the application.

Think:

MUSEUM WALLPAPER
×
EDITORIAL PAPER
×
SUBTLE ASCII PRINT TEXTURE

NOT:

content
content
[ rectangular painting ]
content

Instead:

[ FULL SCREEN ARTWORK BACKGROUND ]

        YEARLY TRACKER
        HABITS / GOALS
        DATA
        CONTENT
        CONTENT

all sitting elegantly over the artwork through a readable paper treatment.

==================================================
BACKGROUND ARCHITECTURE
==================================================

Do NOT simply stretch the existing 220px ArtHero.

Create a reusable structural component, something conceptually like:

ArtBackground
ArtBackdrop
MuseumBackdrop

Use whichever name best fits the codebase.

For ArtThemes:

- artwork fills the entire screen
- use `resizeMode="cover"`
- artwork should extend edge-to-edge behind the safe area and scroll content
- artwork should remain visually stationary while lists/content scroll over it where practical
- do not recreate the image on every list row
- use ONE primary background image layer per screen
- keep this lightweight enough for older devices such as iPhone 7

Suggested conceptual layering:

Screen
├── full-screen artwork
├── subtle ASCII layer
├── translucent warm paper veil / tonal scrim
└── scrollable app UI

The actual painting should remain clearly recognizable.

Do not make the overlay so opaque that the artwork disappears.

However, text contrast must remain excellent.

Target the balance visually rather than blindly following exact opacity numbers.

A reasonable starting point could be:

artwork: clearly visible
paper veil: ~65–80%
ASCII texture: ~3–8%

but tune per theme and based on actual device appearance.

Avoid expensive runtime blur effects unless absolutely necessary.

Prefer:

- Image
- absolute positioning
- simple translucent overlays
- preprocessed artwork

over heavy GPU blur.

==================================================
ARTWORK SHOULD FOLLOW THE THEME
==================================================

The selected ArtTheme determines the full-screen painting.

Examples:

Cypresses
→ Cypresses background

Water Lilies
→ Water Lilies background

etc.

Classic themes and user-created custom themes with no artwork must continue rendering normally with their solid/palette backgrounds.

NO artwork metadata:
→ safe classic fallback

Never crash because a theme does not have artwork.

==================================================
REMOVE THE CURRENT LARGE ART PLATE FROM SCREENS
==================================================

Once full-screen artwork exists, Goals/Habits/History should NOT also show the same giant rectangular artwork hero in the content flow.

That duplicates the artwork and consumes too much vertical space.

Refactor `ArtHero` appropriately.

It may still be useful for:

- theme gallery previews
- artwork previews
- share cards

But primary screens should use the new backdrop architecture instead.

Keep museum attribution.

Move attribution into a more restrained editorial treatment, for example:

CYPRESSES
VINCENT VAN GOGH · 1889
THE MET

It can live subtly near the top, bottom, or another intentional area of the screen.

It should not dominate the tracking interface.

==================================================
ASCII
==================================================

ASCII remains:

TEXTURE, NOT A GIMMICK.

Do not turn the whole screen into terminal art.

The ASCII representation may exist across the artwork background but should be extremely subtle.

Keep:

- one rendered ASCII plate/layer
- build-time generated data
- no thousands of React elements

Do not compromise text readability.

==================================================
PHYSICAL DEVICE RESPONSIVE FIXES
==================================================

The current build has now been tested on a physical iPhone.

Treat 375pt-wide devices such as iPhone 7 as a first-class layout target.

Fix the following visible issues:

1. Habits currently truncates the month heading similar to:

   "Septe..."

   This is unacceptable.

   "September" must fit gracefully.

   Use responsive typography/layout rather than truncating important headings.

2. Re-evaluate the Habits header/date grid alignment after removing the large art hero.

3. Preserve the elegant ASCII states:

   . empty
   - good
     × bad

   Stored values remain EXACTLY:
   0 / 1 / 2

4. Goals CTA row currently has:
   outlined ADD GOAL
   floating SHARE
   floating THEME

   Refine this into one intentional editorial control system.

   Do not bring back generic pill buttons.

5. Review each Goal row's:
   edit
   update
   delete

   controls.

   Make them feel like one designed action system and ensure they work cleanly near the bottom safe area.

6. Review the Habit History header hierarchy.

   "Yearly Tracker" + "Habit history" is currently visually very large.

   History should feel more archival/data-dense than the primary screens.

   Preserve hierarchy while reclaiming useful vertical room.

7. Verify:
   - safe area
   - scroll behavior
   - no clipping
   - no text truncation
   - tap targets
   - iPhone 7
   - modern iPhones
   - Android

Do NOT change any underlying application behavior while addressing layout.

==================================================
ONE-TIME REVAMP INTRODUCTION
==================================================

Add a one-time introduction to the new visual identity.

IMPORTANT:

DO NOT reuse or reset:

`rt_welcome_seen_v1`

That is existing production onboarding state.

Introduce a NEW additive storage key such as:

`yt_revamp_intro_seen_v1`

Add it to the storage inventory in `utils/storage.js`.

The absence of this new key should NEVER be interpreted as missing/corrupt user data.

It controls presentation only.

Suggested modal content:

TITLE
Meet the new Yearly Tracker

BODY
Same private, offline tracker. A new art-led way to see your year.

Public-domain artwork, editorial typography, and subtle ASCII details now shape the experience. Your goals, habits, history, and data stay right here on your phone.

PRIMARY CTA
EXPLORE THE NEW LOOK

Design the modal in the new visual language.

Consider:

- small artwork crop or ASCII detail
- strong Fraunces title
- mono kicker
- thin rules
- paper treatment
- no generic rounded SaaS modal

Show it once.

Then persist:

yt_revamp_intro_seen_v1 = "1"

Never show it again unless a future explicitly versioned introduction is added.

Existing production users who update should see this once.

Fresh installs should also receive the introduction, but avoid stacking it awkwardly over the existing welcome/onboarding flow.

Coordinate modal order safely:

existing onboarding / rollover / critical modal
→ resolve
→ revamp introduction

Never display multiple modals simultaneously.

Do not modify existing onboarding data solely to accomplish this.

==================================================
CREATE ROOT AGENTS.md
==================================================

Create:

`AGENTS.md`

in the repository root.

This should become the concise operating manual for future coding agents working in this repository.

Do NOT simply copy REVAMP.MD.

AGENTS.md should document stable engineering rules.

Include sections covering:

# Yearly Tracker

## Project overview

- Expo / React Native
- offline-first
- local-only data
- no accounts
- production mobile app

## Source-of-truth documentation

Define responsibilities clearly:

AGENTS.md
→ engineering/process/safety rules

design.md
→ visual design system and UI rules

REVAMP.MD
→ historical/current revamp specification and rationale

If visual implementation conflicts with design.md, agents should inspect/update design.md deliberately rather than inventing a new per-screen system.

## Git rules

- never work directly on main unless explicitly asked
- current redesign branch is feature/revamp
- focused commits
- no automatic merging
- inspect git diff before completion

## Production persistence contract

Explicitly list all current AsyncStorage keys.

Explain clearly:

LOCAL ASYNCSTORAGE IS PRODUCTION DATA.

Never:

- rename keys casually
- reset storage
- reseed existing users
- alter IDs
- drop unknown fields
- change persisted shapes without explicit migration
- change habit 0/1/2 semantics

Document additive storage changes as the preferred strategy.

Include the new revamp intro key after it is implemented.

## Business logic invariants

Document that agents should preserve:

- goal CRUD
- habit CRUD
- history
- rollover
- percentages
- streaks
- drag/reorder
- haptics
- undo
- sharing
- widgets

## Native boundaries

Explain Android/iOS widget payload contracts must not be casually changed.

## Design rules

Briefly point agents toward design.md.

Include the high-level identity:

MUSEUM CATALOGUE
×
OLD COMPUTER TERMINAL
×
PERSONAL JOURNAL

ASCII is texture, not gimmick.

Artwork themes use full-screen art backdrops.

## Offline / artwork rules

- no runtime museum requests
- bundled assets
- public-domain / Open Access sources
- maintain attribution metadata

## Commands

Inspect package.json and document the ACTUAL useful commands for this repo, including:

- install
- Expo development server
- storage verification
- expo-doctor
- any lint/test commands that genuinely exist

Do not invent scripts.

## Verification checklist

Before declaring work complete:

- storage verification
- expo-doctor
- syntax/import checks
- theme resolution
- physical device considerations
- inspect git diff

Keep AGENTS.md useful and concise enough that future CLI coding agents will actually read it.

==================================================
UPDATE design.md
==================================================

The current design.md still describes a "single artwork plate" as the primary screen treatment.

That is now outdated.

Update design.md so the locked design system reflects what we learned from the physical-device build.

Change the core artwork rule to:

ARTWORK IS A FULL-CANVAS BACKDROP FOR ART THEMES.

Document:

- full-screen artwork behavior
- paper veil / scrim
- ASCII background texture
- classic/custom fallback
- attribution behavior
- responsive requirements
- iPhone 7 / 375pt baseline
- modal styling
- theme gallery thumbnails
- accessibility/contrast rules

Remove/replace rules that instruct primary screens to use the old fixed artwork plate.

ArtHero can remain documented for gallery/preview contexts if useful.

Add the revamp intro modal to the design system.

Also document:

IMPORTANT INFORMATION MUST NOT ELLIPSIZE ON NARROW DEVICES.

Responsive typography should scale/reflow first.

Examples:

- September must not become Septe...
- artwork titles may wrap deliberately
- data tables may scroll when appropriate

==================================================
KEEP DOCUMENTATION CONSISTENT
==================================================

After changing design.md, inspect REVAMP.MD for statements that now directly contradict the full-background artwork approach.

Do not rewrite REVAMP.MD unnecessarily.

Update only the conflicting visual guidance so future agents are not given two incompatible instructions.

AGENTS.md should explain the document hierarchy.

==================================================
DATA SAFETY
==================================================

This is still non-negotiable.

Do NOT change existing production data schemas for this work.

Do NOT rename existing AsyncStorage keys.

Do NOT reset:

- goals
- habits
- history
- theme
- custom themes
- onboarding
- current year

The new revamp-introduction flag is ADDITIVE ONLY.

A production upgrade must remain:

OLD APP DATA
↓
INSTALL REVAMP
↓
SAME GOALS
SAME HABITS
SAME HISTORY
SAME THEME +
NEW VISUAL EXPERIENCE

==================================================
IMPLEMENTATION APPROACH
==================================================

Do this as a focused visual refinement, not a rewrite.

Suggested order:

1. Read docs/code
2. Create/update AGENTS.md
3. Update design.md
4. Reconcile conflicting REVAMP.MD guidance
5. Build reusable ArtBackground/ArtBackdrop
6. Integrate it at the correct screen/root level
7. Remove redundant inline artwork heroes
8. Refine attribution
9. Fix responsive layout issues
10. Add one-time revamp introduction
11. Polish Goals
12. Polish Habits
13. Polish History
14. Review theme gallery
15. Verify classic/custom theme fallback
16. Run automated verification
17. Inspect full git diff
18. Commit focused changes

Do NOT stop after implementing only the background.

Complete this entire pass.

==================================================
FINAL REVIEW
==================================================

Before finishing, inspect every major screen at narrow mobile width.

Specifically verify:

GOALS

- background painting fills screen
- data readable
- CTAs cohesive
- goal controls clean
- no regressions

HABITS

- background painting fills screen
- September does not truncate
- dates align
- state interaction still works
- . + × semantics unchanged

HISTORY

- archival/data-dense hierarchy
- month layouts readable
- no regression in horizontal/vertical scrolling

THEMES

- ArtThemes still change artwork
- classic themes still work
- custom themes still work

MODALS

- new revamp intro
- existing welcome
- rollover
- edit/add flows
- no modal collisions

STORAGE

- run `npm run verify:storage`
- frozen old-storage fixture still passes
- new revamp flag is optional/additive

BUILD

- run `npx expo-doctor`
- run other existing checks from package.json
- do not perform unrelated dependency upgrades

Do not claim physical-device verification unless you actually performed it.

At the end report:

1. What changed
2. Files changed
3. Documentation updates
4. New background architecture
5. Responsive fixes
6. Revamp intro behavior
7. Storage compatibility results
8. Test/build results
9. Commits created
10. Remaining device-test items

Remain on `feature/revamp`.

DO NOT MERGE TO MAIN.
