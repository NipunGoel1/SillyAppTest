import firebase from "firebase";
require("@firebase/firestore");
var firebaseConfig = {
  apiKey: "AIzaSyB3x6p09T4iJKSE6lUS5qsb1dyP9H7VBYc",
  authDomain: "silly-app-ddd17.firebaseapp.com",
  projectId: "silly-app-ddd17",
  storageBucket: "silly-app-ddd17.appspot.com",
  messagingSenderId: "594824551934",
  appId: "1:594824551934:web:b0974cb04826f9e67ff4af",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase.firestore();
