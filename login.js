import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
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

document.getElementById("signup").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("GOnk")
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, document.getElementById("username").value, document.getElementById("password").value).then((userCredential) => {
      console.log("GGGONNK")
      localStorage.setItem('username', userCredential.user);
      const user = userCredential.user;
      window.open('./enterprise.html', '_self')
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode);
      console.error(errorMessage);
      // ..
    });
});

document.getElementById("signin").addEventListener("click", (e) => {
  e.preventDefault();
  const auth = getAuth();
  signInWithEmailAndPassword(auth, document.getElementById("username").value, document.getElementById("password").value).then((userCredential) => {  
      localStorage.setItem('username', userCredential.user);
      const user = userCredential.user;
      window.open('./enterprise.html', '_self')
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode);
      console.error(errorMessage);
    });
});