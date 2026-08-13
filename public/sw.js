// FarmHand Service Worker for Offline Launch & Asset Caching
const CACHE_NAME = "farmhand-v1"
const STATIC_ASSETS = [
  "/",
  "/favicon.svg",
  "/favicon_dark.svg",
  "/fullcolor_logo.svg",
  "/dark_logo.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  // Pass non-GET requests or Supabase API requests directly through
  if (event.request.method !== "GET" || event.request.url.includes("supabase.co")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset, fetch update in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse))
          }
        }).catch(() => {/* ignore background fetch errors */})

        return cachedResponse
      }

      return fetch(event.request).catch(() => {
        // Fallback to cached index for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/")
        }
        return new Response("Network offline", { status: 503, statusText: "Offline" })
      })
    })
  )
})
