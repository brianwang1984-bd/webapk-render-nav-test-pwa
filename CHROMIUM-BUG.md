# Chromium bug (copy into issues.chromium.org)

File at:
https://issues.chromium.org/issues/new?component=1456221

**Component:** Mobile>Intents (`1456221`). Please also add Mobile>WebAPKs (`1456868`).

**OS:** Android (S+)

**Type:** Bug

## Title

Renderer-initiated navigations do not launch WebAPKs at App Links state 1024

## Description (paste below)

### Summary

- On Android S+, a renderer-initiated in-Chrome navigation (link click / `window.open`) to an in-scope HTTPS URL does not launch the installed WebAPK after GMS sets App Links state to `1024`.
- The same URL still launches the WebAPK for an incoming `ACTION_VIEW` / `BROWSABLE` intent via the sole-handler trampoline (`params.isFromIntent()`), added for https://crbug.com/40191153 (commit aff7fc1).
- Renderer navigations instead query with `MATCH_DEFAULT_ONLY`; AOSP hides a `1024` WebAPK, so Chrome stays in the tab.
- Chrome's `WebappRegistry` still has the install-time scope → package mapping, independent of GMS DAL state.
- The `1024` write is a GMS re-verification defect (no WebAPK trusted-cert phase); this bug is the remaining Chrome gap of 40191153.

### Steps to reproduce

1. Android S+, Chrome as the default browser. Repro PWA: https://brianwang1984-bytedance.github.io/webapk-render-nav-test-pwa/ (in-scope start URL: `…/app/`; debug WebAPK + adb helpers: https://github.com/brianwang1984-bytedance/webapk-render-nav-test-apk).
2. Open `…/app/` in Chrome and install the PWA. Confirm `adb shell pm list packages | grep webapk`.
3. From a Chrome tab, open the landing page and tap **Open in-scope PWA URL**. At state 1 the WebAPK launches (`display-mode: standalone`).
4. Force App Links state `1024` for that WebAPK + host `brianwang1984-bytedance.github.io` (helper in the APK repo; `pm set-app-links … 0` is equivalent for resolution). Keep "Open supported links" enabled.
5. Close the WebAPK. In a Chrome tab (not the installed app), open the landing page again and tap **Open in-scope PWA URL**.

### Expected

The installed WebAPK launches, same as at state 1 and same as an incoming VIEW intent to the start URL.

### Actual

Chrome stays on the in-scope URL in the tab (`display-mode: browser`). An incoming VIEW intent to the same URL still launches the WebAPK if it is the sole specialized handler.
