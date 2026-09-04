# ATELIER WIDGET BACKGROUNDS + HEADER CLEANUP — PRE-BUILD PHASE

Status: implemented on `feature/revamp`. Waiting on Claude Design brand
assets, then one development build. Do not start that build in this phase.

Continue work on `feature/revamp`.

This phase should finish all widget/background/native naming code changes that can
be completed BEFORE the next iOS development build.

DO NOT start an EAS build.
DO NOT create a development build.
DO NOT modify or merge into `main`.

We are intentionally stopping at the native-build boundary because final logo /
icon / splash assets are still pending from Claude Design.

Before changing code:

1. Confirm current branch is `feature/revamp`
2. Read `AGENTS.md`
3. Read `REVAMP.MD`
4. Read `design.md`
5. Inspect recent commits
6. Inspect current React Native widget payload generation
7. Inspect the iOS WidgetKit extension
8. Inspect Android widget implementation
9. Search the repository for remaining USER-FACING `Yearly Tracker` strings

Preserve all production-data and compatibility rules.

---

# 1. REMOVE THE REDUNDANT LARGE ATELIER TRACKER HEADER

Physical-device feedback:

The main screen currently shows the brand twice:

`[AT]  ATELIER TRACKER / 2026`

and then:

`Atelier Tracker`

followed by:

`LOW TIDE AT POURVILLE, NEAR DIEPPE, 1882`
`CLAUDE MONET · 1882 · CLEVELAND MUSEUM OF ART`

This is redundant and wastes valuable vertical space.

Remove the large serif:

`Atelier Tracker`

from the primary Habits / Goals header.

The compact brand kicker is enough:

`[AT]  ATELIER TRACKER / 2026`

Then move directly into the artwork identity:

`LOW TIDE AT POURVILLE, NEAR DIEPPE, 1882`
`CLAUDE MONET · 1882 · CLEVELAND MUSEUM OF ART`

Desired hierarchy:

[AT] ATELIER TRACKER / 2026

LOW TIDE AT POURVILLE, NEAR DIEPPE, 1882
CLAUDE MONET · 1882 · CLEVELAND MUSEUM OF ART

HABITS GOALS
────────

This should reclaim vertical space and make the artwork feel like the changing
headline of the interface.

Do NOT remove page-specific titles where they are actually needed.

Examples:

Habit History
Year Archive
Art Gallery

may still have their own page titles.

Only remove redundant repeated PRODUCT branding.

---

# 2. UPDATE COLLAPSING HEADER LOGIC

The existing scroll-responsive header may currently assume the large serif
`Atelier Tracker` title exists.

Update the collapsing header accordingly.

Expanded state should now be approximately:

[AT] ATELIER TRACKER / 2026

ARTWORK TITLE
ARTIST · YEAR · MUSEUM

Collapsed state:

[AT] ATELIER TRACKER 2026

or another restrained compact equivalent.

Do not leave awkward blank space where the old serif title was removed.

Rebalance:

- top spacing
- artwork credit spacing
- tabs
- scroll thresholds

Keep the header elegant on 375pt / iPhone 7.

---

# 3. FINAL WIDGET BEHAVIOR

The current palette tinting is NOT the final Atelier widget design.

For ArtThemes, the actual currently resolved painting should appear behind the
widget content.

Example:

App currently displays:

LOW TIDE AT POURVILLE, NEAR DIEPPE

Then the widgets should use the SAME painting.

Widget structure:

SELECTED ARTWORK
↓
SUBTLE ATELIER PAPER VEIL
↓
WIDGET DATA / TYPOGRAPHY

The widget should feel like a miniature Atelier Tracker surface.

Do not simply use an extracted solid color.

---

# 4. FIX ALL REMAINING WIDGET BRANDING

The current physical-device widget still contains old branding such as:

`Yearly Tracker Progress`

and:

`Yearly Tracker`

Remove all USER-FACING Yearly Tracker naming from widget presentation.

Search:

- Swift widget code
- iOS widget extension Info.plist / build settings
- Android widget labels
- widget configuration names
- widget descriptions
- empty states
- titles
- display labels
- app/widget names visible in the system UI

Use Atelier branding instead.

Examples:

`Yearly Tracker Progress`
→ `Atelier Progress`

`Yearly Tracker`
→ `Atelier Tracker`

Potential widget naming:

- Atelier Progress
- Atelier Habits
- Goal Highlight
- Atelier Goals

Use judgment and keep names concise.

IMPORTANT:

Do NOT rename internal native targets, schemes, classes, bundle identifiers, or
package identifiers merely for cosmetic reasons.

Keep:

`com.andresbotia.ResolutionTracker`

`com.andresbotia.ResolutionTracker.widgets`

and existing Android package/application identifiers.

Only change user-visible names.

---

# 5. ART THEME WIDGET BACKGROUND

When the resolved theme is an ArtTheme:

- display the actual artwork
- fill the widget bounds using an appropriate crop/cover behavior
- add a paper veil / tonal wash for readability
- use resolved theme text/accent colors where appropriate
- keep typography readable over very light and very dark paintings

Do not make the artwork so opaque that widget information becomes hard to read.

Do not make the veil so strong that the painting disappears.

The app and widget should clearly belong to the same active theme.

---

# 6. RANDOM ART MUST STAY SYNCHRONIZED

Random Art must NEVER independently randomize inside WidgetKit or Android widget
code.

The application is the authority.

Flow:

Random Art mode
→ app resolves the current artwork
→ app displays that artwork
→ app shares THAT resolved artwork with widgets
→ widgets display the SAME artwork

If Random Art behavior later changes from per-launch to daily selection, this
architecture should still work because widgets consume the resolved artwork
rather than generating their own choice.

Do not let:

App = Monet

Widget = Van Gogh

happen because both independently rolled a random number.

---

# 7. WIDGET-SAFE ARTWORK SHARING ARCHITECTURE

Do not duplicate the entire ~99-art collection into the iOS widget extension.

Do not send JPEG/base64 image data inside the JSON widget payload.

Use the existing shared App Group infrastructure.

Preferred architecture:

CURRENT RESOLVED ARTWORK
↓
main app creates/copies widget-safe derivative
↓
shared App Group container
↓
widget payload references current shared artwork
↓
WidgetKit reads shared file
↓
renders background

Conceptually something like:

App Group/
widget-payload.json
atelier-widget-background.jpg

or another clean equivalent.

Only the currently resolved widget artwork needs to be shared unless there is a
specific technical reason to retain more.

---

# 8. WIDGET IMAGE DERIVATIVE

Use a reasonable widget-specific image size.

The widget does NOT need the app's full-screen derivative.

Generate or copy an image that is:

- sufficiently sharp for systemLarge
- lightweight
- fast for WidgetKit to decode
- appropriate for cover cropping

Do not repeatedly perform expensive image processing every render.

Prefer preparing the file when:

- theme changes
- Random Art resolves
- relevant app state/widget payload is refreshed

Avoid unnecessary rewrites if the same artwork is already shared.

---

# 9. APP GROUP IMAGE LIFECYCLE

When an ART theme becomes active:

write/update the shared artwork.

When switching to:

- Museum Paper
- Classic
- Custom

remove or invalidate the shared artwork reference so stale art does not remain
behind the widget.

Never allow:

User selects Museum Paper
→ widget keeps showing previous Monet painting

because an old shared image file remained available.

The payload must clearly state whether artwork is active.

---

# 10. ADDITIVE WIDGET PAYLOAD

Existing widget required fields must remain compatible.

Current core contract includes:

- yearlyProgress
- theme
- goals
- habits

and the already-added theme tint fields.

Do not remove or rename them.

Add any additional artwork information BACKWARD-COMPATIBLY.

Possible conceptual additions:

`themeKind`
`themePrimary`
`themeBg`
`themeText`
`artworkId`
`hasArtwork`
`widgetArtworkFilename`

Use the smallest clean contract appropriate to the existing implementation.

Do not include absolute device/container paths in the persisted JSON if that is
fragile across launches.

Prefer a stable filename or logical identifier resolved inside the native
extension.

---

# 11. IOS WIDGETKIT ARTWORK LOADING

Update the Swift WidgetKit extension to read the shared artwork from the App
Group container.

Use platform-safe SwiftUI/WidgetKit behavior.

For modern iOS:
use proper WidgetKit container background handling.

For older supported iOS:
use an appropriate SwiftUI background fallback.

The physical test device is an iPhone 7, so do NOT implement this only for
iOS 17+.

The existing backwards-compatible widget path must continue working.

Conceptual structure:

ZStack {
artwork background
Atelier paper veil
widget content
}

The exact implementation should follow current WidgetKit best practices.

---

# 12. WIDGET PAPER VEIL

Match the app's Atelier visual language.

Potential art widget layering:

Artwork
→ warm paper overlay
→ optional subtle tonal accent
→ data

Tune separately from the full app if necessary.

Widgets are smaller and need stronger readability.

Do not blindly reuse the app's exact 74% veil value if it makes the widget
flat.

Test/choose a widget-specific treatment that preserves:

- artwork recognition
- text contrast
- progress readability

---

# 13. YEARLY PROGRESS WIDGET REDESIGN

The current Yearly Progress widget still looks like the old generic app:

Title
5%
blue system ProgressView

Bring it into the Atelier visual language.

Do NOT change its underlying percentage calculation.

Suggested direction:

[AT] / YEAR

2026 PROGRESS

05%

+...................

or another restrained editorial interpretation.

Avoid the default blue system ProgressView if it clashes with Atelier.

Prefer:

- ASCII/editorial progress
- theme accent
- ink typography
- artwork background

The widget should immediately look like it belongs to the redesigned app.

Keep it readable and compact.

---

# 14. HABITS WIDGET REDESIGN

Use the existing states:

`.` empty
`+` good
`×` bad

Preserve stored semantics:

0 / 1 / 2

Potential structure:

[AT] / TODAY

WORKOUT +
CARDIO ×
DRINK WATER +
READ .

Artwork behind the surface where applicable.

Do not reintroduce generic circular status dots unless they serve a clear
purpose.

The ASCII character language should carry the state.

---

# 15. GOAL WIDGET REDESIGN

For goal highlight / goal-list widgets:

use the Atelier editorial language.

Possible structure:

[AT] / GOAL

READ 20 BOOKS

03 / 20
+++................. 15%

or:

01 READ 20 BOOKS 15%
02 RUN 200 MILES 77%

Preserve existing goal selection/calculation logic.

Only redesign presentation.

---

# 16. CUSTOM THEMES IN WIDGETS

When a Custom theme is selected:

there is no painting.

Use the resolved custom theme colors.

At minimum:

- custom background / primary tone becomes the widget surface
- correct text color remains readable
- accent/progress uses custom primary where appropriate

Do not invent artwork.

Do not remove Custom themes in this phase.

---

# 17. MUSEUM PAPER / CLASSIC WIDGETS

Museum Paper:

use a warm paper background and Atelier ink treatment.

Classic themes:

use their resolved palette.

No stale painting.

No fake painting.

---

# 18. WIDGET REFRESH WHEN THEME CHANGES

Changing the app theme should refresh widgets.

The sequence should be:

user selects art
→ resolved theme changes
→ shared widget artwork updated
→ widget payload updated
→ widget timeline reload requested

Likewise:

art → custom
art → Museum Paper
custom → art
Random Art resolves new artwork

should all update widget presentation.

Use the existing native bridge/update mechanism if one exists.

Do not introduce unnecessary polling.

---

# 19. RANDOM ART + WIDGET REFRESH

When Random Art resolves a new current artwork:

share that new artwork with widgets before/requesting their refresh.

Avoid race conditions where:

payload points to new theme
but shared image is still old.

Recommended ordering:

1. resolve Random Art
2. prepare shared artwork
3. write payload
4. request widget reload

or another safe equivalent.

---

# 20. FAILURE FALLBACK

Widget artwork loading must fail gracefully.

If:

- image file missing
- image cannot decode
- App Group unavailable
- payload from an older app build lacks artwork fields

then:

fallback to palette-based Atelier background.

Never show:

- blank transparent widget
- crash
- missing-image icon
- stale unrelated art if avoidable

Backward compatibility matters.

---

# 21. DO NOT BUNDLE THE ENTIRE COLLECTION IN THE WIDGET TARGET

The app may contain approximately 99 artwork derivatives.

Do not accidentally make the widget extension duplicate all those files in its
own Copy Bundle Resources phase.

Inspect Xcode/native project configuration.

The extension should consume the selected shared App Group derivative.

Report if the current native configuration duplicates artwork resources.

---

# 22. ANDROID PARITY

Implement equivalent artwork-background behavior for Android widgets where
technically practical.

Same rules:

Art theme
→ actual current artwork

Random Art
→ same resolved app artwork

Custom
→ custom palette

Paper / Classic
→ palette

Do not allow Android and iOS to use different Random Art selections.

Use a practical shared-file/widget approach appropriate to Android.

Preserve current widget update behavior.

---

# 23. MAIN APP HEADER SPACING AUDIT

After removing the duplicate large `Atelier Tracker` title, inspect the main
Habits and Goals views on narrow width.

Check:

- top safe area
- kicker
- artwork title
- artist metadata
- tab position
- Ledger / Yearly metadata
- collapsing header
- first content section

The screen should feel noticeably less vertically wasteful.

Do not compensate by simply adding giant empty margins elsewhere.

---

# 24. ARTWORK TITLE RESPONSIVENESS

The artwork title is now more visually important because it follows directly
after the brand kicker.

Allow it to wrap gracefully.

Do NOT ellipsize important artwork names like:

WHEAT FIELD WITH CYPRESSES

LOW TIDE AT POURVILLE, NEAR DIEPPE, 1882

Use responsive wrapping / typography.

Museum metadata may wrap to a second line where necessary.

Keep hierarchy strong.

---

# 25. CLAUDE DESIGN BLOCKED ITEMS — DO NOT IMPLEMENT YET

We are waiting for Claude Design after approximately 10:50.

DO NOT implement final:

- `[AT]` SVG
- app icon
- splash artwork
- wordmark asset
- final splash → logo motion
- App Store marketing images

Continue using the current textual `[AT]` treatment.

Do not generate temporary image assets that will immediately be replaced.

---

# 26. DO NOT RUN A NATIVE BUILD

This phase intentionally stops BEFORE the build.

You may:

- modify Swift
- modify Kotlin/Java
- modify native configuration
- modify React Native widget sharing
- run static/build-safe checks that do not produce/sign an app

You must NOT:

- run `eas build`
- create an iOS development build
- create an Android development build
- submit anything
- change signing credentials

We will build AFTER final Claude identity assets are available.

---

# 27. VERIFICATION BEFORE BUILD

Run everything that can be validated without producing the native artifact.

At minimum:

`npm run verify:storage`

`npx expo-doctor`

Babel/JS parse checks used by this project.

Inspect Swift/Kotlin code for obvious compile issues as much as the Windows
environment allows.

Verify:

MAIN APP:

- duplicate serif Atelier Tracker title removed
- kicker remains
- artwork title/credit hierarchy correct
- collapsed header works conceptually
- no blank header space

WIDGET PAYLOAD:

- old required fields unchanged
- new artwork fields additive
- Random Art shares resolved artwork
- custom theme palette survives
- fixed art theme survives

FILES:

- widget derivative writes to expected shared location
- stale artwork invalidation exists
- failure fallback exists
- no base64 image payload
- no full art library duplicated into extension

NAMING:

- search repository for USER-FACING `Yearly Tracker`
- update intended visible strings
- do NOT rename technical IDs/classes/targets unnecessarily

IOS:

- WidgetKit artwork background code exists
- iOS <17 fallback still exists
- theme change triggers reload
- no obvious stale-art path

ANDROID:

- equivalent theme background behavior where practical
- no broken existing update path

---

# 28. FINAL PRE-BUILD REPORT

At completion STOP.

Do not build.

Report:

1. Main header changes
2. Every remaining visible `Yearly Tracker` string changed
3. Any intentionally retained internal `YearlyTracker` technical names and why
4. iOS widget artwork architecture
5. Android widget artwork architecture
6. Widget payload additions
7. Random Art synchronization behavior
8. Fixed-art synchronization behavior
9. Custom / Paper / Classic behavior
10. Widget visual redesign
11. Shared artwork file lifecycle
12. Failure fallback
13. Static verification results
14. Files changed
15. Commits created
16. Exact native changes that will require the next development build
17. Confirmation that NO EAS/native build was started
18. Items still waiting on Claude Design

End with:

READY FOR CLAUDE BRAND ASSETS + FINAL DEVELOPMENT BUILD

Stay on `feature/revamp`.

DO NOT MERGE TO MAIN.
