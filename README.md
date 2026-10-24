# Balloon Pop

A touch friendly balloon game for young children. Five modes, 68 achievements and multilingual learning voices.

[Play](https://balloon-pop-play.shaunroselt.chatgpt.site/) · [Downloads](https://balloon-pop-play.shaunroselt.chatgpt.site/download/) · [Releases](https://github.com/ShaunRoselt/balloon-pop/releases)

Serve `dist/` using a static web server. Run `node tests/achievements.cjs` to check achievement tracking.

Desktop: `cd desktop`, `npm ci`, `npm run prepare:web`, then `npm run build:windows`, `npm run build:linux` or `npm run build:mac` on the relevant platform. GitHub Actions builds Windows, Linux and macOS releases. Builds are currently unsigned.

Steam: configure `desktop/steam.json` with the real App ID and create the achievement API names listed there in Steamworks. Images are exported using `python3 scripts/export-steam-icons.py`. Desktop Steam integration remains optional when the client or App ID is unavailable.

ImageGen artwork is included. Source code is MIT licensed.
