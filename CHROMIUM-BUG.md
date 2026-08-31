# Chromium bug (copy into issues.chromium.org)

File at:
https://issues.chromium.org/issues/new?component=1456221

**Component:** Mobile>Intents (`1456221`). Please also add Mobile>WebAPKs (`1456868`).

**OS:** Android (S+)

**Type:** Bug

## Title

In-Chrome link clicks open as a regular tab instead of the installed WebAPK

## Description (paste below)

### Summary

- On Android S+, WebAPK URL handlers are not verified, so they cannot be default handlers for web intents; in-scope URLs then open as a regular Chrome tab instead of the installed WebAPK, even though Chrome knows it is installed (the app menu shows "Open …" rather than "Add to Home screen" / "Install").
- https://crbug.com/40191153 CL https://crrev.com/c/3110307 (M94) trampolines an incoming Intent to the WebAPK when Chrome is the one that received it.
- https://crbug.com/40191153 CL https://crrev.com/c/3696749 restored that incoming-intent path after an M97 regression by also considering non-default (unverified) WebAPK handlers.
- Renderer-initiated navigations (a link click or `window.open` inside a Chrome tab) still stay in the tab; that path was never covered.

### Steps to reproduce

1. Android S+, Chrome as the default browser. Repro PWA: https://brianwang1984-bytedance.github.io/webapk-render-nav-test-pwa/ (in-scope start URL: `…/app/`; debug WebAPK + adb helpers: https://github.com/brianwang1984-bytedance/webapk-render-nav-test-apk).
2. Open `…/app/` in Chrome and install the PWA. The Chrome menu should show "Open …" rather than "Install".
3. If the WebAPK is still a verified default handler, clear App Links verification for that package (helpers in the APK repo) so Android no longer treats it as a default handler.
4. Close the WebAPK. In a Chrome tab (not the installed app), open the landing page and tap **Open in-scope PWA URL**.

### Expected

The URL is passed to the installed WebAPK (standalone), same as an incoming `ACTION_VIEW` / `BROWSABLE` intent.

### Actual

The URL opens as a regular browser tab. Chrome's menu still shows "Open …" rather than "Install". An incoming VIEW intent to the same URL still launches the WebAPK.
