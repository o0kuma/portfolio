const CACHE_NAME = 'portfolio-v4'
const STATIC_ASSETS = [
  '/',
  '/site.webmanifest',
  '/arcade',
  '/arcade-manifest.json',
]

// A cache miss must still resolve to a real Response — respondWith() throws
// "Failed to convert value to 'Response'" if a fetch handler's promise ever
// resolves to undefined (e.g. caches.match() finding nothing), which used to
// take down the whole navigation request whenever the network fetch also
// failed. Every branch below now falls through to this instead of a bare
// caches.match().
function offlineFallback() {
  return new Response('Offline', { status: 503, statusText: 'Offline' })
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: 'Offline' }), {
        headers: { 'Content-Type': 'application/json' }
      }))
    )
    return
  }

  // 빌드 해시가 붙은 정적 청크(_next/static)는 불변이므로 캐시 우선 — 오프라인 재방문 시 게임이 즉시 로드됨
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request)
          .then((res) => {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            return res
          })
          .catch(() => caches.match(request).then((c) => c ?? offlineFallback()))
      })
    )
    return
  }

  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return res
        })
        .catch(() => offlineFallback())
      )
    )
    return
  }

  // Navigations (the page document itself) get a network-first strategy with
  // an actual offline page as the last resort, instead of an unhandled
  // cache-miss resolving to undefined.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached ?? caches.match('/').then((shell) => shell ?? offlineFallback()))
      )
    )
    return
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((cached) => cached ?? offlineFallback()))
  )
})

self.addEventListener('push', (event) => {
  let data = { title: '새 알림', body: '새로운 소식이 있습니다.', url: '/' }
  if (event.data) {
    try {
      data = { ...data, ...JSON.parse(event.data.text()) }
    } catch (_) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
