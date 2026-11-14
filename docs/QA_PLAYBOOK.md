# Real Android testing playbook (must be run before launch)

Use at least one low/mid-range Android phone and one tablet. Record Android version, RAM, screen resolution, build SHA, observed outcome, and defects. Repeat important tests with airplane mode enabled.

## Install & onboarding

- [ ] Install signed APK and launch with Wi-Fi off; no crash or permission surprise.
- [ ] Splash/mascot renders, parent/privacy text legible, correct age-group selection.
- [ ] Set parent PIN, create explorer, select avatar, restart app and verify persisted profile.
- [ ] Confirm no ads, trackers, external links, signup or chat accessible to children.
- [ ] Switch en ↔ hi ↔ mr; inspect ALL user-facing labels and instructions.

## Games (repeat for ages 3–5, 6–8, 9–12)

- [ ] Cards: flip 2, mismatch reset, matched pair persists; hint reveals pair; finished correct only after every pair.
- [ ] Objects: look, hide, select exact multi-selection; distractors marked incorrect, no impossible objects.
- [ ] Pattern: animated preview, repeat, wrong sequence retry, reduce-motion view.
- [ ] Missing: original and modified sets, correct missing object, multiple puzzle seeds.
- [ ] Treasure: replay safe path, reject diagonal moves, no success for wrong path.
- [ ] Sound: six bundled notes audible offline, replay sequence and select order; mute/audio volume & visual alternate.
- [ ] Detective: scenes and location question agree exactly, answer chosen correctly.
- [ ] Story: frames and asked object agree, optional spoken instructions where offline voices installed.
- [ ] Shapes: color-independent shape labels, different length sequences.
- [ ] Order: accessible tap-to-reorder, shuffle, retry, clear.
- [ ] Maze: start, valid adjacent route, obstacles, goal, no impossible configuration.
- [ ] Explorer: varied puzzles, all underlying modes respond to correct/incorrect answers.
- [ ] Every game: pause/resume, leave confirmation, retry, hints, completion, rewards, persist after force stop.

## Parent controls and security

- [ ] Parent route always asks for PIN after leaving/returning and after background/foreground.
- [ ] Wrong PINs 5 times cause a persistent timed lockout, even if app is force-closed.
- [ ] Device biometric/system authentication recovery succeeds only after real OS authentication.
- [ ] Edit profile, change age, daily/session limits, disable each game; disabled games stay unavailable.
- [ ] Household daily cap cannot be bypassed by profile switching or app restart.
- [ ] Session cap triggers a rest, with an appropriate later reset; time does not accrue in background or parent dashboard.
- [ ] Allowed play hours allow and deny appropriately, including crossing midnight.
- [ ] Pause/resume all play; deletion of one profile cascades to that profile's progress.
- [ ] Delete all local progress. Confirm no historical data visible afterwards.
- [ ] Alter device clock, clear app storage, replace PIN or change profiles; document any limitations.

## Android production and privacy

- [ ] `npm run check`, `npm run test:core`, `npx expo-doctor`, `npx expo export` PASS.
- [ ] EAS preview APK and production signed AAB both build successfully.
- [ ] Inspect Android merged manifest for target SDK 36 and no advertising identifier, microphone, camera, location or excess permissions.
- [ ] Verify no outgoing requests or trackers using a network inspection tool in a production build, with narration off/on.
- [ ] TalkBack, high font scaling, smallest supported device, tablet, dark appearance, cutout safe insets, back gestures.
- [ ] Check memory/CPU/battery, animation performance, interrupted audio, low storage, device rotation, process death.
- [ ] Confirm Play Console target audience, content rating, Data safety and privacy page match actual behavior.
- [ ] Complete child-safety legal review for intended launch countries.

## Logging template

`Date | Device | Build SHA | Case | PASS/FAIL/BLOCKED | Steps | Evidence/screenshots | Fix commit | Retest`

Do not turn unchecked items into PASS without running them.
