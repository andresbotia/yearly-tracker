Continue Yearly Tracker on `feature/revamp`.

Do not merge main.

Before changing anything:

- read `AGENTS.md`
- read `REVAMP.MD`
- read `design.md`
- inspect the latest commits

IMPORTANT BRAND PACKAGE LOCATION

The NEW finalized Yearly Tracker branding package has already been copied into
the repository root:

`./Atelier Tracker rebranding (1).zip`

Despite the filename, THIS `(1)` ZIP is the NEW Yearly Tracker / [YT] production
branding package from Claude Design.

The older:

`./Atelier Tracker rebranding.zip`

is the previous Atelier Tracker / [AT] package.

Use `Atelier Tracker rebranding (1).zip` as the source of truth for the new
branding.

Extract and inspect it before making changes. Read its:

- README.md
- BRAND-SPEC.md
- CONSTRUCTION.md

Inspect all supplied marks, icons, splash assets, wordmarks, lockups, favicons,
and optical-size variants.

Do not recreate the [YT] logo yourself when supplied production artwork exists.

==================================================
GOAL
==================================================

Rebrand the current app from:

Atelier Tracker / [AT]

back to:

Yearly Tracker / [YT]

while KEEPING the entire current Atelier visual design system.

This is a branding/name/asset swap — NOT a redesign.

Keep:

- museum catalogue aesthetic
- art-led backgrounds
- typography
- layouts
- motion
- onboarding design
- catalogue language
- archival/journal feeling
- current functionality

The app should feel visually identical in quality, except the product identity
is now Yearly Tracker.

==================================================
BRANDING REPLACEMENTS
==================================================

Replace user-facing:

Atelier Tracker
→ Yearly Tracker

[AT]
→ supplied [YT] artwork

Examples:

Welcome to Atelier Tracker
→ Welcome to Yearly Tracker

Atelier Tracker can now...
→ Yearly Tracker can now...

Yearly Tracker is now Atelier Tracker
→ replace with appropriate redesign/migration language such as:

A NEW EDITION OF YEARLY TRACKER

Your goals, habits, and history are exactly where you left them.

Yearly Tracker has been redesigned around art, typography, and the idea of your
year as a personal archive.

Do not tell existing users the app changed its name, because the shipping name
is Yearly Tracker again.

Use the supplied [YT] graphical assets everywhere the actual brand mark is
displayed.

Do NOT substitute typed "[YT]" when a production graphical mark should be used.

Textual catalogue notation may remain textual where appropriate.

==================================================
APP / NATIVE BRANDING
==================================================

Update the visible application identity to Yearly Tracker.

Use the supplied NEW production assets for:

- app icon
- iOS icon
- Android adaptive icon
- splash
- JS BrandSplash
- brand marks
- share branding
- README/web branding where currently applicable
- widgets
- widget marks
- visible widget names

Widget visible names should become appropriately Yearly-branded, e.g.:

Yearly Progress
Yearly Habits
Yearly Goals

Preserve Goal Highlight unless there is a strong naming reason to change it.

==================================================
DO NOT CHANGE TECHNICAL IDENTITY
==================================================

ABSOLUTELY preserve:

iOS bundle ID:
`com.andresbotia.ResolutionTracker`

widget bundle ID:
`com.andresbotia.ResolutionTracker.widgets`

Android package:
`com.andresbotia.yearlytracker`

Also preserve:

- App Group
- widget kind strings/internal widget IDs
- AsyncStorage key names
- production data
- goals
- habits
- history
- themes/custom themes
- selected theme
- Random Art
- year
- rollover
- widget payload contract

Do NOT perform a storage migration just because the visual brand changes.

==================================================
ASSET INTEGRATION
==================================================

Move/import the new Yearly production assets into a permanent structure such as:

assets/brand/
docs/brand/

Replace the existing Atelier brand assets cleanly.

Do not leave runtime code accidentally referencing obsolete [AT] production
images.

Preserve useful historical docs only if appropriate, but current shipping brand
documentation should describe Yearly Tracker / [YT].

Do not commit the source ZIP merely because it is in the repo root unless it is
already intentionally tracked. Treat it as a handoff/source archive.

==================================================
COPY AUDIT
==================================================

Search the entire repo for:

Atelier Tracker
ATELIER TRACKER
[AT]
Atelier
atelier-

Classify every occurrence before replacing it.

Change user-facing brand references.

DO NOT blindly rename internal code/API/storage/native identifiers if doing so
could create unnecessary migration risk.

Internal filenames/classes can remain Atelier-named where harmless unless they
are clearly public-facing.

In particular, do not rename storage keys.

==================================================
DEV QA
==================================================

Preserve the current DEV-only QA system exactly.

It must remain hard-gated by `__DEV__`.

Production/TestFlight/App Store must continue to have:

- no QA trigger
- no QA UI
- no executable QA mutations

Update QA copy only where it displays obsolete Atelier branding.

==================================================
WIDGETS
==================================================

The widget functionality and synchronization are already working perfectly.

Do NOT redesign or rewrite widget logic.

Only perform the branding changes necessary:

- supplied [YT] mark
- Yearly-facing visible names/copy
- appropriate supplied assets

Preserve all widget synchronization, artwork handling, payload logic and IDs.

Because widget/icon/splash assets are native-facing, this pass may require a new
EAS build AFTER implementation, but do not run EAS unless instructed.

==================================================
VERIFY
==================================================

Run:
`npm run verify:storage`

Run Babel/static parse checks on touched JS.

Run the existing Expo checks without performing unrelated dependency upgrades.

Search again after implementation for obsolete shipping-brand references.

Explicitly report any remaining "Atelier" or "[AT]" occurrences and WHY each one
was intentionally retained.

Verify:

- Yearly Tracker visible app name
- [YT] header mark
- [YT] welcome
- [YT] splash
- [YT] app icon wiring
- Yearly widget visible names
- [YT] widget marks
- share branding
- onboarding copy
- existing-user migration copy
- production storage unchanged
- technical IDs unchanged
- DEV QA still **DEV** only

Stay on `feature/revamp`.
Do not merge main.

Make focused commits.

When finished report:

- contents discovered in `Atelier Tracker rebranding (1).zip`
- assets installed/replaced
- all copy/name changes
- native-visible changes
- technical identifiers explicitly preserved
- remaining intentional Atelier references
- verification results
- commit hashes

Stop ready for physical-device / final EAS QA.
