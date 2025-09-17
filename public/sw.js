self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  self.clients.claim()
})

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {}
    const title = data.title || 'Notification'
    const options = {
      body: data.body || '',
      icon: data.icon || '/logo.png',
      badge: data.badge || '/favicon.ico',
      data: { url: data.url || '/' },
      tag: data.tag || undefined,
      actions: data.actions || undefined,
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch (e) {
    event.waitUntil(self.registration.showNotification('Notification', { body: event.data && event.data.text() }))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(new URL(url, self.location.origin).pathname) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})


