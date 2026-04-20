const firebaseConfig = {
  apiKey: "AIzaSyAxmARc4JdFUoiaFi9dXPoTlPm1AwmaptQ",
  authDomain: "nutricoach-f643f.firebaseapp.com",
  projectId: "nutricoach-f643f",
  storageBucket: "nutricoach-f643f.firebasestorage.app",
  messagingSenderId: "537446024751",
  appId: "1:537446024751:web:58ef218e8618c2f89b28da",
  measurementId: "G-7M5W82NEZE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
