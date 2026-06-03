import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9Jf7XPwNCMYjkoB1y9ErEOB5L_nrUeMw",
  authDomain: "gonkrewards.firebaseapp.com",
  databaseURL: "https://gonkrewards-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gonkrewards",
  storageBucket: "gonkrewards.firebasestorage.app",
  messagingSenderId: "343996694022",
  appId: "1:343996694022:web:194e6334e335e5cea00d87",
  measurementId: "G-PHJQTF4QGG"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    const email = user.email;
    const uid = user.uid;
    console.log(user.email);
    document.getElementById("welcome").innerHTML = ("Welcome, " + email);
    document.getElementById("entid").innerHTML = ("Enterprise ID: " + uid);
  } else {
    // User is signed out
    console.warn("No user is signed in.");
  }
});
