# Maintained engineering checklist — as of 2026-11-14

## Phase 1 — architecture and environment
- [x] Offline-first React Native/Expo + SQLite architecture selected
- [x] Modular TypeScript core, screens, storage, audio and security created
- [ ] Install npm packages / run Expo SDK Doctor (npm registry was unavailable)

## Phase 2 — design system
- [x] Shared design tokens, responsive cards, touch buttons, original backgrounds and mascot artwork
- [x] Reduced-motion card-flip control and gentle transitions in source
- [ ] Validate accessibility and layout across actual Android devices
- [ ] Replace emoji-only item art with fully original illustrated production collection

## Phase 3 — game engine
- [x] Deterministic seeded puzzle construction
- [x] Answer validation and hint hooks
- [x] Property tests for 9,000 puzzles

## Phase 4 — 12 games
- [x] 12 distinct game IDs, procedural challenges and gameplay UI branches in source
- [x] Automated puzzle correctness tests across 3 ages
- [ ] Native end-to-end interaction verification for each game (untested)

## Phase 5 — adaptive intelligence
- [x] Per-game age-bounded deterministic difficulty and tests
- [ ] Validate adaptive feedback with real users and child-development reviewers

## Phase 6 — profiles and persistence
- [x] SQLite profiles/results/rewards/usage/settings and schema migrations in source
- [x] SQLite DDL/transaction contract tests on Python real engine
- [ ] Force-stop/reopen/restart device verification

## Phase 7 — parent dashboard
- [x] Parent PIN and simulated rate-limit tests
- [x] Profile management, allowed hours, time budgets, break reminders, pause, per-game controls, local deletion UI
- [ ] On-device OS recovery/auth, long-running screen time, background and timezone behavior verification

## Phase 8 — polish
- [x] 5 original themed art backgrounds, fox mascot, icon, splash, feature graphic
- [x] Bundled notes, cues and music; 3 matching translation key catalogs
- [ ] Confirm correct pronunciation and narration in all languages using real offline Android voices
- [ ] Original object illustrations, accessibility audit, fluent language review

## Phase 9 — QA
- [x] 44 JavaScript core/security/i18n tests passed
- [x] 4 Python SQLite contract tests passed
- [x] 4 Python image/WAV/Android config contract tests passed
- [x] Core TypeScript strict checks and application TSX syntax parse passed
- [ ] Full React Native type-check / native build / emulator and physical Android UI tests
- [ ] Manual low-end performance, stress, offline, privacy and security audits

## Phase 10 — production / publishing
- [x] API 36 target declared in Expo configuration; backup disabled in source config
- [x] Policy/privacy draft, store listing draft, QA instructions, icon/feature graphic
- [ ] Verify merged manifest, signing, package uniqueness and Android AAB/APK builds
- [ ] Original app name clearance, public policy and support URL, genuine device screenshots
- [ ] Play Console owner verification, closed tests, child-policy declarations, content rating, app approval

## Current sign-off decision
**NOT RELEASE READY.** Source is substantially developed but has not passed native integration/build, physical-device, full accessibility, legal or Play Console checks. See `docs/RELEASE_STATUS.md` and `docs/FEATURE_MATRIX.md`.
