# WonderNest Engineering & Release Checklist — 2026-11-14

This checklist tracks demonstrated work, rather than claiming that all code is production-verified.

## Phase 1 — Architecture and environment
- [x] Expo SDK 58, React Native 0.88, Expo Router, TypeScript, SQLite, SecureStore.
- [x] Install dependencies in GitHub Actions and run project-wide strict TypeScript check.
- [x] Offline Android bundle produced and packed into installable APK.

## Phase 2 — Design and onboarding
- [x] Shared child-friendly palette, responsive cards, large actions, branded icon/splash and original themed worlds.
- [x] First-play guided tutorial routes into working Memory Cards.
- [x] Reduced-motion support for card flips and navigation.
- [ ] Fully original high-quality artwork for every puzzle object; current puzzle tiles still use emoji.
- [ ] TalkBack, large-text, tablet and low-end phone visual QA.

## Phase 3 — Gameplay engine
- [x] Seeded procedural generator, validators, hints, replay, correctness checking, age-bounded challenge levels.
- [x] 12 game IDs, with original spatial Shape Grid distinct from Pattern Memory.
- [x] Induced maze paths with valid misleading dead-ends; full path lengths tested.
- [x] Brain Explorer prompts match the underlying puzzle format.
- [x] Sound Memory uses audio-first playback with optional visual clues.
- [ ] Complete on-device interactive testing of all 12 games, including wrong answers, hints, pause and resume.

## Phase 4 — Persistence and parent controls
- [x] SQLite migrations through v4, profile/progress/rewards/settings and time accounting.
- [x] Persist incomplete game runs with correctness checks and native-restart recovery logic.
- [x] Household session budget persists across child profile switches; pure policy tests pass.
- [x] Authenticated delete-all flow removes local data and SecureStore parent credentials.
- [x] PIN hashing, lockout, Android device-auth assisted recovery integrated.
- [ ] Verify all SQLite migrations, backup/delete flows, session enforcement and gate bypass attempts on device.

## Phase 5 — Internationalization, audio and accessibility
- [x] English, Hindi, Marathi matching text keys and translated tutorials/game labels.
- [x] Original bundled note sounds, positive cues and optional music.
- [x] Sound memory visual accessibility alternative and non-color-only shapes.
- [ ] Fluent native-speaker audit of all content; screen reader traversal and switch access.
- [ ] Guaranteed offline narration for all three languages (current OS speech depends on installed voices).

## Phase 6 — QA/builds
- [x] Pure game generator/property tests, persistence SQL contract tests, app config/asset contract tests.
- [x] GitHub quality workflow runs full-project TypeScript checks, tests and an offline Android export.
- [x] Previous standalone Android release v0.2 packaged and linked from GitHub Releases.
- [x] User confirmed earlier standalone WonderNest build opened successfully on Android phone.
- [ ] Android emulator offline-startup smoke: rerun underway after fixing UI-dump file permission issue.
- [ ] Current v0.3 APK build: run 43574246270; its conclusion must be verified.
- [ ] Automated end-to-end React Native UI tests and representative physical-device coverage.
- [ ] Android cold startup, memory, battery, TalkBack and performance measurements.

## Phase 7 — Store publishing
- [x] Draft store listing (English, Hindi, Marathi), icon and original 1024x500 feature graphic.
- [x] Draft privacy policy based on local-only design.
- [ ] Real user-interface screenshots from tested APK.
- [ ] Final merged manifest / software-supply-chain and vulnerability audit.
- [ ] Verified name/trademark, developer identity, parent support email and hosted privacy policy.
- [ ] Durable signing credentials and production Android App Bundle build.
- [ ] Play Console target audience, rating, Data safety, age declaration and required closed tests.
- [ ] Required external legal review and Google Play publication approval.

**Acceptance decision: Development progressing with working test builds; do not label 100% complete or Google Play-ready until the remaining tests, original-art/narration features, and external release requirements are satisfied.**
