(function () {
  const loc = document.getElementById("loc");
  const mode = document.getElementById("mode");
  const installBtn = document.getElementById("install");

  if (loc) loc.textContent = location.href;

  // Opener status panel (works on every page, including WebAPK start URL).
  (function () {
    var hasOpener = (window.opener != null);
    var openerType = (window.opener === null ? "null" : typeof window.opener);
    var banner = document.getElementById("opener-banner");
    if (banner) {
      banner.className = hasOpener ? "bad" : "ok";
      banner.innerHTML =
        "hasOpener = " + hasOpener +
        "<span class='sub'>opener type: " + openerType +
        " &middot; window.name: " + (window.name ? window.name : "(empty)") + "</span>";
    }
    console.log("[OPENER-TEST]", JSON.stringify({
      url: location.href,
      hasOpener: (window.opener != null),
      openerType: (window.opener === null ? "null" : typeof window.opener),
      windowName: window.name
    }));
  })();

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (mode) {
    mode.textContent = standalone
      ? "standalone (installed WebAPK / PWA)"
      : "browser (Chrome tab)";
    mode.dataset.kind = standalone ? "app" : "tab";
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./" })
      .catch((err) => console.error("SW register failed", err));
  }

  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installBtn) installBtn.hidden = true;
  });
})();
