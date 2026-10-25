# Balloon Pop desktop

Electron launches the bundled game fullscreen. Version 0.3.0 includes 31 offline learning voice packs and unique illustrations for 68 achievements. The renderer uses an isolated preload bridge to read only known voice locales from local files. No browser speech voice or network TTS service is required.

Use Node.js 22+, then `npm ci` and `npm run prepare:web`. Use `npm start` for development. Build using `npm run build:windows`, `npm run build:linux` or `npm run build:mac` on the relevant platform. Linux's custom Flatpak export requires the Electron2 BaseApp and Freedesktop runtime 25.08. The Desktop release GitHub workflow builds Windows portable EXE, Linux AppImage/Flatpak and macOS Intel/Apple Silicon ZIPs.

Windows and macOS builds are unsigned; macOS builds are not notarized. Real-device listening and pronunciation review remain necessary. Offline byte loading, cue bounds and interruption are covered by the checks in tests/voices.cjs and tests/desktop-voices.cjs.

Set the actual Steam App ID in steam.json when assigned, create the 68 achievement API names listed there in Steamworks, publish them, then test with an entitled Steam account. Without an App ID, achievements work locally. Browser/PWA and Electron have separate local progress storage.
