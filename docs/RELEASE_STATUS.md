# WonderNest development and release evidence — 2026-11-14

## Current product status

**An installable standalone Android test APK exists and a parent/child user reported that the app opens and runs on a real Android phone.** This is important device feedback, not a formal end-to-end functionality test.

The application is **not yet verified 100% feature-complete or ready for a public Google Play release**. Keep signed production distribution and compliance separate from working preview builds.

## Source and verified automated results

- Native project: Expo SDK 58 / React Native 0.88 / Expo Router with Android API 37 compilation and target API 36.
- Build: Android standalone **release-mode** APK; React Native `assets/index.android.bundle` explicitly checked inside APK to prevent "Unable to load script" encountered with the original debug APK.
- GitHub run `43562585560`: release-mode Android compilation and APK artifact upload **PASS**. The user independently reported the generated standalone APK working on an Android phone.
- GitHub quality run `43566690691`: npm dependency installation, strict full-project TypeScript check, core property tests, SQLite contract tests, asset/config tests, offline Android JavaScript export **PASS**.
- This repository now holds editable app source, unlike the original ZIP-only workflow.
- Source changes after first working APK:
  - `src/core/generate.ts`: seeded depth-first path generator guarantees the full age-appropriate maze/treasure length rather than silently returning a shorter route. Tested across 12 games × 3 ages × 250 deterministic seeds.
  - `src/storage/database.ts`: SQLite v3 `active_runs` persists unfinished games; v4 `household_session` tracks cross-profile session time.
  - `app/play/[id].tsx`: restores saved puzzle and selections after app restarts, clears unfinished state on completion.
  - `src/ui/provider.tsx` and `src/core/time.ts`: household shared session is enforced to reduce profile-switch bypass.
  - SQLite v3/v4 and timer edge-case assertions added.
- GitHub run `43566847269`: recompilation from **current** source launched. Consult its conclusion and `WonderNest-Updated-Standalone-APK` artifact for current build evidence. Do not assume success without checking.

## Known requirements still unverified / outstanding

1. Execute and document full flows for each of the 12 games on an Android phone and tablet, including hints, resume, correct/wrong answers, progress/rewards.
2. Native Android persistence/upgrade tests, including existing installations migrating from schema v2 to v4, app process termination, and device reboot.
3. Parent PIN lockout/recovery/security bypass testing, break reminders, multi-profile/time-limit behavior, background/foreground and time-change edge cases.
4. Native accessibility testing (TalkBack, focus traversal, large font, reduced motion), screen sizes, orientation and performance/battery profiling.
5. Child-friendly original illustrations replacing emoji-dependent puzzle art, mature themed visuals, interaction animation and graphical QA on supported devices.
6. English, Hindi, Marathi linguistic review. On-device narration depends on installed system voices; offline narration is not guaranteed for every device/language. Do not advertise fully bundled narration yet.
7. Privacy/permissions and child-directed third-party dependency audit of the final merged Android manifest, qualified jurisdiction-specific legal/policy review, and actual Play Data safety declarations.
8. Genuine device screenshots, final store listing and trademark checks, public support/privacy URLs, Android App Bundle signing and Play Console account/testing and review.
9. App launch testing from a dedicated Android emulator and automated UI interaction tests are still needed for full independent verification.

## Release decision

**TEST APK: available. PRODUCTION GOOGLE PLAY RELEASE: NOT YET VERIFIED/APPROVED.**

An APK compiling successfully proves packaging; it does not prove child-safety, accessibility, every button and mini-game, or Play Store readiness. No 100% completion claim or invented percentage is made.
