# WebAPK renderer-navigation test PWA

Public repro site for a Chromium Android bug: **in-Chrome (renderer-initiated)
navigations do not launch an installed WebAPK when Android App Links domain
verification is state `1024`.**

Live site (GitHub Pages):
https://brianwang1984-bd.github.io/webapk-render-nav-test-pwa/

Testers: open the PWA
(https://brianwang1984-bd.github.io/webapk-render-nav-test-pwa/app/)
in **Play Chrome** and install it from Chrome's menu. Chrome mints the WebAPK.
Then open the out-of-scope test start page
(https://brianwang1984-bd.github.io/webapk-render-nav-test-pwa/)
in a Chrome tab and tap the link. After the WebAPK is installed, sometimes
the domain verification status becomes non-verified.

Copy-paste Chromium bug text: [CHROMIUM-BUG.md](./CHROMIUM-BUG.md)

## Layout

| URL | Role |
| --- | --- |
| `/webapk-render-nav-test-pwa/` | Out of PWA scope. Contains the renderer-initiated `<a href>` into the PWA. |
| `/webapk-render-nav-test-pwa/app/` | Installable PWA. Manifest `scope` / `start_url` are this path. |

The split matters. A tap from the landing page to `/app/` is a **same-host
navigation with a new specialized handler** (the WebAPK's `pathPrefix`). That
is the path Chrome takes for renderer-initiated WebAPK launch at state `1`,
and the path that fails at state `1024`.

## Enable GitHub Pages

Repo Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
The site is then served at the URL above. A `.nojekyll` file is included so
GitHub Pages does not run Jekyll on the static files.
