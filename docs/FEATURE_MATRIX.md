# Evidence-based feature matrix

Statuses: PASS = tested at the explicitly stated layer; NOT TESTED = source exists but appropriate verification not executed; BLOCKED = requires unavailable environment or account; NOT IMPLEMENTED = specifically missing; FAIL = executed test failed.

| Requirement | Status | Actual evidence / qualification |
|---|---|---|
| 12 puzzle generators (all ages) | PASS | 9,000 deterministic generated puzzles with valid/solvable assertions in `tests/core.test.ts` |
| Matching logic and pair validation | PASS | `isMatchingCardPair`, `evaluateCardSolution` and tests |
| Object, pattern, missing, route, sound, observation, story, shape, order, maze, explorer answer validation | PASS | `generate.ts` evaluator + generated-answer tests |
| All 12 interactive Android game screens | NOT TESTED | JSX UI route code implemented; no native runtime |
| Age-bounded difficulty engine | PASS | deterministic adaptive rule and bounds tests |
| Age-dependent UI layout and accessibility | NOT TESTED | JSX includes large controls/TalkBack labels; no device validation |
| Seeded challenge reproduction | PASS | generator property tests |
| SQLite database DDL and v1→v2 migration | PASS | real Python SQLite schema tests; not Android implementation |
| Device persistent profile/progress/rewards | NOT TESTED | data access layer and SQL implemented; no Android app restart test |
| Local PIN logic, lockout, recovery | PASS | MOCKED SecureStore/OS auth contract unit test; **not device verification** |
| Native SecureStore PIN protection | NOT TESTED | requires Android device credential testing |
| Parent dashboards, input controls and deletions | NOT TESTED | source implemented, device/UI flows not executed |
| Day/session/family screen-time business rules | PASS | deterministic policy tests; actual app lifecycle unverified |
| Break reminder | NOT TESTED | configurable 5–60 minute in-app interval implemented; visual UI not verified on device |
| Background / force-stop time preservation | NOT TESTED | foreground heartbeat and persistent DB code written; not tested on Android |
| Pause/resume and allowed hours | PASS | time-interval policy tests; UI not verified |
| Rewards duplicate prevention | PASS | rewards function and unique SQLite key tests |
| English, Hindi, Marathi text completeness | PASS | matching localization keys and object translation coverage tests; linguistic QA outstanding |
| Narration in all three languages offline | NOT IMPLEMENTED | optional OS TTS, depends on preinstalled voice; no guaranteed bundled narrations |
| Sound memory WAV notes & original music assets | PASS | eight generated audio files present and validated as WAV; playback not device-tested |
| Sound effects & music playback | NOT TESTED | code exists, Android audio engine not run |
| Premium production-ready all-original artwork | NOT IMPLEMENTED | original worlds/mascot exist, but puzzle items currently emoji glyphs |
| App UI, animations and screen navigation | NOT TESTED | implementation exists, no native build or UI automation |
| Functional offline puzzles | PASS | no-network pure logic tests; full Android offline mode unverified |
| Google Play Families/privacy compliance | BLOCKED | code is minimized, but release package and legal review not completed |
| Android 16 API 36 configuration | PASS | `app.json` contains targetSdkVersion 36, `allowBackup=false`, microphone blocked; actual merged manifest unverified |
| APK | BLOCKED | no npm registry/Android build credentials/tools |
| Signed AAB | BLOCKED | EAS, signing and credentials required |
| Play listing descriptions and original feature graphic | PASS | draft English/Hindi/Marathi listings, original 1024×500 graphic; not approved/published |
| Genuine Play Store screenshots | NOT IMPLEMENTED | cannot capture without running native app |
| Publicly hosted privacy policy/contact | BLOCKED | no hosting URL/contact supplied |
| Closed testing and publishing | BLOCKED | requires developer Play Console and testers |
