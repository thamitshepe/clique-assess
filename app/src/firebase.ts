import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/messaging';

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
const auth = firebase.auth();
const firestore = firebase.firestore();

const setupNotifications = async (callback: (payload: any) => void) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await messaging.getToken({ vapidKey: 'YOUR_PUBLIC_VAPID_KEY' });
      console.log('FCM Token:', token);
    } else {
      console.log('Notification permission denied.');
    }

    messaging.onMessage((payload) => {
      console.log('Foreground Message:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};

export { messaging, setupNotifications, auth, firestore };
