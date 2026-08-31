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

1. Android S+, Chrome as the default browser.
2. Open the PWA in Chrome: https://brianwang1984-bd.github.io/webapk-render-nav-test-pwa/app/ and install it as a WebAPK from the Chrome menu (**Install** / **Add to Home screen**). After install, the Chrome menu should show "Open …" rather than "Install".
3. After the WebAPK is installed, sometimes the domain verification status becomes non-verified. Check with:
   `adb shell pm list packages | grep webapk`
   then `adb shell pm get-app-links --user 0 <pkg>`
   Under `Domain verification state`, the host is `verified` or not. Continue when it is not `verified`.
4. Close the WebAPK. In a Chrome tab (not the installed app), open the out-of-scope test start page https://brianwang1984-bd.github.io/webapk-render-nav-test-pwa/ and tap **Open in-scope PWA URL**. That page is outside the PWA scope; the tap is a renderer-initiated navigation into the installed PWA.

### Expected

The URL is passed to the installed WebAPK (standalone), same as an incoming `ACTION_VIEW` / `BROWSABLE` intent.

### Actual

The URL opens as a regular browser tab. Chrome's menu still shows "Open …" rather than "Install". An incoming VIEW intent to the same URL still launches the WebAPK.
