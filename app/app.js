(function () {
  const loc = document.getElementById("loc");
  const mode = document.getElementById("mode");
  const installBtn = document.getElementById("install");

  if (loc) loc.textContent = location.href;

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
