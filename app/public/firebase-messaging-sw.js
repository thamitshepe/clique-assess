// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCKF64hElGvgvXbduTszpIA2jrtP1WxZzQ",
    authDomain: "cliquechatty.firebaseapp.com",
    projectId: "cliquechatty",
    storageBucket: "cliquechatty.appspot.com",
    messagingSenderId: "664082817407",
    appId: "1:664082817407:web:05e99e14fdd9cd92fb3a4a"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Customize background notification handling here
messaging.onBackgroundMessage((payload) => {
  console.log('Background Message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
