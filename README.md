# Thumb Keyboard Lab v0.5 — flick keyboard PWA

A two-thumb keyboard experiment for Finnish and English. Text is entered literally: no dictionary, autocorrection, predictions or spelling restrictions. Repeated characters and unusual words work normally. This is a standalone typing app, not an iOS system keyboard. Text is kept in memory and is lost on reload; settings are saved locally when browser storage is available. No text is sent to a server.

## Typing and settings

Open **Asetukset · Settings** to choose:

- **2×3 Flick** (default): two independent 2-column × 3-row keypads, six keys per thumb.
- **2×2 Flick**: two independent 2-column × 2-row keypads, four keys per thumb.
- **Two-thumb chords**: the original six-key-per-thumb comparison layout. Press opposite sides with overlapping contacts inside the adjustable chord window. Its former dedicated space key now types **ä**.

In flick modes, tap the centre or flick **up, down, left or right**, then release. One completed contact enters exactly one character; a flick never also enters the tap character. Cancelled contacts enter nothing. The dominant axis determines diagonal flicks (horizontal wins a tie); release position determines the direction. Flick distance is adjustable from 12–60 CSS pixels. Both thumbs operate independently, even when touching at the same time. There is no timing requirement in flick modes.

Every key displays its centre and four directional characters. Common Finnish/English letters are on taps; other letters, Finnish **ä ö å**, punctuation and symbols use flicks. These are experimental frequency-informed starting points, not measured optimal layouts. The smaller layout fits all Finnish/English letters but sacrifices dedicated digit slots; remap slots if you need digits, or use 2×3/chord mode.

Settings contain a per-key character table in **Tap / ↑ / ↓ / ← / →** order, numbered left-to-right and top-to-bottom for each thumb. Edit one character per cell; **␣** means space and **↵** means newline. At least one swipe must remain mapped to space. Edits apply on leaving the field. Invalid edits are rejected. **Reset this layout** restores only the selected flick layout. Mode, maps, flick distance and chord window survive reloads on the same origin. If storage is unavailable they remain usable for the current session.

Both default flick layouts have a tappable **VÄLI** (space) key at the bottom right of the right keypad. Flicking right on it also enters space; flick left for newline. The 2×3 layout retains **h** on an upward flick of the right keypad’s third key. Unneeded accented letters have been replaced with currency signs, parentheses and other useful symbols. Existing saved defaults are upgraded automatically while custom mappings are preserved. In chord mode, any right-thumb key flicked right inserts space. Chord swipes remain:

| Thumb | ←      | →     | ↑   | ↓       |
| ----- | ------ | ----- | --- | ------- |
| Left  | Delete | `,`   | `?` | `!`     |
| Right | `.`    | Space | `-` | Newline |

**Aa / ISOT** toggles case, **Tyhjennä** clears text/statistics, and **⌫ Poista** deletes one Unicode code point. Statistics and the chord map live in settings, leaving the output above the bottom keypads. Switching layouts cancels unfinished touches and preserves entered text. On desktop, mouse drag supports flicks; `1–6` and `Q W E R T Y` trigger left/right taps (only the first four keys in 2×2). Overlap those keys for chords. Backspace deletes and Escape clears when focus is outside settings/controls.

## Local development and tests

No application dependencies or build step are required. With Python 3:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the local server in your browser. Windows users may also use `start_windows.bat`. For phone testing across a LAN, bind to `0.0.0.0` instead. LAN HTTP supports typing but does **not** enable iPhone service workers; use HTTPS for installation/offline use.

Browser regression tests require Node.js, Python 3 and Chromium:

```sh
npm ci
npm test
# If Chromium is elsewhere:
CHROMIUM_PATH=/path/to/chromium npm test
# Optional Safari-engine coverage, after installing Playwright WebKit/dependencies:
npx playwright install webkit
TEST_BROWSER=webkit npm test
```

Tests exercise all five inputs on every flick key in both modes, independent overlapping contacts, cancellation, mode changes during gestures, repeated characters, mapping edits/persistence/reset, text controls, chord input, mobile viewport bounds, asset responses and offline reload/typing. Chromium also receives a native touch stream to test pointer capture. WebKit automation is useful coverage but does not replace real iPhone Safari testing.

## Install and use offline

Deploy all root application files plus `icons/` together over HTTPS, for example GitHub Pages from `main` / root. On iPhone Safari, load the HTTPS site online, open settings and wait for **Offline-tila: sovelluksen tiedostot tallennettu**. Then use Share → Add to Home Screen → Open as Web App. Open it once from the home screen, then test in airplane mode.

The service worker caches the page, manifest and icons. Online requests prefer fresh network content; offline requests use cached copies. v0.5 includes the previously missing 192px, 512px and Apple touch icons and a new cache version. After changing cached assets, update `CACHE_NAME` in `sw.js`. Old app caches are removed on activation. Installation requires HTTPS or localhost. iOS may evict offline storage, and home-screen installation cannot guarantee permanent offline availability.
