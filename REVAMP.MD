# ATELIER TRACKER — FINAL BRAND ASSET INTEGRATION / PRE-BUILD PHASE

Status: DELIVERED / INTEGRATED on `feature/revamp`.
Final `[AT]`, app icon, wordmark, splash, lockups, and small-size marks are in
`assets/brand/` and `docs/brand/`. App Store screenshots / marketing release
work is not part of this phase.

Continue the Atelier Tracker overhaul on:

`feature/revamp`

The final Claude Design identity has been approved and delivered.

The production handoff archive is located in the repository root:

`Atelier Tracker rebranding.zip`

This identity is FINAL.

Do NOT:

- redesign the mark
- redraw the brackets
- substitute another font
- create alternate logo concepts
- change the approved geometry
- merge into `main`
- run an EAS build
- create a native development build

This phase ends at:

`READY FOR FINAL DEVELOPMENT BUILD`

---

# 0. SOURCE-OF-TRUTH ORDER

Before changing anything:

1. Confirm branch is `feature/revamp`.
2. Read `AGENTS.md` completely.
3. Read `REVAMP.MD` completely.
4. Read `design.md` completely.
5. Inspect recent commits.
6. Inspect current native iOS and Android configuration.
7. Inspect the current widget implementation.
8. Inspect `Atelier Tracker rebranding.zip`.
9. Extract it temporarily.
10. Read all included brand documentation before integrating assets.

Authority hierarchy:

`AGENTS.md`
→ engineering / persistence / git / safety rules

`REVAMP.MD`
→ current app redesign / implementation requirements

`design.md`
→ app visual system

Claude brand package
→ FINAL logo / wordmark / icon / brand geometry / colors

If there is a conflict:

- production data safety from AGENTS/REVAMP wins
- final brand geometry from Claude wins
- do not improvise either one

---

# 1. EXTRACT THE CLAUDE BRAND PACKAGE

The ZIP is a TEMPORARY HANDOFF ARTIFACT.

Extract:

`Atelier Tracker rebranding.zip`

Inspect its contents before moving files.

Do NOT commit the ZIP itself.

After integration:

- remove the ZIP from the working tree OR
- leave it untracked
- ensure it is not accidentally committed

Do not commit an unnecessary duplicate extracted export folder.

Permanent assets should be organized cleanly.

Preferred structure:

assets/
brand/
marks/
wordmarks/
lockups/
icons/
splash/
web/

docs/
brand/
BRAND-SPEC.md
CONSTRUCTION.md
README.md

If the repository already has a better equivalent structure, use that rather
than creating unnecessary nesting.

---

# 2. BRAND DOCUMENTATION FILES

## BRAND-SPEC.md

Move/preserve:

`BRAND-SPEC.md`

as:

`docs/brand/BRAND-SPEC.md`

Purpose:

This is the FINAL brand implementation specification.

It defines:

- color values
- logo sizing
- clear space
- bracket geometry rules
- minimum sizes
- optical-size variants
- app icon usage
- wordmark rules
- splash usage
- dark/light behavior

Do not casually rewrite these rules.

---

## CONSTRUCTION.md

Move/preserve:

`CONSTRUCTION.md`

as:

`docs/brand/CONSTRUCTION.md`

Purpose:

This documents the exact construction of the `[AT]` mark.

Important:

The brackets are ENGINEERED SHAPES.

They are not typed:

`[` and `]`

Do not rebuild them using text glyphs.

The outlined/vector geometry from Claude is authoritative.

---

## Export README.md

Move/preserve the Claude export README as:

`docs/brand/README.md`

Purpose:

- asset manifest
- intended export usage
- implementation notes

Do not confuse this with the repository root README.

The existing project README remains:

`README.md`

---

# 3. FINAL BRAND COLORS

Lock these identity colors:

## Ink

`#1C1916`

Primary dark identity color.

Use for:

- primary logo on light surfaces
- typography where appropriate
- primary icon background
- museum/editorial chrome

---

## Museum Paper

`#F6F3EC`

Primary light identity surface.

Use for:

- splash
- paper surfaces
- ivory logo color
- neutral Atelier presentation

---

## Paper Deep

`#EDE7DA`

Secondary paper tone.

Use sparingly for:

- subtle depth
- secondary surface differentiation
- archival paper treatment

---

## Muted Ink

`#6B645C`

Use for:

- metadata
- secondary catalogue text
- subdued UI labels

---

## Cypress

`#3E4F45`

Brand accent.

Use selectively.

Do NOT replace painting-derived art-theme palettes with Cypress.

Do NOT make every button Cypress just because it is a brand color.

Artwork themes continue deriving their own palettes.

---

# 4. PRIMARY LARGE MARK

Files may include:

`atelier-mark-ink.svg`
`atelier-mark-ink-1024.png`

Purpose:

Primary `[AT]` mark for light surfaces.

Use:

- Museum Paper
- light brand surfaces
- large onboarding identity
- README / documentation
- marketing
- large in-app branding where appropriate

Ink mark color:

`#1C1916`

Do not modify geometry.

Do not add:

- shadows
- gradients
- outlines
- containers
- rotations
- distortions

---

# 5. IVORY MARK

Files may include:

`atelier-mark-ivory.svg`
`atelier-mark-ivory-1024.png`

Purpose:

Primary `[AT]` mark for dark surfaces.

Color:

`#F6F3EC`

Use when:

- background is Ink
- background is sufficiently dark artwork
- contrast is strong enough

Do not blindly place ivory over pale paintings.

If contrast is poor:
use an appropriate paper/ink treatment.

---

# 6. CYPRESS MARK

Files may include:

`atelier-mark-cypress.svg`
`atelier-mark-cypress-1024.png`

Purpose:

Accent identity variant.

Do NOT make this the default mark.

Preserve for:

- accent treatments
- selected marketing usage
- future alternate icon work
- controlled branded surfaces

---

# 7. OPTICAL-SIZE MARKS

The logo has intentionally different constructions at small sizes.

Respect them.

Do NOT simply shrink the primary SVG for every use.

---

## 128px

File:

`atelier-mark-128.png`

Use for approximately 128px raster contexts when appropriate.

---

## 64px

File:

`atelier-mark-64.png`

Use for approximately 64px UI/native contexts.

---

## 32px

Files:

`atelier-mark-32.svg`
`atelier-mark-32.png`

Use around 32px.

This version has adjusted:

- bracket weight
- spacing
- optical balance

Use this instead of shrinking the large mark.

---

## 24px

Files:

`atelier-mark-24.svg`
`atelier-mark-24.png`

Use around 24px.

This is especially relevant for:

- compact header identity
- widget identity
- smaller UI branding

Use the 24px optical variant.

---

## 16px

Files:

`atelier-mark-letters-16.svg`
`atelier-mark-16.png`

At 16px:

THE BRACKETS ARE INTENTIONALLY REMOVED.

This is a deliberate design decision.

Do NOT reconstruct tiny brackets.

Do NOT use the 24px mark scaled down to 16px.

Use the letters-only optical variant.

---

# 8. PRIMARY SHIPPING APP ICON

Files:

`atelier-app-icon-1024.png`

and possibly:

`atelier-app-icon-1024.svg`

The PNG is the PRIMARY shipping app icon.

Identity:

Ink field:
`#1C1916`

Ivory mark:
`#F6F3EC`

Requirements:

- 1024 × 1024
- fully opaque
- square source artwork
- no rounded corners baked in
- no wordmark
- no painting
- no shadow
- no border

Use platform masks.

This replaces the current Yearly Tracker icon.

Do NOT change:

- bundle identifier
- app identity/container
- update path
- storage

---

# 9. PAPER ALTERNATE APP ICON

Files:

`atelier-app-icon-paper-1024.png`
`atelier-app-icon-paper-1024.svg`

Purpose:

Future alternate icon / brand reference.

Do NOT make this the default shipping icon unless explicitly instructed.

Preserve under:

`assets/brand/icons/`

Do NOT implement alternate-icon switching in this phase.

---

# 10. CYPRESS ALTERNATE APP ICON

Files:

`atelier-app-icon-cypress-1024.png`
`atelier-app-icon-cypress-1024.svg`

Purpose:

Future alternate icon.

Preserve it.

Do not create runtime alternate icon support unless requested later.

---

# 11. IOS APP ICON INTEGRATION

Inspect the actual native iOS project.

Because this repository contains checked-in native folders, do NOT assume that
changing only `app.json` is sufficient.

Inspect:

- `app.json`
- iOS asset catalog
- `Assets.xcassets`
- `AppIcon.appiconset`
- native project references

Ensure the effective iOS build uses:

`atelier-app-icon-1024.png`

or properly generated platform derivatives from it.

Do not alter:

`com.andresbotia.ResolutionTracker`

Do not rename stable targets simply because the product is now Atelier Tracker.

---

# 12. ANDROID APP ICON

Inspect:

- app.json
- Android manifest
- mipmap resources
- adaptive icon resources
- foreground/background configuration

Do not simply crop the iOS square icon if Android already uses adaptive icons.

Desired adaptive identity:

Background:
Ink `#1C1916`

Foreground:
Ivory `[AT]`

Respect the Claude safe area.

The logo must survive:

- circle mask
- squircle
- rounded square
- OEM masks

Do not make the mark oversized.

---

# 13. NATIVE SPLASH ASSET — DEFAULT

Files:

`atelier-splash-mark-paper.svg`
`atelier-splash-mark-paper.png`

This is the preferred shipping splash treatment.

Background:

`#F6F3EC`

Mark:

Ink `[AT]`

Desired layout per Claude spec:

- centered horizontally
- mark width approximately 26% of shorter screen dimension
- optical center approximately 2% above exact vertical center
- no wordmark
- no artwork
- no extra UI
- no loader unless technically required

Native splash remains STATIC.

---

# 14. DARK SPLASH ALTERNATE

Files:

`atelier-splash-mark.svg`
`atelier-splash-mark.png`

Likely intended for:

Ink background

- Ivory mark

Preserve it.

Do not make it the default unless the Claude documentation specifies otherwise.

Primary shipping direction is Museum Paper.

---

# 15. NATIVE SPLASH SOURCE OF TRUTH

This repo has checked-in native projects and existing Expo Doctor config drift.

Therefore inspect the REAL source of truth.

Do not assume:

`app.json`

alone controls production splash behavior.

Inspect:

- Expo config
- iOS native splash resources/storyboard
- Android splash resources/themes
- plugin configuration
- existing generated native assets

Update whichever sources actually affect the next EAS native build.

Do not leave Expo config saying one thing while checked-in native resources still
show old branding.

---

# 16. SPLASH → APP CONTINUATION

Native launch screen stays static.

After React Native loads:

continue the visual identity.

Desired feeling:

native `[AT]`
→ React Native surface appears
→ matching `[AT]` mark resolves into app identity

Do not attempt to animate the native splash itself.

Do not add artificial startup delays.

Use:

- opacity
- short scale
- matching geometry
- matching Museum Paper color

Reduced motion:

use a simple fade / immediate transition.

---

# 17. FINAL WORDMARK — INK

Files:

`atelier-wordmark-ink.svg`
`atelier-wordmark-ink.png`

Purpose:

Actual:

`Atelier Tracker`

brand name on light/paper surfaces.

This is FINAL outlined geometry.

Do not reconstruct it in IBM Plex Mono.

Potential uses:

- onboarding
- About
- README
- marketing
- branded empty/intro surfaces

Do not necessarily put the full wordmark on every tracking screen.

---

# 18. FINAL WORDMARK — IVORY

Files:

`atelier-wordmark-ivory.svg`
`atelier-wordmark-ivory.png`

Use on:

- Ink backgrounds
- dark brand surfaces

Preserve contrast.

---

# 19. HORIZONTAL LOCKUP — INK

Files:

`atelier-lockup-horizontal-ink.svg`
`atelier-lockup-horizontal-ink.png`

Contains:

`[AT] + Atelier Tracker`

Use when:

- enough horizontal space exists
- actual brand identification is useful

Potential uses:

- onboarding
- About
- README
- marketing
- certain large layouts

On 375pt mobile screens:
do not force this into a cramped header if it hurts spacing.

---

# 20. HORIZONTAL LOCKUP — IVORY

Files:

`atelier-lockup-horizontal-ivory.svg`
`atelier-lockup-horizontal-ivory.png`

Same role for dark surfaces.

---

# 21. STACKED LOCKUP — INK

Files:

`atelier-lockup-stacked-ink.svg`
`atelier-lockup-stacked-ink.png`

Potential uses:

- centered onboarding
- About
- marketing
- static branded panels

Do not use as the main daily tracker header.

---

# 22. STACKED LOCKUP — IVORY

Files:

`atelier-lockup-stacked-ivory.svg`
`atelier-lockup-stacked-ivory.png`

Dark-surface equivalent.

---

# 23. WEB / FAVICON ASSETS

Files may include:

`atelier-favicon.svg`
`atelier-favicon-16.png`
`atelier-favicon-32.png`
`atelier-favicon-48.png`
`atelier-favicon.ico`

Move to:

`assets/brand/web/`

Purpose:

- website
- future Atelier landing page
- web metadata
- documentation

If this mobile repo does not consume favicons:
preserve them without adding unnecessary dependencies/configuration.

---

# 24. SVG RUNTIME STRATEGY

Inspect whether this React Native project already supports importing/rendering
SVG files.

Do NOT automatically add a new SVG dependency.

If existing SVG infrastructure works:
use it.

If it does NOT:

- preserve SVG as the source-of-truth asset
- use supplied PNG equivalents at runtime where appropriate

Do not perform unrelated package upgrades merely to display a logo.

The app should not require Bodoni Moda at runtime to render the final outlined
brand mark.

---

# 25. BRAND TYPOGRAPHY RULE

Claude's final identity separates:

BRAND
from
CATALOGUE DATA.

Brand name / wordmark:

Final outlined Didone/Bodoni-based geometry

Catalogue/data:

IBM Plex Mono

Therefore:

do NOT use:

`ATELIER TRACKER`

in monospaced typography as the primary wordmark.

Mono remains correct for:

`/ 2026`

`CLAUDE MONET · 1882 · THE MET`

`[AT] / COMPLETE`

indexes

dates

archive labels

progress metadata

---

# 26. MAIN MOBILE HEADER

The redundant large serif:

`Atelier Tracker`

was already removed.

Do NOT bring it back.

Current intended hierarchy:

ACTUAL BRAND MARK

- year metadata

ARTWORK TITLE
ARTIST · YEAR · MUSEUM

HABITS / GOALS

Preferred compact direction:

`[actual AT mark]                       / 2026`

then:

`LOW TIDE AT POURVILLE, NEAR DIEPPE, 1882`
`CLAUDE MONET · 1882 · CLEVELAND MUSEUM OF ART`

then:

`HABITS     GOALS`

This is a strong valid implementation.

If the horizontal wordmark fits elegantly at 375pt, it may be considered.

Do not compromise the artwork headline or vertical efficiency just to repeat
the full product name.

---

# 27. COLLAPSED HEADER

Expanded header:

actual `[AT]`

- year

artwork title
artwork credit

tabs

Collapsed header:

actual `[AT]`

- minimal year/identity metadata

Do not reintroduce a large opaque navigation bar.

Use the correct optical-size logo.

Likely:
24px or 32px variant depending on actual rendered size.

---

# 28. TEXTUAL [AT] AUDIT

The app currently contains placeholder text:

`[AT]`

Audit every occurrence.

Classify each as either:

A. ACTUAL BRAND LOGO

or

B. EDITORIAL / CATALOGUE NOTATION

---

## Actual logo examples

Replace with real logo asset:

- primary header identity
- rebrand modal identity
- loading brand mark
- gallery brand identity where it is truly the logo
- branded About/intro surface
- widget brand icon

---

## Catalogue notation examples

These may stay textual:

`[AT] / COMPLETE`

`[AT] / PRINT`

`[AT] / ARCHIVE`

if they function as archival/system notation.

Do not replace every text occurrence blindly.

---

# 29. INTRO / REBRAND MODAL

Use actual final brand asset.

Existing-user version:

actual `[AT]` mark / appropriate lockup

`Yearly Tracker is now Atelier Tracker`

Then existing approved rebrand copy.

Fresh-install version:

actual `[AT]` mark / lockup

`Welcome to Atelier Tracker`

Do NOT change:

- `yt_revamp_intro_seen_v1`
- welcome flags
- modal order
- production storage

The old name remains here intentionally because this is rebrand communication.

---

# 30. ART GALLERY BRANDING

Replace placeholder brand usage where appropriate.

For example:

textual:

`[AT] ATELIER COLLECTION`

may remain partly catalogue language.

But if `[AT]` is being used visually as the company/product logo:
use the actual small-size mark.

Do not clutter the 99-art gallery with large logo lockups.

Artwork remains the focus.

---

# 31. LOADING IDENTITY

If the app displays an Atelier loading/boot surface after the native splash:

use the actual mark.

Avoid:

- spinner-heavy generic loading
- huge wordmark
- duplicate splash

Keep transition short.

---

# 32. SHARE / PRINT BRANDING

Where generated share cards contain Atelier branding:

replace fake/placeholder logo text with the final mark.

Use:

- Ink mark on light surfaces
- Ivory mark on dark surfaces

Keep actual tracking data unchanged.

ViewShot/export must remain deterministic.

Do not capture animated transitional frames.

---

# 33. COMPLETION MARK

Existing notation like:

`[AT] / 04 / COMPLETE`

is archival language.

It does not necessarily need to contain the graphical logo.

It may remain mono textual notation.

Do not turn every completion event into a giant logo splash.

---

# 34. IOS WIDGET BRANDING

The native widget artwork redesign is already implemented and awaiting a new
native build.

Integrate the final mark where widget branding uses the logo.

Do not use giant 1024px assets for a tiny widget identity.

Use optical-size versions.

Typical mapping:

~16px display:
letters-only 16px mark

~24px:
24px mark

~32px:
32px mark

Use appropriate raster/native representation if WidgetKit does not consume SVG
directly.

Do not reintroduce:

`Yearly Tracker`

Keep user-visible widget names:

- Atelier Progress
- Atelier Habits
- Goal Highlight
- Atelier Goals

---

# 35. IOS WIDGET ARTWORK BEHAVIOR

Do not alter the already-approved behavior:

Art theme:
actual selected painting

Random Art:
same currently resolved painting as app

Custom:
custom theme colors

Museum Paper:
paper palette

Classic:
classic palette

Final brand integration must not regress widget artwork synchronization.

---

# 36. ANDROID WIDGET BRANDING

Apply equivalent final Atelier mark treatment.

Use practical Android drawable/raster resources.

Do not alter widget behavior unnecessarily.

Preserve:

- theme synchronization
- artwork shared-file architecture
- custom palette backgrounds
- Random Art consistency

---

# 37. NATIVE ASSET TARGET MEMBERSHIP

Verify final brand resources are included where required.

iOS:

- main application target
- widget extension only for the SMALL logo resources it actually needs
- do NOT copy all logo/icon/marketing assets into widget extension unnecessarily

Android:

ensure required widget drawable resources exist.

Avoid duplicate giant asset bundles.

---

# 38. DO NOT DUPLICATE THE ART LIBRARY

This brand pass must not accidentally change the art pipeline.

The ~99 artwork collection remains managed separately.

Do not:

- copy artwork into brand directories
- duplicate art inside widget extension
- alter art IDs
- alter Random Art persistence

---

# 39. BRAND FILE ORGANIZATION

Target organization should be roughly:

assets/
brand/
marks/
atelier-mark-ink.svg
atelier-mark-ivory.svg
atelier-mark-cypress.svg
atelier-mark-24.svg
atelier-mark-32.svg
atelier-mark-letters-16.svg
raster optical variants...

    icons/
      atelier-app-icon-1024.png
      atelier-app-icon-paper-1024.png
      atelier-app-icon-cypress-1024.png

    splash/
      atelier-splash-mark-paper.svg
      atelier-splash-mark-paper.png
      atelier-splash-mark.svg
      atelier-splash-mark.png

    wordmarks/
      atelier-wordmark-ink.svg
      atelier-wordmark-ivory.svg
      png equivalents

    lockups/
      atelier-lockup-horizontal-ink.svg
      atelier-lockup-horizontal-ivory.svg
      atelier-lockup-stacked-ink.svg
      atelier-lockup-stacked-ivory.svg
      png equivalents

    web/
      atelier-favicon.svg
      atelier-favicon-16.png
      atelier-favicon-32.png
      atelier-favicon-48.png
      atelier-favicon.ico

docs/
brand/
BRAND-SPEC.md
CONSTRUCTION.md
README.md

Do not create duplicate files if the archive naming differs slightly.

Inspect the actual ZIP manifest and map the real files intelligently.

---

# 40. EXTRA / UNRECOGNIZED FILES IN THE ZIP

If the archive contains additional files not explicitly listed above:

DO NOT discard them blindly.

Use the Claude export README to determine their role.

Classify them as:

- production asset
- alternate variant
- documentation
- preview/mockup
- source/reference

Production assets:
preserve appropriately.

Useful source/reference:
preserve under docs/brand/source if warranted.

Pure presentation screenshots/mockups:
do not necessarily ship in the application bundle.

Do not bloat the app binary with brand presentation images that are not used.

---

# 41. DO NOT SHIP CLAUDE PRESENTATION ARTIFACTS

If the ZIP contains:

- presentation HTML
- concept board
- mockup screenshots
- design preview renders

these are NOT runtime app assets unless explicitly required.

Do not put them into Expo `assets/`.

Preserve only if useful as documentation.

---

# 42. BRAND LICENSE / FONT NOTE

The final logo SVGs use outlined geometry.

Therefore logo rendering should NOT depend on a runtime Bodoni font.

If Bodoni Moda is separately bundled anywhere for UI use:

preserve its license requirements.

Do not add Bodoni as a runtime dependency just to render the logo.

The outlined logo/wordmark assets already solve that.

---

# 43. README REBRAND

Update root:

`README.md`

from Yearly Tracker branding to Atelier Tracker where current user-facing product
identity is described.

Historical technical notes may remain if they are clearly historical.

Use actual brand image/lockup in README if repository conventions support it.

Do not reference local absolute paths.

---

# 44. DESIGN.MD

Update:

`design.md`

Final brand section should now be LOCKED.

Document:

- final `[AT]` geometry
- brand colors
- optical-size variants
- wordmark rules
- brand vs catalogue typography
- app icon
- splash
- header usage
- widgets
- artwork contrast
- logo misuse rules

Remove "waiting on Claude" language.

---

# 45. REVAMP.MD BACKLOG STATUS

Update earlier Brand Asset Backlog items.

Change from:

WAITING ON CLAUDE

to:

DELIVERED / INTEGRATED

for:

- final `[AT]`
- app icon
- wordmark
- splash
- lockups
- small-size marks

Do NOT mark:

App Store screenshots / final marketing release work

complete unless actually done.

---

# 46. AGENTS.MD

Only add stable rules.

Potential stable rule:

Final Atelier brand geometry lives in `assets/brand/` and
`docs/brand/BRAND-SPEC.md`.

Agents must not redraw the `[AT]` mark or recreate it from typed brackets.

Do not overload AGENTS.md with temporary implementation notes.

---

# 47. TECHNICAL IDENTIFIERS MUST NOT CHANGE

DO NOT rename:

iOS bundle ID:

`com.andresbotia.ResolutionTracker`

Widget bundle ID:

`com.andresbotia.ResolutionTracker.widgets`

Existing Android package/application IDs

App Group identifiers

AsyncStorage keys

Widget kind strings

Native target names when changing them provides no user benefit

Historical source filenames where renaming would add risk

Product branding and technical identity are separate.

---

# 48. STORAGE SAFETY

Do not modify:

`rt_goals_v1`

`yt_habits_v1`

`rt_hue_v1`

`yt_custom_themes_v1`

`yt_current_year_v1`

`rt_year_v1`

`yt_goal_history_v1`

`rt_welcome_seen_v1`

`yt_habits_welcome_seen_v1`

`yt_revamp_intro_seen_v1`

`yt_random_art_last_v1`

or other established persistence contracts.

Brand integration requires no migration.

Existing users must retain all data.

---

# 49. BUSINESS LOGIC IS FROZEN

Do not modify semantics of:

- goal CRUD
- habit CRUD
- habit 0/1/2
- count progress
- milestones
- Year Archive
- streaks
- rollover
- undo
- drag/reorder
- share calculations
- Random Art
- widget data

Brand integration is presentation/native-asset work.

---

# 50. APP DISPLAY NAME

Verify the user-visible display name is:

`Atelier Tracker`

on:

- iOS Home Screen
- Android launcher
- widget gallery
- native surfaces

Do not rename technical target names merely to match.

---

# 51. SEARCH FOR OLD VISIBLE BRANDING

Search the entire repository for:

`Yearly Tracker`

Classify every result.

Allowed examples:

- intentional rebrand copy:
  `Yearly Tracker is now Atelier Tracker`

- historical documentation

- stable internal technical names if not visible

Not allowed:

- current screen title
- current widget title
- current splash
- app display name
- share card current branding
- current onboarding for a fresh install

Also search:

`YearlyTracker`

Do NOT blindly rename every match.

Determine whether each result is:

- technical internal identifier
- historical reference
- visible product string

---

# 52. APP ICON VERIFICATION

Before completion verify:

- 1024 icon dimensions
- opaque background
- no baked rounded corners
- correct Ink
- correct Ivory
- mark centered correctly
- no accidental compression artifacts
- correct iOS mapping
- correct Android mapping

---

# 53. SPLASH VERIFICATION

Verify:

- Museum Paper is exact intended color
- mark geometry matches Claude asset
- no text wordmark
- no old icon
- no Yearly Tracker copy
- no accidental art-theme background
- native splash remains static
- RN continuation is short and optional under reduced motion

---

# 54. HEADER VERIFICATION

Verify on conceptual 375pt layout:

- real mark renders crisply
- no fake typed `[AT]` where logo should be
- no redundant giant Atelier Tracker title
- artwork title remains headline
- artist/year/museum remain readable
- tabs still fit
- collapse motion still works
- header height did not regress

---

# 55. WIDGET VERIFICATION

Without running a native build, statically verify:

- correct brand assets are referenced
- widget target contains needed mark assets
- old visible name is gone
- artwork background code remains intact
- Random Art uses app-resolved image
- custom colors remain
- fallback remains
- old widget kind strings remain stable

Document that actual widget rendering still requires the upcoming development
build.

---

# 56. STATIC CODE CHECKS

Run:

`npm run verify:storage`

Run:

`npx expo-doctor`

Run existing Babel/static parse checks.

Run any REAL lint/test commands in package.json.

Do not invent scripts.

Do not perform unrelated dependency upgrades.

The known Expo Doctor failures may remain if they are the same existing:

- native/CNG drift
- package patch/version drift

Do not "fix" them during this brand pass unless required for the brand integration.

---

# 57. GIT SAFETY

Stay on:

`feature/revamp`

Make focused commits.

Suggested grouping:

1. import final Atelier brand assets and docs
2. integrate app icon / splash / native assets
3. replace placeholder brand marks in app UI
4. integrate final marks into widget/share/onboarding surfaces
5. update brand documentation / verification

Actual names may differ.

Do not squash all work into one giant commit unless necessary.

Do NOT merge into main.

---

# 58. DO NOT RUN THE FINAL BUILD YET

This is critical.

DO NOT run:

`eas build`

DO NOT run:

`expo run:ios`

DO NOT run:

`expo run:android`

DO NOT submit to:

- TestFlight
- App Store Connect
- Play Console

DO NOT modify signing credentials.

We are intentionally preparing all final native assets FIRST.

The user will initiate the development build after reviewing this report.

---

# 59. FINAL REPORT

At completion report:

1. ZIP extraction result
2. exact brand files found
3. permanent file locations
4. files deliberately not shipped and why
5. brand docs imported
6. primary `[AT]` integration
7. small optical-size mapping
8. app icon mapping
9. Android adaptive icon mapping
10. splash integration
11. splash → app continuation
12. wordmark usage
13. horizontal/stacked lockup usage
14. header changes
15. intro/rebrand changes
16. gallery/loading branding
17. share/print branding
18. iOS widget branding
19. Android widget branding
20. remaining intentional textual `[AT]` catalogue notation
21. remaining intentional `Yearly Tracker` historical/rebrand strings
22. design.md updates
23. AGENTS.md updates
24. README updates
25. storage verification
26. Expo Doctor/static checks
27. commits created
28. exact native changes waiting for build
29. confirmation bundle IDs/storage were untouched
30. confirmation NO EAS/native build was started

Finish with exactly:

`READY FOR FINAL DEVELOPMENT BUILD`

Do not proceed beyond that point.
