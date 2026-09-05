# Yearly Tracker — Revamp / Rebrand

## Status

**REVAMP / REBRAND FEATURE DEVELOPMENT: COMPLETE**

Current phase:

**RELEASE HARDENING / TESTFLIGHT QA**

No additional feature work is planned before the next release unless a
release-blocking defect is discovered.

Do not merge `feature/revamp` into `main` yet.
Do not run the production EAS / live App Store build until TestFlight QA
passes.

The shipping visual system stays as currently approved. This file is no longer
an implementation backlog for new features or redesign.

---

## What is complete

The `feature/revamp` branch now contains the finished product work for this
release:

- Museum-catalogue visual system (`design.md`)
- Bundled Open Access art collection, Random Art, ASCII texture, Living Canvas
- First-run flows (fresh welcome, existing-user new edition, style choice,
  catalogue onboarding, Replay guide)
- Yearly Tracker / `[YT]` identity swap from the interim Atelier name
- Native widget artwork surfaces with Yearly-visible titles
- Additive storage keys only; production persistence contract unchanged

Internal implementation names such as `AtelierSheet`, `AtelierCounter`,
`AtelierMark16`, and `atelier-widget-background.jpg` are preserved on purpose.
Do not rename them for cosmetics.

---

## Release hardening (this phase)

Audit goal: no development-only behavior, debug UI, test configuration,
localhost dependency, QA tooling, or temporary development artifact can appear
or execute in a production / TestFlight / App Store build.

### DEV-only first-run QA — keep, `__DEV__` gated

The long-press `[YT]` first-run QA menu is useful and stays in the repo.

Production / TestFlight / App Store behavior must have:

- no QA affordance
- no long-press action on the mark
- no hidden QA modal
- no executable QA mutation path

Confirmed gates (`__DEV__` is compile-time `false` in release JS):

| Surface | Gate |
| --- | --- |
| Header `[YT]` long-press | `CollapsingHeader.js`: `__DEV__ && onMarkLongPress` |
| App.js handler | `onMarkLongPress` is `undefined` unless `__DEV__` |
| QA modal render | `{__DEV__ ? <DevFirstRunQa /> : null}` and `if (!__DEV__) return null` |
| Mutation helpers | every export in `utils/devFirstRunQa.js` starts with `if (!__DEV__) return` |
| App.js QA actions | `qaSimulateFresh` / old user / earlier revamp / replay / reset theme each `if (!__DEV__) return` |
| Reload | `reloadForQa` uses `DevSettings.reload()` only after `__DEV__` |
| Data safety | helpers blocklist `rt_goals_v1`, `yt_habits_v1`, `yt_goal_history_v1`, `yt_custom_themes_v1`, `rt_hue_v1` |

Do not remove this QA system. Do not reuse `rt_welcome_seen_v1` or
`yt_revamp_intro_seen_v1` as the style-choice flag.

### Debug leftovers classified

| Hit | Classification | Action |
| --- | --- | --- |
| `NativeDebugPanel` in `App.js` | Unused native-bridge debug UI | **Removed.** Never rendered; must not ship. |
| `expo-constants` import in `App.js` | Only used by `NativeDebugPanel` | **Removed.** |
| `ios/.../project.pbxproj.bak_widgetbridge_m` | Tracked Xcode backup | **Untracked** and gitignored. Not part of the app bundle. |
| Android `setDebugWidgetTextAndroid('DBG …')` | Dev-client widget probe | **Kept.** Write is behind `__DEV__`. Release clears the string. `loadDebugText` is never drawn in widget UI. |
| `WidgetBridgeAndroid … Rebuild dev client?` log | Dev-client diagnostic | **Kept**, now `__DEV__`-only. |
| `console.log("Widget sync failed")` / artwork share failed | Operational failure logs | **Kept.** Not user-facing. |
| `DevFirstRunQa` + `utils/devFirstRunQa.js` | DEV first-run QA | **Kept.** Hard-gated. |
| `ProgressWidgetProvider.kt` + `widget_progress` | Unregistered legacy Android widget class | **Left.** Not in the manifest; rewriting widgets is out of scope. |
| Internal `Atelier*` class / resource names | Implementation names | **Left.** User-facing copy is Yearly Tracker / `[YT]`. |
| `atelier-widget-background.jpg` filename | Widget artwork contract | **Left.** Renaming would break native decode. |
| Brand ZIPs in repo root | Local handoff; already gitignored | **Left on disk, not tracked.** |
| `scripts/build-art-assets.js` | Dev-only art pipeline | **Left.** Never run against a live install. |
| `__fixtures__/upgrade/v1-asyncstorage.json` | Storage compat fixture | **Left.** |

### Production identity (do not change)

| Surface | Value |
| --- | --- |
| Visible name | Yearly Tracker |
| iOS bundle | `com.andresbotia.ResolutionTracker` |
| iOS widget | `com.andresbotia.ResolutionTracker.widgets` |
| App Group | `group.com.andresbotia.ResolutionTracker.shared` |
| Android package | `com.andresbotia.yearlytracker` |
| iOS widget kinds | `YearlyProgressWidget`, `HabitsWidget`, `HighlightGoalWidget`, `GoalsListWidget` |
| Android widget labels | Yearly Progress, Yearly Habits, Goal Highlight, Yearly Goals |
| Icon / splash | `assets/icon.png`, `assets/splash-icon.png` (Museum Paper splash) |

`eas.json`:

- `development` — `developmentClient: true` (internal)
- `preview` — internal, no dev client
- `production` — `autoIncrement: true`, no dev client

Release JS loads `main.jsbundle` / the embedded Android bundle. Metro /
`.expo/.virtual-metro-entry` is `#if DEBUG` / `BuildConfig.DEBUG` only.

No shipping JS/JSON under `App.js`, `components/`, `utils/`, `native/`,
`features/`, `themes/`, `index.js`, `app.json`, or `eas.json` contains
`localhost`, `127.0.0.1`, or `10.0.0.*`.

### Storage / existing users

Do not rename, remove, or reset production storage.

Existing App Store users must keep goals, habits, checks, history, current
year, custom themes, selected theme, and Random Art state.

Existing-user redesign + style-choice migration stays intact
(`yt_revamp_intro_seen_v1`, `yt_revamp_theme_choice_seen_v1`).

Fresh-install Random Art default and catalogue onboarding stay intact
(`yt_onboarding_seen_v1`).

`npm run verify:storage` is the contract check.

### Noted, not changed

These are not debug leftovers and were left alone on purpose:

- `app.json` has `"newArchEnabled": false` while native iOS/Android currently
  build with New Architecture enabled. Native projects are the shipping
  source. Do not flip architecture flags in this pass.
- `expo-dev-client` remains a dependency so the EAS `development` profile
  works. Production / preview profiles do not set `developmentClient`.
- Android `release` signing in `app/build.gradle` still points at the debug
  keystore locally. EAS injects production credentials; do not invent a local
  keystore here.
- `SYSTEM_ALERT_WINDOW` in the main Android manifest is Expo template default.
  Debug manifests also enable cleartext traffic; release does not.
- Widget artwork native code can read `http(s)` URIs so Metro asset URLs work
  in DEV. Production uses bundled/file URIs.

Do not upgrade dependencies solely to make expo-doctor 18/18.

---

## TestFlight / live-build QA (next)

Physical-device and TestFlight checks before the production EAS build:

1. Upgrade path from the current App Store install: goals, habits, history,
   theme, custom themes, and year survive.
2. Existing-user path: New edition card, then style choice, then no repeat on
   relaunch.
3. Fresh-install path: Welcome to Yearly Tracker, Random Art default,
   catalogue tour Skip / finish.
4. Replay guide from the collection still works.
5. Production build: long-press on `[YT]` does nothing; no `[DEV]` UI.
6. Visible name is Yearly Tracker. No Atelier Tracker / `[AT]` in UI, widgets,
   share sheet, or splash.
7. Widgets: Yearly Progress / Habits / Goal Highlight / Goals List; artwork
   plate for art themes; solid palette for classic / custom / Museum Paper;
   Random Art does not re-roll on widget refresh.
8. Narrow width (375pt / iPhone 7 class): titles wrap, no important ellipsis.
9. Reduced motion: Living Canvas off, controls still work.
10. Offline: no museum / network artwork requests.

When those pass, the next step is the production EAS build and App Store
submission — still not a merge to `main` unless explicitly requested.

---

## Do not

- Merge `main`
- Run the production EAS build from this hardening pass
- Add features
- Redesign UI
- Rewrite widgets
- Change storage contracts
- Change bundle / package / App Group / widget kind IDs
- Perform broad dependency upgrades
- Run `npm run build:art` against a live user install
