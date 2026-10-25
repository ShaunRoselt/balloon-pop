# Bundled learning voices

31 local language packs contain 58 prompts each: A–Z, numbers 1–20, seven colors and five shapes. Clips are generated offline using eSpeak NG 1.51 at 130 words/minute, encoded as MP3 audio sprites with timing manifests. They are synthetic voices, not human recordings.

Run `python3 scripts/build-voices.py` with espeak-ng and ffmpeg installed to reproduce the files. Text inputs are in voice-input.json and voice-words.json. Native speakers should review pronunciation before a commercial learning release.

Chrome uses Web Audio to decode and play the same MP3 files as Electron. No installed speech synthesis voice or network TTS service is required. Electron includes the files through prepare:web and reads them through a locale-restricted preload bridge, avoiding file URL fetch restrictions. The service worker pre-caches all language packs on the initial online visit; offline web play requires that initial cache download to finish.

Audio is stopped on mute, language change, exit, hidden page and parent/achievement dialogs. A subsequent pop interrupts the prior prompt.

Generated speech uses eSpeak NG; source and license: https://github.com/espeak-ng/espeak-ng . No eSpeak executable or library is shipped in the application.
