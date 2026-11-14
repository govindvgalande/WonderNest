# Beginner-friendly Android build and Google Play publishing guide

**Read first:** This source archive does **not** contain an APK or AAB. It has not been compiled into an Android app, exercised on real phones, signed, or approved by Google. Do not upload an untested build to production.

## A. Build and install your first test APK

1. Use a Windows, macOS, or Linux computer with Node.js 22.13+ and internet. Extract `WonderNest_Source.zip` and open a terminal in the `WonderNest` directory.
2. Type `npm install` and then `npx expo install --fix`. This resolves dependencies. The project creator could not complete this step because access to `registry.npmjs.org` failed; **expect possible package-version corrections**.
3. Type `npm run check`, `npm run test:core`, `npx expo-doctor` and `npx expo export`. All need to pass. The core tests are not a substitute for Android UI/integration tests.
4. If Expo requires a project ID or version migration, run `npx eas build:configure` and follow Expo's current instructions. Avoid committing private Expo tokens and signing keys.
5. Install EAS CLI with `npm install -g eas-cli` and log in with `eas login`; create a free Expo account if needed. Build the internal test APK: `npm run build:android:preview`.
6. Download the APK from the EAS build link on your computer or phone. On Android, allow installation from the trusted application used to open it, install, then disable the permission if desired.
7. Test with airplane mode enabled: all twelve games, age groups, profile persistence, parental PIN and lockout, daily/family/session limits, allowed play hours, break reminders, deletions, English/Hindi/Marathi, accessibility and Android back navigation.
8. Test a second Android device, preferably a tablet or smaller/lower-end smartphone. Log issues using `docs/QA_PLAYBOOK.md`, fix them, and build again.

If the above commands fail, **fix the failures; don't bypass them**. More detailed developer commands are in `README.md`.

## B. Create the release-ready AAB

1. Complete the actual-device QA, privacy audit, permissions inspection, asset review and naming clearance described in `docs/RELEASE_STATUS.md`.
2. Select an original, cleared name and change Expo `name`, `slug`, Android `package`, app icon and Play Store text together, if needed. Android package IDs cannot be casually changed after launch.
3. Run `npm run build:android:production`. EAS needs internet, an Expo identity, and app signing configuration. Use Google Play App Signing or an eligible signing setup; protect the upload key and backup/recovery information.
4. Confirm the **downloaded signed AAB actually exists**. Inspect the merged Android manifest with Android tooling to confirm `targetSdkVersion>=36`, no mic/camera/location/ad ID permissions, and backup policy. In November 2026, Google Play requires API 36+ for new ordinary mobile apps; check again at submission: https://support.google.com/googleplay/android-developer/answer/11926878
5. Keep the release AAB and build logs as evidence. A configured EAS build file is **not** a completed signed AAB.

## C. Google Play Console setup and submission

1. Visit https://play.google.com/console and sign in to your own Google account. Register a Play developer account and pay any applicable registration fees. Complete Google's required individual/organization and identity verification. Keep access credentials private.
2. Click **Create app** and select the correct default language, app name, **Game**, free/paid classification and applicable declarations. Choose child-directed target ages consistently with the real application (3–5, 6–8 and 9–12); follow the currently displayed Families Policy questions carefully.
3. Open the Store listing area. Use the proposed English, Hindi and Marathi copy in `docs/STORE_LISTING.md` **only after proofreading**. Upload original app icon, `assets/feature-graphic.png`, and **genuine screenshots from the working Android build**; generated mock screens must not be passed off as genuine gameplay.
4. Publish a truthful privacy policy to an accessible public URL **before** submission, including appropriate parent contact details and disclosures consistent with the actual built SDKs, logging and permissions. `docs/PRIVACY_POLICY_DRAFT.md` is a draft that requires review, not a published URL.
5. Complete **Data safety** accurately by auditing the actual release binaries and network traffic. “Offline” by design does not automatically mean zero data collection, particularly if your build/debug/analytics SDKs send information. Do not submit inaccurate declarations.
6. Complete **Target audience**, child-directed-app declarations, ads disclosure (designed with no ad SDKs), **Content rating** questionnaire, app access, privacy links and any additional child-safety reviews Play Console currently requests.
7. Upload the AAB to an **internal test** or **closed testing** track. Install the Google-distributed build and retest on devices with Play services and in offline mode.
8. **If your personal developer account is subject to Google's new-account production-access policy**, organize at least **12 opted-in testers for 14 continuous days** on an eligible closed test; verify current requirements in the console. This may apply to personal accounts created after November 13, 2023. Policy guide: https://support.google.com/googleplay/android-developer/answer/14151465
9. Respond truthfully to Google's production-access questions, apply when eligible, and resolve rejections or required corrections. Google may impose additional checks for kids' apps.
10. Before production, conduct final QA on the exact production-signed package, assess trademark conflict and legal requirements for your intended distribution countries, and obtain the final app privacy/support infrastructure.
11. Submit for review; wait for **actual Google approval**. Publish only after the console authorizes release. The developer must handle the Play account, payments, signing authorization, closed testers, and final submission.
12. After release, monitor child-safety complaints, crashes, support queries, policy notices, and native SDK updates without adding tracking or advertising SDKs by accident.

## D. Policy and safety notes

- Google Play Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335
- Children's Online Privacy Protection Act (COPPA): https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- GDPR children's consent and national age thresholds need jurisdiction-sensitive legal assessment; don't assume one global age rule.
- India's Digital Personal Data Protection Act/rules have staged implementation; review the latest operational requirements prior to publication.
- The working title **WonderNest** requires brand/trademark and Play Store name clearance; an online name search is not legal clearance.

## E. What only the parent/developer can do

Provide a Play developer account, any government/business verification, final support address, public policy URL, trusted Android test devices, beta testers, signing approval and final publication decision. Everything else must be validated technically before public release; none of these external steps has been completed in this handoff.
