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

On Android S+, Chrome launches an installed WebAPK for **incoming Android VIEW intents** even when GMS has set the WebAPK's Digital Asset Links / App Links state to `1024` (unverified). That recovery is the sole-handler trampoline added for https://crbug.com/40191153, and it is gated on `params.isFromIntent()`.

The same in-scope HTTPS URL **does not** launch the WebAPK when the navigation is **renderer-initiated** (a link click or `window.open` inside a Chrome tab). `ExternalNavigationHandler` resolves specialized handlers with `MATCH_DEFAULT_ONLY`. Android hides a `1024` WebAPK from that query, Chrome sees no specialized handler, and the URL stays in the tab.

This is the remaining Chrome-side gap of crbug/40191153. The `1024` write itself is a GMS re-verification defect (the recurring task does not run the WebAPK trusted-cert phase). Chrome cannot repair GMS, but it already knows which WebAPKs it installed (`WebappRegistry`) and already has a signer check (`isValidWebApk`).

### Repro site and test APK

- PWA: https://brianwang1984-bytedance.github.io/webapk-render-nav-test-pwa/
- In-scope start URL: https://brianwang1984-bytedance.github.io/webapk-render-nav-test-pwa/app/
- Debug WebAPK + adb helpers: https://github.com/brianwang1984-bytedance/webapk-render-nav-test-apk

The landing page is **out of** the PWA scope. Tapping **Open in-scope PWA URL** is a same-host renderer-initiated navigation that introduces a new specialized handler (the WebAPK). That is the state-1 launch path, and the state-1024 failure path.

### Steps to reproduce (Play Chrome, minted WebAPK)

1. Android S+ device, Chrome as the default browser.
2. Open https://brianwang1984-bytedance.github.io/webapk-render-nav-test-pwa/app/ in Chrome and install the PWA (Install app / Add to Home screen). Confirm a `org.chromium.webapk.*` package appears in `adb shell pm list packages | grep webapk`.
3. Confirm **state 1** first: from a Chrome tab open the [landing page](https://brianwang1984-bytedance.github.io/webapk-render-nav-test-pwa/) and tap **Open in-scope PWA URL**. The WebAPK should launch (`display-mode: standalone`).
4. Force App Links state `1024` for that WebAPK + host `brianwang1984-bytedance.github.io` (helper in the APK repo; `pm set-app-links … 0` is an equivalent "none" state for resolution). Keep "Open supported links" enabled.
5. Close the WebAPK. In a **Chrome tab** (not the installed app), open the landing page again and tap **Open in-scope PWA URL**.

### Expected

The installed WebAPK launches, same as at state 1 and same as an incoming `ACTION_VIEW` / `BROWSABLE` intent to the start URL.

### Actual

Chrome stays on the in-scope URL in the tab. `display-mode` is `browser`. An incoming VIEW intent to the same URL still launches the WebAPK if it is the sole specialized handler (40191153 trampoline).

### Chrome-side cause

In `ExternalNavigationHandler.shouldOverrideUrlLoadingInternal()`:

- Incoming intents can use `intentMatchesNonDefaultWebApk()` / the sole-handler trampoline (`params.isFromIntent()`).
- Renderer navigations do not set that bit. They use a `MATCH_DEFAULT_ONLY` query. AOSP `DomainVerificationService` filters out state `1024`, so the WebAPK is invisible.
- Chrome's `WebappRegistry` still has the scope → package mapping from install time. That mapping is independent of GMS DAL state.

### Suggested fix (CL)

Do not launch from the registry alone (that over-supports in-tab same-host clicks that state 1 would keep in Chrome).

After the existing navigation-chain safety gates, **merge Chrome-owned, signer-validated, in-scope WebAPKs into the default-only resolver list** when the user has not turned off "Open supported links", then reuse the existing same-host / keep-in-app / already-in-WebAPK / sole-handler gates. Feature-flag as `WebApkSelfOwnedRendererNavLaunch`.

A website never supplies a package name. Chrome only considers packages it minted and recorded.

### Related

- https://crbug.com/40191153 — S+ WebAPKs are unverified; incoming-intent trampoline
- Commit aff7fc1 ("Work around S+ WebApks being unverified")
