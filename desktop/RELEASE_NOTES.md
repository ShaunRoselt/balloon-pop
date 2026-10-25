# Balloon Pop 0.4.0

Steam Deck compatibility preparation: controller navigation throughout the game, focus highlighting, settings and parent-lock controls, scrollable achievements, and pause on focus loss/suspend. Steam Deck detection and Electron Steam overlay initialization are wired up, and the build copies the Steam redistributable beside the executable. A native unpacked Linux archive is included for Steam depot preparation.

Includes all recent web fixes: unique achievement art, light controls, offline voices, parent-gated achievements, centered balloon symbols, complete cloud asset, unified balloon pop sound, two-press Back and slider descriptions.

Not Valve Verified. The actual Steam App ID, published official Gamepad configuration, Steam depot testing, physical Deck performance/input/suspend tests, and Valve review are still required. Steam APIs are inactive without the real App ID. See docs/STEAM_DECK.md.

Windows and macOS downloads are unsigned; macOS is not notarized.

Steam integration: API-based Cloud saves with local backups, per-account storage, monotonic per-device progress merging, saved settings, reconnect/resume reconciliation, Steam achievement recovery/retry, aggregate stats, rich presence, and Steam language default on first run. Cloud sync respects the player's account/app preferences. Steamworks configuration and live account testing are still required. Dynamic Cloud Sync while a running game is suspended is not advertised; quit and let Steam finish syncing before switching devices.
