# Balloon Pop verification — 24 October 2026

## Changes
- Dedicated ImageGen plain green Play balloon, replacing the smiling sprite behind the icon.
- A 260 ms squash-and-pop transition for Play and each game-mode button; rapid activation is locked until navigation completes. Gentle/reduced-motion settings use a short disappearance.
- One letter/number target at a time, preserved decorative balloons, immediate replacement with the next learning target.
- Learning targets render in front, with initial positions chosen to reduce overlap.
- Existing balloons respond immediately to size/speed changes.
- Independent sound/music muting; unavailable local storage no longer crashes a save.
- Explicit pointer capture/release for drag and multiple pointer IDs.
- Underlying controls become inert while the parent dialog is open.
- Large-screen mode artwork and spacing corrected; labels scale with balloon size.

## Browser checks (Chrome cloud browser)
- Observed new Play artwork, squash/pop intermediate state, and subsequent mode screen.
- Opened every mode, inspected six starting balloon labels, popped balloons, returned to mode menu.
- Switched to lowercase and verified a → b without clearing decorative balloons.
- Wrong parent answer kept the lock; correct answer opened settings.
- Toggled sounds, high contrast and gentle effects; moved size to 100 and speed to 0; verified retained values after reload. Restored default settings afterward.
- Mode-button bounds were inside viewport at 320×568, 568×320, 768×1024, 2560×1080 and 3840×2160. Large-screen spacing was refined after this inspection.
- Small-phone retest verified 1 → 2, then changed the embedded viewport to 568×320; six balloons and the current target 2 were preserved.

## Automated checks
Run `node --test tests/game.test.cjs` (14 tests).
The test harness runs actual game JavaScript with a minimal fake DOM, audio and speech adapters; it verifies logic, not rendered browser behavior or audible output.
- Every mode launches with valid target/decorative state.
- Counting wraps 20 → 1; uppercase/lowercase wrap Z/z → A/a.
- Decorative balloons persist during learning progress.
- Duplicate pops ignored and modal pauses physics/popping.
- Five simulated minutes stay within nine live balloons.
- Sound and music switches independently gate oscillator creation.
- Spanish color/shape prompts and muted speech behavior.
- Existing-balloon dimensions/speed respond to settings without sequence reset.
- Size bounds at eight viewport sizes from phones to 4K.
- Two pointer IDs pop independently; capture and cancellation cleanup.
- Drag input and canceled-pointer behavior.
- Selection transitions before navigation and repeated taps are locked.
- Blocked local storage is tolerated.
- Learning-target stacking above decorative balloons.

## Remaining verification limits
No physical multitouch device or iOS/Safari/Firefox testing. Speech dispatch and audio logic checked, but pronunciation, sound balance and device-specific vibration were not listened to or measured. Android animation/audio parity remains unverified. Browser speech depends on installed voices; phonics and original animal surprises are not implemented. Offline installation/caching is not implemented.

## Suggested next work
1. Consistent recorded learning voices (and real phonics), replacing reliance on browser speech.
2. Parent-selected baby/toddler presets for balloon density, size, speed and sensory effects.
3. Offline/PWA support and an installable home-screen experience.
4. Hold-to-exit home control to reduce accidental interruptions during play.
5. ImageGen animals and interactive sun/rainbow surprises to bring the experience closer to the supplied Android screenshots.

## Fullscreen and video-reference update
- Reviewed the full 136.8-second uploaded reference via 12-second overview samples and a 3fps gameplay sequence at 64–68 seconds. Observed steady rise/sway, moving clouds, day/night/rainbow scenery, and small colored pop fragments.
- Added gentle cloud drift, day/night opacity fades, sunshine during rainbow scenery and colored fragments. This is a closer approximation, not a verified frame-for-frame match.
- Attempt fullscreen on load; retry directly from Play/mode taps. Unsupported or denied calls never block play. Prefixed WebKit APIs are supported when present.
- Added fullscreen display metadata for supporting home-screen/installed launches. This does not add offline caching.
- Home has an Exit button and confirmation. Exit clears live balloons, stops game updates/music, cancels speech and leaves fullscreen. Browser tab stays available with Play again.
- Browser UI checks verified cancellation, Exit → See you soon → Play again. True fullscreen could not be observed in this cloud browser.
- Automated suite now has 17 passing tests, including fullscreen rejection fallback, Exit state/capture cleanup and canceling Exit.

## Navigation, language and public-access update
- Back arrow replaces Home; game → mode picker → home navigation checked in browser.
- Settings and Exit grouped top-right; Exit remains on home only.
- Language moved from the mode picker into the parent-protected settings dropdown; Spanish selection persisted after reload. Test browser restored to English afterward.
- Exit now requires a fresh parent-lock answer before exit confirmation. Browser verified wrong/correct answers and cancellation.
- Automated suite: 19 passing checks, including correct-parent-answer routing for Exit and two-level back navigation.
