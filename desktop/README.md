# Balloon Pop desktop

Electron starter packages the exact web game offline with fullscreen launch, an isolated renderer, a narrow achievement IPC bridge and Steamworks in the main process.

Install Node.js 22+, then in this directory run `npm install` and `npm run prepare:web`. Run `npm start` for development. Build on Windows with `npm run build:windows`; build on Linux with `npm run build:linux`. Linux Flatpak builds require flatpak, flatpak-builder and matching Electron base/runtime/SDK from Flathub. Artifacts go to `release/`. Windows signing and release hosting are not yet configured. Do not publish unsigned builds as a signed release.

Set `steam.json` appId (or STEAM_APP_ID in development) when assigned. Create Steamworks achievement API names FIRST_POP, POP_100, POP_1000 and ALL_MODES, publish that configuration, include the platform Steam SDK redistributables as required by Steamworks.js, then test using Steam running under an entitled account. There is no placeholder App ID and no use of another game's App ID. Without configuration the game works offline and achievements remain local. Every launch retries all locally unlocked achievements through the allowlisted main-process bridge. Browser PWA progress and Electron progress use separate browser profiles.

Steam overlay and platform packaging require verification with the real App ID and redistributables. The bridge never exposes Node.js or arbitrary Steam methods to renderer code. Download page intentionally shows pending status until actual artifacts exist; upload releases and replace pending controls with their real versioned asset URLs.

## First downloadable release (0.1.0)
Windows distribution is a portable self-extracting EXE (the `portable` target), not an installed NSIS application. It is unsigned. Linux AppImage is produced by electron-builder. `bash build-flatpak.sh` exports the same packaged Linux app with the Electron2 BaseApp zypak wrapper and the supported Freedesktop 25.08 runtime; install that BaseApp first using Flatpak. The script disables only build-time icon validator sandboxing in this container; the installed game uses zypak and Flatpak sandboxing.

The public download page retrieves release parts and verifies each SHA-256 before offering the reconstructed original binary. The release manifest records full-file SHA-256 as well. Service worker caching excludes release downloads. Release binaries are initial builds: package structure and included web assets have been checked; Windows execution and installed Flatpak execution require testing on their target systems.
