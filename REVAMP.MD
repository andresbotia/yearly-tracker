You are working on my existing React Native / Expo app:

GitHub:
https://github.com/andresbotia/yearly-tracker

The app is already live/functional. This is a UI/UX redesign and architecture cleanup — NOT a rewrite of the application's business logic.

## PRIMARY OBJECTIVE

Redesign Yearly Tracker around an artistic visual identity inspired by:

https://www.inspora.design/posts/wafer-page

The aesthetic should combine:

- classical/public-domain artwork
- subtle ASCII rendering
- editorial typography
- museum catalogue design
- restrained monochrome/data UI
- large amounts of negative space
- thin lines instead of excessive cards
- subtle analog / archival character
- modern mobile usability

Think:

MUSEUM CATALOGUE × OLD COMPUTER TERMINAL × PERSONAL JOURNAL

Do NOT turn this into a stereotypical green terminal UI.

ASCII should act as texture and visual language rather than a gimmick.

---

# ABSOLUTE REQUIREMENT #1

# DO NOT BREAK EXISTING FUNCTIONALITY

Treat all current application behavior as production behavior.

Before modifying anything:

1. Inspect the entire existing codebase.
2. Understand how goals are stored and updated.
3. Understand how habits are stored and updated.
4. Understand yearly rollover.
5. Understand goal history.
6. Understand habit history.
7. Understand themes and custom themes.
8. Understand share cards.
9. Understand Android/native widget integration.
10. Understand drag/reorder.
11. Understand haptics.
12. Understand undo behavior.
13. Understand all existing AsyncStorage keys.
14. Understand all existing data object shapes.

DO NOT redesign by replacing working logic.

Separate presentation from behavior wherever possible.

Existing handlers, persistence functions, calculations, data models, history logic, widgets, and state transitions should remain intact unless there is a specific technical reason to change them.

If you do change internal logic, document WHY and prove that behavior remains equivalent.

---

# ABSOLUTE REQUIREMENT #2

# EXISTING USER DATA MUST SURVIVE THE UPDATE

This application does NOT use a remote database.

User data lives locally on the user's phone.

Therefore:

THE CURRENT LOCAL DATA IS THE PRODUCTION DATABASE.

Users installing this redesign as an App Store / Play Store update must open the new version and immediately see:

- their existing goals
- their existing goal progress
- their habits
- habit history
- yearly history
- current year information
- theme preference
- custom themes
- other existing persisted settings

Do NOT:

- rename AsyncStorage keys casually
- replace existing keys with new keys
- change stored object shapes without migration
- clear storage
- initialize starter data over existing data
- change IDs
- reset progress
- reset history
- remove unknown fields from persisted objects
- introduce a database requirement
- require accounts
- require authentication

The update must feel seamless.

Existing user:

Version 1
↓ App Store update
Version 2
↓
Same goals
Same habits
Same progress
Same history
New design

---

# STORAGE / MIGRATION RULE

Before changing any persisted structure, audit `utils/storage.js`, `App.js`, and every AsyncStorage usage.

Create a clear inventory like:

Storage Key
Purpose
Current Schema
Read Location
Write Location
Migration Needed?

Preserve every existing key whenever possible.

Prefer adding optional properties rather than modifying existing properties.

For example:

Existing goal:

{
id,
title,
type,
target,
progress,
createdAt
}

If the redesign eventually needs metadata, prefer:

{
...existingGoal,
optionalNewProperty
}

instead of replacing the schema.

Every reader of new fields must safely handle:

undefined

because existing users will not have those fields.

Example:

const artStyle = goal.artStyle ?? DEFAULT_ART_STYLE;

Never assume new fields exist.

---

# MIGRATIONS

If a schema change truly becomes necessary, create an explicit versioned migration system.

Example concept:

const STORAGE_SCHEMA_VERSION = 2;

migrateStorage(data, fromVersion, toVersion)

Migration requirements:

- idempotent
- non-destructive
- backward-aware
- preserves unknown fields
- never resets user progress
- never creates duplicate records
- only marks migration complete AFTER successful migration

Prefer not needing migrations at all for this visual redesign.

---

# DATA SAFETY

Before writing migrated data:

1. validate it
2. retain the original structure in memory
3. perform migration
4. verify required fields
5. only then persist the new representation

Never replace valid user storage with defaults because parsing or migration encountered an unexpected value.

If loading old data fails, fail safely rather than overwriting it.

---

# OFFLINE-FIRST MUST REMAIN

The current identity of Yearly Tracker is:

- no accounts
- no analytics
- no ads
- no tracking
- local device storage
- offline-first

Preserve this.

Do NOT fetch artwork from museum APIs while the app is running.

Museum APIs should be used during DEVELOPMENT ONLY.

Artwork should be processed ahead of time and bundled with the application.

Runtime:

App
→ bundled artwork
→ bundled ASCII data
→ local AsyncStorage user data

No museum network dependency.

---

# ARTWORK

Use legitimate public-domain / Open Access artwork from authoritative sources such as:

- The Metropolitan Museum of Art
- Art Institute of Chicago
- National Gallery of Art
- other reputable museum Open Access programs

Start with artists such as:

Vincent van Gogh
Claude Monet

Possible initial collection:

CYPRESSES / 1889
Vincent van Gogh

FLOWERING ORCHARD / 1888
Vincent van Gogh

WATER LILIES
Claude Monet

MORNING ON THE SEINE
Claude Monet

VÉTHEUIL
Claude Monet

MUSEUM PAPER
No artwork / pure editorial mode

For every artwork asset retain metadata:

{
id,
title,
artist,
year,
museum,
museumObjectId,
source,
rights,
isPublicDomain
}

Do not use artwork unless its rights are appropriate for redistribution in an application.

---

# DO NOT BUNDLE RIDICULOUSLY LARGE SOURCE IMAGES

Download high-resolution museum masters during development.

Then generate mobile derivatives.

Suggested:

1600–2400px maximum dimension

Keep image quality high but app size reasonable.

The master source does not need to ship inside the app.

---

# ASCII ART PIPELINE

ASCII conversion should happen during development/build preparation, NOT dynamically every time the application starts.

Create something like:

scripts/build-art-assets.js

Pipeline:

Museum source image
→ optimized mobile image
→ grayscale/luminance sampling
→ ASCII conversion
→ metadata
→ optional palette extraction
→ generated app asset

ASCII character ramp example:

" .:-=+\*#%@"

Generate perhaps:

40–65 characters wide

depending on the visual.

Store ASCII as a multiline string or generated asset.

DO NOT create thousands of separate React Native components.

Prefer one Text layer containing the complete ASCII representation.

---

# NEW ART THEME SYSTEM

The existing theme engine should evolve rather than be discarded.

Current concept:

palette

New concept:

ArtTheme =

{
id,
name,

palette: {
bg,
card,
text,
mutedText,
primary,
primaryPressed,
primaryTextOn,
ringBg,
border,
danger
},

artwork: {
asset,
ascii,
artist,
title,
year,
museum,
source,
rights
},

typography: {
display,
body,
data
},

ascii: {
enabled,
opacity,
characters,
columns
},

visual: {
imageOpacity,
grainOpacity,
borderStyle,
cornerStyle
}
}

IMPORTANT:

Existing old themes and CUSTOM THEMES must continue working.

Do NOT make an existing saved theme ID invalid.

If the user's old theme exists:

load it normally.

If artwork metadata is absent:

render the classic/fallback theme layout safely.

---

# DESIGN LANGUAGE

Reduce:

- giant rounded cards
- excessive pill buttons
- excessive borders
- generic productivity-app visual patterns
- large blobs of primary color

Use more:

- typography
- spacing
- thin rules
- indexing
- small uppercase labels
- monochrome metadata
- subtle artwork
- ASCII texture
- understated motion
- museum-style attribution

---

# HOME / GOALS DESIGN

Reimagine the existing Goals screen.

Possible layout:

YEARLY / 2026 DAY 245

[ ARTWORK / ASCII HERO ]

CYPRESSES
VINCENT VAN GOGH
1889

YEAR PROGRESS
████████████████░░░░░░░░ 62%

01
RUN 500 MILES

288 / 500
+++++++++++++++++.........

02
READ 20 BOOKS

14 / 20
++++++++++++++.........

03
RUN A 10K

[ INCOMPLETE ]

────────────────────────

- ADD GOAL

Keep all existing goal interaction behavior.

Editing goals, updating progress, deleting, undo, dragging, completed state, hiding completed goals, etc. must continue working.

---

# PROGRESS COMPONENTS

Consider replacing the large conventional circular progress ring visually.

Do NOT remove the underlying calculation.

Instead render the same percentage using something more editorial:

████████████░░░░░░

or

62 ━━━━━━━━━━━━━━━────── 100

or another elegant treatment.

Progress behavior must remain mathematically identical.

---

# HABITS

This could become the signature screen.

Use ASCII-style states.

Current underlying habit state behavior should NOT change.

Visually map states to something like:

. = empty

- = good
  × = bad

Example:

SEPTEMBER / 2026

```
             27 28 29 30 31 01 02
```

WORKOUT + + . + × + +
CARDIO . + . + . + +
DRINK WATER + + + + + + .
READ + . + + + + +

- GOOD
  × BAD
  . EMPTY

Do not change the stored numeric states simply to achieve this appearance.

Presentation should map existing values into ASCII characters.

---

# HISTORY

Apply the same visual system to Habit History.

The eventual yearly heatmap should feel like a large ASCII calendar / contribution matrix.

Example:

JAN
...++++..+++....+++

FEB
+++++....++++++....

etc.

Again: underlying checks and history remain unchanged.

---

# THEME PICKER → ART GALLERY

Transform the current Theme picker into something closer to an art gallery.

Theme card:

[ artwork preview ]

CYPRESSES

Vincent van Gogh
1889

● ● ● ● ●

APPLY

Allow artwork themes and classic themes to coexist.

Potential categories:

ART COLLECTION
CLASSIC
CUSTOM

Do not remove custom theme functionality.

---

# SHARE CARDS

Eventually extend the art direction to share cards.

They should resemble museum posters/editorial prints rather than standard social media achievement cards.

Example:

YEAR / 2026

62%

RUNNING
288 MI

READING
14 BOOKS

[ subtle artwork / ASCII ]

YEARLY

But do this only after the main UI is stable.

Existing share functionality must continue working during the redesign.

---

# ARCHITECTURE CLEANUP

`App.js` is currently very large.

Use this redesign as an opportunity to extract presentation components WITHOUT rewriting working state logic unnecessarily.

Possible direction:

src/
screens/
GoalsScreen.js
HabitsScreen.js
HabitHistoryScreen.js

components/
art/
ArtHero.js
AsciiArtwork.js
ArtworkCredit.js

```
editorial/
  EditorialHeader.js
  EditorialProgress.js
  SectionRule.js
  MetadataLabel.js

themes/
  ThemeGallery.js
  ThemePreview.js
```

themes/
artThemes.js
classicThemes.js

assets/
art/

scripts/
build-art-assets.js

Do this incrementally.

Do NOT perform a gigantic rewrite all at once.

---

# IMPLEMENTATION STRATEGY

Work in phases.

PHASE 0 — AUDIT

Before changing code:

- map application state
- map AsyncStorage
- map native widget dependencies
- map theme loading
- map share functionality
- map goal flow
- map habit flow
- identify regression risks

Output the findings.

PHASE 1 — DESIGN FOUNDATION

Implement:

- ArtTheme format
- backwards-compatible theme resolution
- typography tokens
- spacing tokens
- editorial primitives
- ASCII renderer
- artwork metadata system

Do not redesign every screen yet.

PHASE 2 — GOALS

Redesign Goals while preserving every existing action.

Test thoroughly.

PHASE 3 — HABITS

Redesign Habits using ASCII states.

Test thoroughly.

PHASE 4 — HISTORY

Apply the design system to history.

PHASE 5 — ART GALLERY

Replace/extend the theme picker with Art Gallery while retaining classic/custom themes.

PHASE 6 — SHARE / WIDGET POLISH

Only after everything else is stable.

---

# REGRESSION CHECKLIST

After each phase verify:

GOALS

- goals load after fresh launch
- existing goals appear
- add works
- edit works
- progress works
- boolean goals work
- delete works
- undo works
- reorder works
- completed sorting works
- hide/show completed works

HABITS

- existing habits appear
- add works
- rename works
- delete works
- undo works
- reorder works
- each daily state cycles exactly as before
- history remains intact
- streak calculations remain correct

YEAR

- yearly progress matches old version
- annual rollover still works
- previous-year snapshots survive

THEMES

- existing theme selections load
- custom themes load
- custom themes remain editable
- new ArtThemes work
- missing art metadata never crashes the app

SHARING

- existing share cards render
- capture works
- native share works

ANDROID

- native widget bridge remains functional
- widget payload still receives expected structures

STORAGE

- install/update does not clear AsyncStorage
- no AsyncStorage keys were accidentally renamed
- old stored objects load without modification
- no duplicate goals/habits are created
- no history disappears

---

# MOST IMPORTANT TEST

Simulate a real production upgrade.

Create data using the current version BEFORE the redesign:

- 5 goals
- progress on several goals
- one completed goal
- several habits
- multiple weeks of habit history
- custom theme
- chosen built-in theme
- yearly/history data where possible

Save a copy of that AsyncStorage state.

Then run the redesigned version against THAT EXACT EXISTING STORAGE.

The redesigned app must load it perfectly.

Do not test only with fresh installs.

Also test:

OLD APP STORAGE
↓
NEW APP CODE
↓
ZERO DATA LOSS

This upgrade test is mandatory.

---

# IMPORTANT DEVELOPMENT RULE

Do not make unrelated changes simply because code could be cleaner.

The application works today.

Prefer:

small change
→ run/test
→ verify
→ commit

over:

rewrite half the application
→ debug regressions later

Keep commits focused.

Suggested branches/commits:

refactor/design-foundation
feat/art-theme-system
feat/ascii-art
redesign/goals
redesign/habits
redesign/history
redesign/theme-gallery

---

# VISUAL PRIORITY

The goal is NOT to make an ASCII app.

The goal is to make a BEAUTIFUL ART-DRIVEN APP where ASCII is one of the visual materials.

Artwork should still be recognizable.

Good:

real artwork

- subtle ASCII overlay
- beautiful typography
- clean data

Bad:

entire screen made out of ASCII

- terminal green
- retro gimmicks

Aim for subtle, artistic, expensive, calm, unusual.

---

# DO NOT BEGIN BY CHANGING CODE

First inspect the repository and give me:

1. Current architecture assessment
2. Current persistence/storage map
3. Data compatibility risks
4. Components/features that must not be touched logically
5. Proposed refactor boundaries
6. Proposed ArtTheme schema
7. Proposed artwork asset pipeline
8. Proposed file/folder structure
9. A screen-by-screen redesign plan
10. Migration strategy — ideally confirming none is needed for the initial redesign
11. Regression test plan
12. Exact implementation order

Once that is established, begin implementation incrementally.

At every stage remember:

THE EXISTING APP'S LOCAL STORAGE IS PRODUCTION DATA.

A visual redesign is NEVER justification for losing or resetting user data.
