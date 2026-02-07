
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBBX0byeEjiQ7HkhmPC2NETOA9Myr0HAKk",
  authDomain: "avocado2-680f4.firebaseapp.com",
  projectId: "avocado2-680f4",
  storageBucket: "avocado2-680f4.firebasestorage.app",
  messagingSenderId: "200751965321",
  appId: "1:200751965321:web:01b4e8d20626aacfb1d258",
  measurementId: "G-77N9J56DHE"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message: ', payload);
  const notificationTitle = payload.notification?.title || "Bito Nudge! 🥑";
  const notificationOptions = {
    body: payload.notification?.body || "Time to check your health goals.",
    icon: 'https://img.icons8.com/emoji/96/000000/avocado-emoji.png',
    badge: 'https://img.icons8.com/emoji/96/000000/avocado-emoji.png',
    tag: 'bito-reminder',
    renotify: true,
    data: {
      url: self.location.origin
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
