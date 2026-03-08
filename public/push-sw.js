// Push notification service worker - handles background push notifications
// This file is imported into the main workbox SW via importScripts
// It also works standalone if registered directly

// Only add install/activate if this is the main SW (not imported via importScripts)
if (typeof __WB_MANIFEST === 'undefined') {
  self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

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
    tag: data.tag || 'ittehad-push-' + Date.now(),
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
  
  var url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  // If an action button was clicked
  if (event.action === 'open') {
    // Use the URL from notification data
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Try to focus an existing window
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          return client.navigate(url).then(function(c) { return c.focus(); });
        }
      }
      // Open a new window if none exists
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[Push SW] Notification closed');
});

// Handle push subscription changes (e.g., browser refreshes the subscription)
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Push SW] Subscription changed');
  // The subscription has expired or been invalidated
  // The app will need to re-subscribe on next visit
});
