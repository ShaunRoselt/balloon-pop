# Balloon Pop desktop

The Electron edition bundles the web game for offline play and launches fullscreen. It uses an isolated renderer and a narrow IPC bridge for achievements and parent-gated quit.

Use Node.js 22+, then `npm ci` and `npm run prepare:web`. Run `npm start` for development. On Windows run `npm run build:windows`; on macOS run `npm run build:mac` for Intel and Apple Silicon ZIPs. On Linux run `npx electron-builder --linux AppImage --x64`, then `bash build-flatpak.sh` after installing the Electron2 BaseApp and Freedesktop 25.08 runtime from Flathub. The GitHub Desktop release workflow performs these builds and publishes them to this repository's Releases.

Windows is a portable EXE. Windows and macOS builds are unsigned; macOS builds are not notarized. Target-system playtesting is still needed; successful packaging is not a complete operating-system compatibility test.

Steam: set the real `appId` in `steam.json` or STEAM_APP_ID for development. Create and publish all 68 achievement API names listed in that file in Steamworks. Export their color and locked images with `python3 scripts/export-steam-icons.py` from the repository root. Test with Steam running under an entitled account. The app retries locally unlocked achievements at launch and on new unlocks. No placeholder App ID is used. Browser/PWA and Electron progress use separate storage profiles.

Steam overlay and entitlement behavior require verification once the actual App ID is assigned. The renderer has no general Node.js or Steam access. Flatpak uses zypak and normal application sandboxing; the export script disables only the build-time icon-validator sandbox.
