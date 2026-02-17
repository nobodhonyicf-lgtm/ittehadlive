// Push notification service worker - handles background push notifications
// IMPORTANT: This file runs independently of the main app

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  console.log('[Push SW] Push event received');
  
  var data = { title: 'নতুন নোটিফিকেশন', body: '', icon: '/pwa-192x192.png', badge: '/pwa-192x192.png', data: { url: '/' } };
  
  try {
    if (event.data) {
      var parsed = event.data.json();
      data = Object.assign(data, parsed);
    }
  } catch (e) {
    console.log('[Push SW] Failed to parse JSON, using text');
    if (event.data) {
      data.body = event.data.text();
    }
  }

  var options = {
    body: data.body || 'নতুন আপডেট পাওয়া গেছে',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    image: data.image || undefined,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: '/' },
    dir: 'auto',
    lang: 'bn',
    tag: 'ittehad-push-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'দেখুন' },
    ],
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(function() {
        console.log('[Push SW] Notification shown successfully');
      })
      .catch(function(err) {
        console.error('[Push SW] Failed to show notification:', err);
      })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Push SW] Notification clicked');
  event.notification.close();
  
  var url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          return client.navigate(url).then(function(c) { return c.focus(); });
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[Push SW] Notification closed');
});
