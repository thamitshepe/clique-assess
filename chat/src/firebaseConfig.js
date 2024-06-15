import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCKF64hElGvgvXbduTszpIA2jrtP1WxZzQ",
  authDomain: "cliquechatty.firebaseapp.com",
  projectId: "cliquechatty",
  storageBucket: "cliquechatty.appspot.com",
  messagingSenderId: "664082817407",
  appId: "1:664082817407:web:05e99e14fdd9cd92fb3a4a"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

export { auth, firestore, firebase };
