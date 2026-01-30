// Firebase Messaging Service Worker
// This runs in the background and handles push notifications

importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyBntKLPLykotYyCClwIddag0kaKcl9JRoE',
  authDomain: 'backend2interm.firebaseapp.com',
  projectId: 'backend2interm',
  storageBucket: 'backend2interm.firebasestorage.app',
  messagingSenderId: '400175456561',
  appId: '1:400175456561:web:38fed95e86ac4115ae1010',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'PomoStudio';
  const notificationOptions = {
    body: payload.notification?.body || 'Timer selesai!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'pomodoro-notification',
    requireInteraction: true,
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Focus or open the app
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('pomodorotimer') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/pomodorotimer');
        }
      }),
  );
});
