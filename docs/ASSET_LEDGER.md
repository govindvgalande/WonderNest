# Asset provenance / licensing ledger

All files in `assets/art/`, `assets/sounds/`, `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png` and `assets/feature-graphic.png` were **generated in this environment using original code** (`tools/make_assets.py`) on 2026-11-14.

- Landscapes: original abstract shape illustrations (`forest`, `rainbow`, `treasure`, `castle`, `mountain`) drawn using Pillow.
- Fox character/icon: original geometric fox illustration drawn with Pillow. No downloaded art, brand, stock footage, fonts or watermarks.
- Sounds: WAV tracks (`bell`, `drum`, `flute`, `chime`, `harp`, `wood`, `success`, `music`) mathematically synthesized using standard Python waveforms.
- Core mini-game object illustrations: **operating system emoji glyphs**, supplied by the device's font; separate copyrighted emoji artwork may be subject to platform font license/appearance. They are not proprietary original illustrations. Replace with properly cleared original game-item vectors before calling the asset library production-complete.
- Typography: built-in platform system font; no third-party font files redistributed.
- Third-party code dependencies: declared in `package.json`, licenses and transitive dependencies **not fully audited** because no npm install completed. Review license inventory and native SDK data behavior before release.
