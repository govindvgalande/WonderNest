# WonderNest Privacy Policy — PRE-PUBLICATION DRAFT

**Status:** Draft describing the currently implemented source behavior. Requires final build verification, legal review, publication date, developer identity, public contact address and hosted URL before use in Google Play.

### About WonderNest

WonderNest is an educational memory and observation game designed for children aged 3–12. A parent configures the app on the family's Android device. The first release has no advertisements, in-app purchases, registration, online social features or third-party AI.

### Information stored locally

The app stores an optional child's nickname, selected age group, avatar, gameplay attempts, results, earned badges, local difficulty level, preferred language/settings and foreground use durations in a local SQLite database. A parent sets a PIN; a salted PIN verifier and lockout counters are stored via Android-backed Expo SecureStore. No child's full name, date of birth, phone number, email, photograph, microphone recording or precise location is requested.

### Collection, sharing and retention

The application's game code does not create an account, intentionally upload children's game records or integrate advertising/analytics SDKs. Records persist on the device until the parent deletes an individual child profile, erases all progress, clears app storage or uninstalls the app. Android backup is disabled in the app configuration; verify effective behavior in the signed Android release build.

### Device text-to-speech

When a parent enables spoken instructions, WonderNest may invoke the device's installed text-to-speech engine to read instruction text. Voice availability and any speech-engine networking are controlled by the installed device voice/OS vendor. Narration is optional and can be disabled. All sound-memory tones and background music are bundled audio files and require no internet connection.

### Rights and parent controls

A parent can view locally stored learning summaries, change age groups/time limits, disable activities, and delete one child profile or all local progress in the protected parent section. Deleted local game information is not recoverable within WonderNest. This local-only release has no server-side personal-information database to access or remove.

### Security

Profile data is stored locally in the app sandbox and subject to Android device security. The parent PIN is protected by device secure storage with retry throttling. Screen-time controls and PIN access are app-level controls and cannot prevent Android OS tampering or device-wide actions. The app is not a substitute for parental supervision.

### Contact and updates

**Publication blocker:** add a verified developer name, support email, public privacy policy URL and effective date before publishing. Reassess this policy whenever the app adds a new SDK, network feature, purchase or data-processing capability.

**Legal note:** This is not a determination of COPPA, GDPR or India DPDP legal compliance. Seek country-appropriate specialist advice and audit the final production build.
