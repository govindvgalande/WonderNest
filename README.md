# WonderNest — Kids Memory & Brain Adventure

**Current status:** Implemented source-code project for a privacy-first Expo SDK 58 Android game. **Not yet Android-build-validated or device-tested. Not published.** See `docs/RELEASE_STATUS.md` and `docs/FEATURE_MATRIX.md` for precise evidence.

![Original fox mascot](assets/art/fox.png)

WonderNest is a parent-configured, offline-first educational game for children ages 3–12. It includes 12 distinct procedural challenge formats, three bounded adaptive difficulty profiles, a parent PIN gate, per-profile SQLite progress and rewards, time accounting, and English/Hindi/Marathi text. A device TTS voice is optional (not guaranteed available offline); sound memory uses included original synthesized WAV clips.

## What's in this repository

- `app/`: Expo Router screens: onboarding, profiles/home, five worlds, 12 game routes, rewards, progress, parent PIN/dashboard, session finish.
- `src/core/`: seeded generation, answer validation, age bounds, adaptive difficulty, reward and screen-time policies.
- `src/storage/`: SQLite schema (version 2), atomic result/reward writes, settings, profiles, screen usage.
- `src/security/`: parent PIN in Android secure storage, rate limiting, optional OS-authenticated recovery.
- `src/audio/`: six bundled distinct note timbres, feedback chime, optional looped music, optional system speech.
- `src/content/`: complete translation key sets and object names for English/Hindi/Marathi.
- `assets/`: original generated landscape illustrations, fox icon/mascot, seven cues and one music clip.
- `tests/`: deterministic property tests, adaptive algorithm tests, mocked PIN security tests, real SQLite engine schema tests.
- `docs/`: audit, status, policies, publishing content, manual QA checklist and licensing notes.

## Beginner setup: on a Windows or macOS development computer

1. Install Node.js **22.13+** and Git. Install Android Studio for local Android development (optional if using EAS cloud builds).
2. Unzip the folder and open a terminal inside `WonderNest`.
3. Run `npm install` to download dependencies. Then run `npx expo install --fix` to align package versions to the installed Expo SDK. **This could not be done in the creation environment because the npm registry DNS was unavailable.**
4. Run `npm run check` (TypeScript), `npm run test:core` (offline pure logic and SQLite schema contracts and asset/config checks), and `npx expo-doctor` (dependency audit). Fix any issues shown before building.
5. Run `npx expo start` and use a compatible Expo Go on Android, if available for Expo SDK 58. For a more representative test, create an Expo development/preview build.
6. For an APK testing build, install EAS CLI (`npm install -g eas-cli`), sign in (`eas login`), configure the EAS project (`eas build:configure`), then run `npm run build:android:preview`. The resulting hosted artifact should be an APK; download it and install on your Android phone after reviewing permissions.
7. For a signed Play Store AAB, run `npm run build:android:production`, arrange app signing in EAS/Play Console, then upload the generated AAB after passing **all** checks in `docs/QA_PLAYBOOK.md` and the child-privacy audit.

No Expo developer credentials, EAS project ID, signing key, Android SDK or Google Play account were available in this creation environment. **No APK or AAB is enclosed; do not interpret `eas.json` as a successful build.**

## Quick play/parent check after running on a device

1. Launch. Read privacy disclosure; set a six-to-twelve digit parent PIN. This is not an identity or age-verification service.
2. Create an optional nickname, age group and avatar. Select an explorer.
3. Open Game Collection, try Card Match and the other eleven games. The challenge's correct answer is reproducible using its stored PRNG seed.
4. Complete puzzles, open `Progress` and `Discovery Badges`, then force-close/reopen and check progress persists.
5. Enter the parent area using PIN. Explore profile management, play windows, limits, disabled games, language, audio, progress and data deletion. Also test wrong PIN, lockout and device-auth recovery where supported.
6. Test with Wi-Fi/mobile data off; play each game and verify no online dependence for puzzle logic and local sounds. System TTS narration may require a previously installed offline language voice.

### Safety limitations to understand

- This is a game-level foreground time limit, **not** an Android device-level lock or parental supervision tool. Clearing app storage, changing system clock, tampering with the OS or knowing the device unlock code can undermine local controls.
- No online accounts, ads, cloud sync or user-to-user communication are implemented. All progress is device-local; reinstalling or deleting app data loses it. Cloud device backup is disabled in app config; verify this in the final merged Android manifest.
- Success rates are game-specific practice summaries. They are **not IQ, diagnosis, or evidence of cognitive improvement**.
- Game data is procedural and solvable, but real-device accessibility, app lifecycle, touch hit boxes, TTS, sound playback and Android builds remain untested.

## Development notes

- The code uses basic OS emoji illustrations as game object tokens plus original bundled mascot and world artwork. Final studio-quality custom object illustrations are not complete.
- The source still requires native device integration, release hardening and manual QA. Do not publish without the final audit.
- Start with `docs/RELEASE_STATUS.md` to identify what is done versus not verified.

## Policies to consult before launch

- Google Play's child-directed Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play target API: https://support.google.com/googleplay/android-developer/answer/11926878
- New personal account testing: https://support.google.com/googleplay/android-developer/answer/14151465
- FTC COPPA FAQs: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- India DPDP Rules: https://upload.indiacode.nic.in/showfile?actid=AC_CEN_45_0_00003_2023-22_1763464807080&filename=dpdprules2025.pdf&type=rule

*This repository is a meaningful implementation, not a claim of complete commercial production readiness.*
