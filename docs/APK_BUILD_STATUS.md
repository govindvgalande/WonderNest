# Android APK build status (2026-11-14)

**No APK is present.** The developer environment cannot access npmjs.org to fetch Expo/React Native dependencies and has no Android SDK/Gradle installation, so it cannot compile the provided source code into an Android package. This limitation was observed by running `npm ping` (DNS failure `EAI_AGAIN`) and looking for Android build tools. It is not valid to rename a ZIP file to APK.

An **unverified** GitHub Actions workflow has been added at `.github/workflows/build-test-apk.yml` to attempt an installable Android **debug** APK build after this entire source tree has been pushed to a GitHub repository. It is unverified because the environment could not fetch dependencies or run Gradle; dependency compatibility errors may need correction. The workflow has a manual `Run workflow` button and uploads the APK as a workflow artifact if compilation succeeds.

To use: create a GitHub repo, upload/push **the contents of this project** (including `.github/workflows/build-test-apk.yml`), open the repo's **Actions** tab, select **Build WonderNest Android test APK**, select **Run workflow**, and if the run succeeds, download its **WonderNest-Android-Test-APK** artifact and extract `app-debug.apk`. If the workflow fails, read its logs; fix the build before making any claims about a working APK. Don't use a debug APK for Play Store production.

Local core logic tests: 44 Node tests and 8 Python tests passed on 2026-11-14. No Android build or real-device tests have run.
