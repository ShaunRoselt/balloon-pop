# Steam Deck launch readiness

Status: compatibility implementation in progress; NOT Valve Verified. No real Steam Deck, Steam App ID, Steamworks depot or entitled test account was available for this implementation.

## Valve requirements (checked 2026-10-25)

Primary sources:
- https://partner.steamgames.com/doc/steamhardware/compat
- https://partner.steamgames.com/doc/steamhardware/recommendations
- https://partner.steamgames.com/doc/features/steam_controller/steam_input_gamepad_emulation_bestpractices
- https://github.com/ceifa/steamworks.js

Required: all content available with the default physical-controller configuration; matching input prompts; controller-accessible text entry if needed; playable default performance (at least 30fps at 800p on Deck); supported resolution; readable text (character height at least 9px at 1280x800, Valve recommends 12px); seamless launch with no unsupported-device warning or inaccessible launcher. Native Linux is not mandatory: Windows/Proton is an alternative. Steam Input API and Steam achievements do not by themselves grant Verified status.

## Implemented

- Standard Gamepad API support, designed for Steam Input's Gamepad template, no configuration switch inside the game. D-pad/left stick navigates; bottom face button selects/pops; right face button backs out; Menu opens parent settings. Held navigation repeats, actions trigger on button edges. Touch/mouse remain available together with controllers.
- Spatial focus navigation and visible focus ring. Balloon selection follows an actual balloon as it moves; accepting uses the same pop function and sound. Menus, parent-lock keypad, toggles, ranges, locale selector, achievement filters/list, and exit are accessible. Use left/right on a range or language selector. Achievement rows can receive focus and scroll into view.
- Neutral physical-position input instructions, shown only after controller navigation; no keyboard glyphs advertised in gamepad mode.
- Fullscreen Electron launch directly into the game, responsive 1280x800/720 layout, offline packaged voices/assets, no login requirement or launcher.
- Electron Steam overlay hook configured before app readiness, Steam Deck detection through utils.isSteamRunningOnSteamDeck and restricted IPC. Native integration stays in the main process; renderer isolation remains enabled. The build afterPack hook copies the platform Steam redistributable beside the executable; the native addon and its adjacent libraries remain unpacked. Steam initialization accepts configured appId, STEAM_APP_ID or SteamAppId. Offline/non-Steam launch still works.
- Blur/suspend pause game physics, popping, sound and achievement playtime. Resume resets the frame clock; OS resume while unfocused stays paused.

## Steamworks setup still required

1. Assign the real App ID in desktop/steam.json; never ship Spacewar/480 as this game's ID. Publish the 68 achievement API names already listed there.
2. Upload a native Linux x64 unpacked Electron build as a Steam depot, or Windows x64 build for Proton. AppImage/Flatpak are external downloads, not the recommended Steam depot format. Preserve Linux executable permissions and Chromium sandbox files. Do not disable Chromium's sandbox to work around packaging problems.
3. Set the Steam launch option to the game's executable, with correct platform/depot restrictions. Do not add a launcher. Bundle steamworks.js's platform native module and the matching Steam redistributable library; inspect the packaged build and test initialization on Steam.
4. Publish an official Steam Input **Gamepad** template configuration for Deck and supported controllers, with ABXY/D-pad/stick/Menu passed as standard gamepad inputs (not a second parallel keyboard mapping). Test the default configuration from a clean install. This implementation uses gamepad emulation, not native Steam Input action sets.
5. Complete the Steam controller-support questionnaire accurately. Do not claim full support until the shipped Steam build passes the following tests.
6. Pass normal Steam build review, then request Steam Hardware Compatibility Review from the app's Technical Tools when available. Valve can review unreleased games. Final rating is Valve's decision; allow review time before release.

## Device acceptance tests — still pending

Use an actual LCD or OLED Deck in Gaming Mode, stable SteamOS, fresh settings, default official controller configuration. Record build SHA, SteamOS/Steam versions, FPS/frame times and result for each case.

- Cold launch at 1280x800 and 1280x720 with no mouse/keyboard attached. Verify no hidden setup/config prompts, clipping, unreadable characters or OS compatibility warnings.
- Controller-only: Play, all five modes, every balloon type; moving targets; repeated Back hint; child lock wrong/correct/close; all five switches; both slider endpoints; all 31 languages; all achievement filters and last row; exit cancel/confirm. No touchscreen dependence.
- Touch, trackpads, gamepad and external Xbox/PlayStation controllers; dock/undock; hotplug/disconnect/reconnect; remapped controls. Confirm actual default gamepad mapping is exposed by Electron.
- Overlay open/close, Steam and quick-access buttons, suspend/resume during each mode, audio focus, Bluetooth audio switching. Verify no stuck buttons, unexpected pop, accumulated playtime or giant simulation step.
- Offline launch and every language's sounds; restart preserves settings/progress. Steam achievements synchronize when Steam is available, and no network failure blocks play.
- 30-minute gameplay test and all dialogs at default settings: >=30fps at 800p, readable text measured on screen at 30cm, no memory growth/crash/audio degradation. Test frame limiters at 30/40/60 and OLED 90Hz.
- Validate native Linux Steam Runtime compatibility and Windows Proton separately if both are offered. Verify Steam overlay rendering and achievement notifications with the actual App ID.

No automated browser or mock test substitutes for these hardware/review checks.

## Steam Cloud and other Steam features (0.4.0)

Implemented RemoteStorage API-based saves, not Auto-Cloud. Main process keeps `saves/save-<SteamID64>.json` and a `.bak` in Electron userData; non-Steam uses `save-local.json`. Steam authenticates the Cloud account, while local files are separately keyed per Steam ID. Do not configure Auto-Cloud over Chromium's entire userData folder or these same files. A stable, unsynced device ID and per-device monotonic counters let divergent device saves merge without double counting; modes/achievement IDs are unioned. Settings use deterministic last-write-wins. Migrates v0.3 browser-local progress once without importing another account's profile. The renderer receives the restored snapshot before game initialization.

Cloud uses one fixed filename `balloon-pop-save-v1.json`, <=1MiB. Checks app and account Cloud preference without turning it on; local persistence always works. Writes local data atomically, retains a backup, flushes Cloud about every 15 seconds and on suspend/exit, merges before each Cloud write, reloads/reconciles on Steam reconnect and resume. Unknown/corrupt Cloud schemas are protected from overwrite. API success means accepted into Steam's local Cloud cache, not proof the server upload is complete. Steam synchronizes these files between sessions; let its sync complete before switching devices.

**Dynamic Cloud Sync is not enabled.** The current wrapper does not expose the required RemoteStorage local-file-change callbacks. Do not enable that option or claim seamless switching to a second device while the first running game is merely suspended. Normal Cloud transfer requires exit/sync. Implement/test the complete callbacks before enabling Dynamic Cloud Sync.

Also implemented:
- Recover unlocked achievement IDs from Steam and retry activation after reconnect/checkpoints.
- INT stats `total_pops`, `active_play_seconds`, `modes_tried`, updated from merged save totals.
- Rich Presence: menu/game-mode status, plus `steam_display` tokens in `desktop/rich-presence.vdf` for upload to Steamworks. No child name or personal data is sent.
- Steam-selected language becomes the initial learning language on first launch; saved choice takes priority. Supported Steam language codes map to our bundled voice packs.

Steamworks configuration: enable Cloud API storage, allocate at least 2MiB and 4 files per user (headroom above the current one-file 1MiB save); publish cross-platform support for Windows/Linux/macOS. Enable initially for developer accounts, test, then publish for players. Do not add Auto-Cloud roots for the same data or enable Dynamic Cloud Sync. Create/publish the three INT stats above, allow client writes and use appropriate monotonic constraints; publish all 68 achievement definitions. Upload rich-presence localization VDF and publish supported languages. Test with the real App ID and two entitled accounts/devices: new install restore, offline divergence and merge, disabled Cloud, low quota/write failure, corrupt/future schema protection, logout/account switch, and clean exit/sync. Verify Steam achievement/Cloud/stat callbacks and actual server results in Steamworks; mock tests cannot establish service success.

References:
- https://partner.steamgames.com/doc/features/cloud
- https://partner.steamgames.com/doc/features/achievements
- https://partner.steamgames.com/doc/features/enhancedrichpresence
