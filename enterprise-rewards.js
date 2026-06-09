import { getDatabase, ref, set, update, child, get, increment } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
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
const dbRef = ref(getDatabase());

var uid = 0


onAuthStateChanged(auth, async (user) => {
  if (user) {
    uid = user.uid;
    
    for (let i = 0; i < 6; i++) {
      await addNewItem(i);
    }

    for (let i = 0; i < 6; i++) {
      addNewPurchase(i);
    }

    document.getElementById("submitPoints").addEventListener("click", async (e) => {
      console.log("Item logged");
  
      const customerId = document.getElementById("customerUID").value;
      const productVal = document.getElementById("productClaimed").value;
  
      const pointsAmount = await getData("users/" + uid + "/purchase" + productVal + "/cost");
  
      await givePoints(customerId, pointsAmount);
    });
    
  } else {
    console.warn("No user is signed in.");
  }
});

async function givePoints(customer, amount) {
  const db = getDatabase();
  
  const numericAmount = Number(amount); 
  return update(ref(db, `users/${uid}/customers/${customer}`), { 
    points: increment(numericAmount) 
  });
}

async function getData(location){
  try {
    const snapshot = await get(child(dbRef, location));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return "";
    }
  } catch (error) {
    console.error(error);
    return "";
  }
}

function writeRewardName(userId, rewardId, name) {
  if (!userId) return console.error("Cannot write data: User not logged in.");
  const db = getDatabase();
  update(ref(db, `users/${userId}/product${rewardId}`), { product: name });
}

function writeRewardDesc(userId, rewardId, desc) {
  if (!userId) return console.error("Cannot write data: User not logged in.");
  const db = getDatabase();
  update(ref(db, `users/${userId}/product${rewardId}`), { description: desc });
}

function writeRewardCost(userId, rewardId, cost) {
  if (!userId) return console.error("Cannot write data: User not logged in.");
  const db = getDatabase();
  update(ref(db, `users/${userId}/product${rewardId}`), { cost: cost });
}

function rwriteRewardName(userId, rewardId, name) {
  if (!userId) return console.error("Cannot write data: User not logged in.");
  const db = getDatabase();
  update(ref(db, `users/${userId}/purchase${rewardId}`), { product: name });
}

function rwriteRewardDesc(userId, rewardId, desc) {
  if (!userId) return console.error("Cannot write data: User not logged in.");
  const db = getDatabase();
  update(ref(db, `users/${userId}/purchase${rewardId}`), { description: desc });
}

function rwriteRewardCost(userId, rewardId, cost) {
  if (!userId) return console.error("Cannot write data: User not logged in.");
  const db = getDatabase();
  update(ref(db, `users/${userId}/purchase${rewardId}`), { cost: cost });
}


async function addNewItem(ItemID) {
  const container = document.getElementById("rewardCont");
  
  const nameVal = await getData("users/" + uid + "/product" + ItemID + "/product");
  const descVal = await getData("users/" + uid + "/product" + ItemID + "/description");
  const costVal = await getData("users/" + uid + "/product" + ItemID + "/cost");
  
  const htmlTemplate = `
    <div class="row-wrapper">
      <div class="rewleftcon"><input type="text" class="managething" value="${nameVal}" id="name${ItemID}"></div>
      <div class="rewmidcon"><input type="text" class="managething" value="${descVal}" id="desc${ItemID}"></div>
      <div class="rewrightcon"><input type="number" class="managething" value="${costVal}" id="cost${ItemID}"></div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', htmlTemplate);
  
  document.getElementById("name" + ItemID).addEventListener("change", (e) => {
    writeRewardName(uid, ItemID, e.target.value);
  });
  document.getElementById("desc" + ItemID).addEventListener("change", (e) => {
    writeRewardDesc(uid, ItemID, e.target.value);
  });
  document.getElementById("cost" + ItemID).addEventListener("change", (e) => {
    writeRewardCost(uid, ItemID, e.target.value);
  });
}

async function addNewPurchase(ItemID) {
  const container = document.getElementById("purchaseCont");
  
  const nameVal = await getData("users/" + uid + "/purchase" + ItemID + "/product");
  const descVal = await getData("users/" + uid + "/purchase" + ItemID + "/description");
  const costVal = await getData("users/" + uid + "/purchase" + ItemID + "/cost");
  
  const htmlTemplate = `
    <div class="row-wrapper">
      <div class="rewleftcon"><input type="text" class="managething" value="${nameVal}" id="rname${ItemID}"></div>
      <div class="rewmidcon"><input type="text" class="managething" value="${descVal}" id="rdesc${ItemID}"></div>
      <div class="rewrightcon"><input type="number" class="managething" value="${costVal}" id="rcost${ItemID}"></div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', htmlTemplate);
  
  document.getElementById("rname" + ItemID).addEventListener("change", (e) => {
    rwriteRewardName(uid, ItemID, e.target.value);
  });
  document.getElementById("rdesc" + ItemID).addEventListener("change", (e) => {
    rwriteRewardDesc(uid, ItemID, e.target.value);
  });
  document.getElementById("rcost" + ItemID).addEventListener("change", (e) => {
    rwriteRewardCost(uid, ItemID, e.target.value);
  });
}