# ATELIER TRACKER — NEXT REVAMP PHASE

Continue the current revamp on `feature/revamp`.

Before changing code:

1. Read `REVAMP.MD`
2. Read `design.md`
3. Read `AGENTS.md`
4. Inspect the current implementation and recent commits
5. Stay on `feature/revamp`
6. Do not modify or merge into `main`

This phase combines:

- Atelier Tracker rebrand
- backdrop legibility refinement
- expanded art-theme collection
- theme gallery update
- intro/rebrand messaging
- documentation alignment
- production compatibility verification

---

# 1. REBRAND TO ATELIER TRACKER

Rebrand the user-facing product from:

`Yearly Tracker`

to:

`Atelier Tracker`

Use the chosen brand direction conceptually as:

`[AT]`

`Atelier Tracker`

The `[AT]` mark should act as the lightweight editorial brand mark until final logo assets are supplied.

Use `[AT]` tastefully in places such as:

- app header/kicker
- intro modal
- splash/brand treatment
- theme gallery
- small identity moments

Do not overuse it.

## Safe rebrand rules

Change USER-FACING branding only.

Update where appropriate:

- app display name
- in-app headings
- onboarding/revamp intro copy
- docs
- share cards
- splash/brand copy
- visible widget branding if safe

Do NOT rename technical identifiers just because the brand changed.

Do NOT change:

- existing AsyncStorage keys
- iOS bundle identifiers
- Android package identifiers
- widget bundle identifiers
- native widget contracts
- existing persisted schemas
- user IDs
- storage behavior

These should remain stable:

`com.andresbotia.ResolutionTracker`

`com.andresbotia.ResolutionTracker.widgets`

Existing storage remains production data.

This must behave as a normal app update:

Yearly Tracker
→ app update
→ Atelier Tracker
→ same goals
→ same habits
→ same history
→ same themes
→ same local data

---

# 2. IMPROVE CONTENT LEGIBILITY OVER ART BACKDROPS

The full-canvas artwork backdrop is working well, but the painting currently competes with the UI slightly too much.

Refine readability WITHOUT reverting to generic card UI.

Do NOT create large opaque cards everywhere.

Do NOT add:

- heavy shadows
- large rounded cards
- obvious floating panels
- thick borders

Instead use a very subtle editorial legibility system.

Possible tools:

- slightly stronger paper veil behind dense content areas
- faint paper-tint washes
- very subtle 1px keylines
- low-opacity section framing
- soft tonal separation behind controls
- carefully increased contrast where necessary

Target effect:

CONTENT FEELS LIGHTLY HELD ON THE PAGE.

Not boxed.

Suggested starting values:

Translucent keyline:

`rgba(28, 25, 22, 0.06–0.10)`

Subtle paper wash:

`rgba(246, 243, 236, 0.08–0.14)`

Tune these visually.

Do not blindly use the same opacity everywhere.

Potential use areas:

- header / identity region
- yearly progress area
- CTA toolbar
- habit rows
- goal action rows
- history sections
- gallery modal
- dense metadata areas

Keep the painting visible.

The art should still feel like the environment.

---

# 3. ATELIER ART COLLECTION

The art-theme collection is now part of the Atelier Tracker identity.

The collection should feel curated rather than random.

Creative direction:

MUSEUM CATALOGUE
×
IMPRESSIONISM / POST-IMPRESSIONISM
×
PERSONAL ARCHIVE

Artwork should be:

- atmospheric
- painterly
- elegant
- nature-forward
- softly architectural when appropriate
- muted enough for UI overlays
- visually strong without overwhelming content

Avoid:

- overly dark works
- extremely high contrast
- crowded scenes
- portrait-dominant works
- visually chaotic compositions
- pieces that fight with text

Aim for approximately 18 total art themes.

Quality is more important than hitting exactly 18.

---

# 4. LOCKED CORE ARTWORK

These selections are APPROVED.

Do not replace them without explicit approval.

## Vincent van Gogh

### 01 — Cypresses

Vincent van Gogh

### 02 — Wheat Field with Cypresses

Vincent van Gogh

### 03 — Women Picking Olives

Vincent van Gogh

## Claude Monet

### 04 — The Seine at Giverny

Claude Monet

### 05 — Haystacks

Claude Monet

These should remain part of the canonical Atelier collection.

Existing theme IDs already in production/dev must remain stable.

If one of these already exists under a current ID, preserve the ID.

---

# 5. EXPANSION ARTISTS

Expand the collection using similar late-19th-century / impressionist / post-impressionist artists.

Priority artists:

- Alfred Sisley
- Camille Pissarro
- Paul Cézanne
- Berthe Morisot
- additional Claude Monet
- other closely related artists only if they fit the visual system

Do not expand simply for variety.

The collection must still feel cohesive.

---

# 6. PREFERRED EXPANSION CANDIDATES

Strong candidates include:

## Claude Monet

### Water Lilies

Soft blue / green / lavender atmosphere.

### The Japanese Footbridge

Excellent garden theme with deeper greens.

### The Artist’s Garden at Vétheuil

Brighter garden theme with yellow/green energy.

### The Artist’s Garden in Argenteuil

Floral, painterly, colorful but still compatible with the Atelier aesthetic.

### Rouen Cathedral, West Façade

More architectural and tonal while staying unmistakably Monet.

---

## Alfred Sisley

### The Bridge at Villeneuve-la-Garenne

Excellent sky / water / architecture balance.

### The Road from Versailles to Louveciennes

Quiet editorial landscape with strong depth.

### Rue Eugène Moussoir at Moret: Winter

Useful cooler / winter variation.

Sisley should help broaden the collection without changing the visual language dramatically.

---

## Camille Pissarro

### Landscape, Île-de-France

Excellent backdrop candidate:

- wide sky
- muted land
- restrained palette
- readable behind UI

### The Artist’s Garden at Éragny

Good garden alternative if authoritative Open Access sourcing is available.

---

## Paul Cézanne

### Mont Sainte-Victoire

Strong earthy / teal / ochre palette.

One of the best candidates for Atelier outside Monet and Van Gogh.

### Mont Sainte-Victoire and the Viaduct of the Arc River Valley

More structured and architectural.

Good contrast with the softer Impressionist works.

---

## Berthe Morisot

### Girl in a Boat with Geese

Soft greens and blues with loose brushwork.

### The Sisters

More figurative than the rest of the collection, so only include if it still works well as a full-screen UI backdrop.

Prefer Morisot works that remain atmospheric rather than portrait-heavy.

---

# 7. CURATORIAL SELECTION RULES

When filling the remaining slots toward ~18 total themes:

Prioritize works with:

- broad areas of sky / water / foliage
- natural texture
- soft tonal transitions
- low-to-medium visual density
- strong but muted palettes
- compositions that tolerate cropping with `cover`
- recognizable visual identity after the paper veil is applied

Avoid works where important subjects are constantly hidden by UI.

The selected artwork must still look intentional when:

- cropped vertically
- displayed on iPhone 7 / 375pt
- displayed on modern iPhone aspect ratios
- displayed on Android
- partially obscured by UI

---

# 8. ART ASSET SOURCING

Use ONLY authoritative museum Open Access / public-domain sources.

Preferred sources:

- The Metropolitan Museum of Art
- National Gallery of Art
- Art Institute of Chicago
- similarly reputable museum Open Access programs

Do NOT use:

- Pinterest
- random image hosts
- unofficial art wallpaper websites
- search-engine previews
- scraped reproduction sites

Even if a painting itself is public domain, use an authoritative image source.

For each artwork maintain metadata:

```js
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

Do not bundle artwork unless rights are confirmed.

9. NO RUNTIME ART NETWORK CALLS

Atelier Tracker remains offline-first.

Museum APIs are DEVELOPMENT TOOLS ONLY.

Runtime:

Bundled artwork
+
bundled ASCII
+
local AsyncStorage

No runtime museum requests.

No accounts.

No analytics introduced.

No tracking introduced.

No artwork CDN dependency.

10. ART ASSET PIPELINE

For every approved artwork:

Authoritative museum image
→ download high-resolution development source
→ create optimized mobile derivative
→ create ASCII derivative
→ optionally derive palette
→ store metadata
→ bundle with app

Do NOT ship enormous museum masters.

Use an appropriate optimized mobile size.

Keep image quality high enough for full-screen use while respecting app size and older devices.

ASCII remains build-time generated.

Do not dynamically convert paintings to ASCII on every launch.

11. ASCII RULE

ASCII remains:

TEXTURE, NOT THE ARTWORK ITSELF.

Do not turn Atelier Tracker into a terminal theme.

Use:

one ASCII Text layer
low opacity
subtle texture
artwork still recognizable

Stored habit values remain:

0 = empty
1 = good
2 = bad

Visual presentation remains:

. = empty
+ = good
× = bad

Do not change persistence semantics.

12. UPDATE THE ART GALLERY

Expand the gallery for the larger collection.

It should feel like browsing a small museum collection.

Possible organization:

ATELIER COLLECTION

VAN GOGH
01 — Cypresses
02 — Wheat Field with Cypresses
03 — Women Picking Olives

MONET
04 — The Seine at Giverny
05 — Haystacks
...

SISLEY
...

PISSARRO
...

CÉZANNE
...

MORISOT
...

Then:

CLASSIC

CUSTOM

The gallery should remain calm and editorial.

Requirements:

artwork thumbnails
artist
title
year
museum/source
palette preview
selected-state indication
graceful title wrapping
no metadata clipping
no giant cluttered cards

Classic themes must remain available.

Custom themes must remain available/editable.

Existing selected theme IDs must still resolve.

13. UPDATE INTRO / REBRAND COPY

The revamp intro now needs to communicate the name change.

We must distinguish:

Existing production user

They previously used Yearly Tracker.

Suggested direction:

KICKER

[AT] / NEW EDITION

TITLE

Yearly Tracker is now Atelier Tracker

BODY

Your goals, habits, and history are exactly where you left them.

We’ve reimagined the experience around art, typography, and the idea of your year as a personal archive.

Your data remains private and stored on your device.

CTA

ENTER ATELIER

Brand new user

Do NOT tell them the app “changed.”

Suggested direction:

KICKER

[AT] / PRIVATE YEARLY JOURNAL

TITLE

Welcome to Atelier Tracker

BODY

Track your habits, goals, and year through a quiet, art-led interface.

No account. No tracking. Your data stays on your device.

CTA

ENTER ATELIER

14. INTRO STORAGE SAFETY

Do not reuse:

rt_welcome_seen_v1

Do not reset existing onboarding flags.

Use the existing additive revamp-introduction mechanism if already implemented.

Current intended key:

yt_revamp_intro_seen_v1

Keep it additive.

Do not create duplicate onboarding flags unless necessary.

Modal order must remain safe:

existing required onboarding
→ rollover
→ habits intro
→ Atelier/revamp intro

Never stack multiple modals.

15. UPDATE APP BRANDING

Update user-facing references to Atelier Tracker.

Review:

App.js
app.json display name
headers
welcome modal
revamp intro
share cards
theme gallery
empty states
splash copy
README
AGENTS.md
design.md
REVAMP.MD
visible widget titles if safe

Keep internal technical names when changing them has no user benefit.

Do not rename files/packages merely for cosmetic reasons.

16. [AT] BRAND MARK

Use [AT] as the provisional brand mark until final production SVG assets are available.

Visual intent:

[AT]

editorial
archival
catalogue-like
subtle computing/indexing influence
not cyberpunk
not hacker aesthetic

Possible header usage:

[AT] ATELIER TRACKER / 2026

Do not replace every page title with [AT].

Use it as identity punctuation.

17. DOCUMENTATION

Update repository documentation to reflect the new brand and art collection.

Review:

AGENTS.md

design.md

REVAMP.MD

README.md

Document hierarchy remains:

AGENTS.md
→ engineering / process / persistence / safety

design.md
→ visual system

REVAMP.MD
→ current redesign/rebrand implementation specification

Update design.md with:

Atelier Tracker naming
[AT] identity
expanded art collection
legibility treatment
gallery rules
full-canvas artwork behavior

Do not let documentation contradict implementation.

18. NON-NEGOTIABLE PRODUCTION SAFETY

Do NOT break:

existing AsyncStorage compatibility
goal CRUD
habit CRUD
habit 0/1/2 semantics
history
rollover
drag/reorder
haptics
undo
sharing
widget payload contracts
classic theme compatibility
custom theme compatibility

Do NOT rename:

existing AsyncStorage keys
bundle identifiers
package identifiers
native widget identifiers/contracts

Do not reset user data.

Do not reseed existing users.

Do not change IDs.

Do not drop unknown persisted fields.

Do not convert storage schemas merely because the branding changed.

19. IMPLEMENTATION ORDER

Do this as a focused continuation, not a rewrite.

Suggested order:

read AGENTS.md / REVAMP.MD / design.md
inspect current branch + recent commits
Atelier Tracker branding pass
backdrop legibility refinement
establish locked Atelier art catalog
resolve authoritative museum sources
add optimized artwork assets
generate ASCII assets
add/update ArtThemes
update gallery organization
update onboarding/rebrand copy
update docs
verify persistence compatibility
inspect git diff
make focused commits

Do not stop after completing only one section.

Continue through the full phase unless genuinely blocked.

20. VERIFICATION

Before finishing:

Run:

npm run verify:storage

npx expo-doctor

Run any other REAL existing project verification commands.

Do not invent scripts.

Verify:

old AsyncStorage fixture still passes
existing theme IDs resolve
custom themes resolve
locked current art themes still resolve
new art themes resolve
all artwork files exist
all ASCII files exist
no bad require/import paths
no duplicate theme IDs
no runtime museum requests
no accidental identifier renaming
no production storage regression
no accidental business-logic change

Inspect narrow layouts.

At minimum reason against:

iPhone 7 / 375pt
modern iPhones
Android

Do not claim device testing unless actually performed.

21. FINAL REPORT

At completion report:

What changed
Files changed
Atelier Tracker branding changes
[AT] usage
Backdrop legibility changes
Final art-theme catalog
Museum/source metadata used
Theme gallery changes
Intro/rebrand behavior
Storage compatibility results
Build/test results
Commits created

```
