// Circuit Bench service worker: offline app shell + cached Python runtime and fonts.
const SHELL = "bench-shell-v5";
const RUNTIME = "bench-runtime";
const SHELL_FILES = ["./", "./index.html", "./manifest.webmanifest", "./py-worker.js", "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (url.pathname.startsWith("/api/")) return; // sync always goes to the network
    const isPage = req.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith("/index.html");
    if (isPage) {
      // Network first so updates show up immediately; fall back to the cached copy offline.
      e.respondWith(
        fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(SHELL).then((c) => c.put("./index.html", copy));
            }
            return res;
          })
          .catch(() => caches.match("./index.html"))
      );
      return;
    }
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  // Pyodide (Python runtime) and Google Fonts: cache first, they are versioned/immutable.
  if (url.hostname === "cdn.jsdelivr.net" || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(RUNTIME).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((res) => {
          if (res.ok || res.type === "opaque") c.put(req, res.clone());
          return res;
        }))
      )
    );
  }
});
