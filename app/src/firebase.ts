import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCKF64hElGvgvXbduTszpIA2jrtP1WxZzQ",
  authDomain: "cliquechatty.firebaseapp.com",
  projectId: "cliquechatty",
  storageBucket: "cliquechatty.appspot.com",
  messagingSenderId: "664082817407",
  appId: "1:664082817407:web:05e99e14fdd9cd92fb3a4a"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);


export default firebaseApp.firestore();;