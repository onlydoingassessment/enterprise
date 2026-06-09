import { getDatabase, ref, set, update, child, get, increment, push } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
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
var uid = 0;
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
 onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    const email = user.email;
    uid = user.uid;
    console.log(user.email);
    document.getElementById("welcome").innerHTML = ("Welcome, " + email);
    document.getElementById("output").innerHTML = "";
    document.getElementById("off_output").innerHTML = "";
    updatePoints(document.getElementById("enterprise_id").value);
    displayRewards(document.getElementById("enterprise_id").value);
    console.log('Gonk')
  } else {
    // User is signed out
    console.warn("No user is signed in.");
  }
});

async function updatePoints(enterprise)
{
  if (!(await getData(`users/${enterprise}/customers/${uid}/points`)==""))
  {
    document.getElementById("points").innerHTML = await getData(`users/${enterprise}/customers/${uid}/points`)
  } else {
    document.getElementById("points").innerHTML = 0;
  }
}

const dbRef = ref(getDatabase());
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

// function unJSON(tree) {
//   let result = [];
//   
//   const { children, ...nodeData } = node;
//   
//   result.push(nodeData);
//   
//   if (children && children.length > 0) {
//     children.forEach(child => {
//       result = result.concat(unJSON(child));
//     });
//   }
//   
//   return result;
// }

document.getElementById("enterprise_id").addEventListener("change", (e) => {
  document.getElementById("output").innerHTML = "";
  document.getElementById("off_output").innerHTML = "";
  updatePoints(e.target.value);
  displayRewards(e.target.value);
  console.log('Gonk')
  // writeRewardName(uid, ItemID, e.target.value);
});

async function displayRewards(value) {
  let container = document.getElementById("output");
  for (let i = 0; i<6; i++) {
    let nameVal = await getData("users/" + value + "/purchase" + i + "/product");
    let descVal = await getData("users/" + value + "/purchase" + i + "/description");
    let costVal = await getData("users/" + value + "/purchase" + i + "/cost");
    console.log("gonk: " + nameVal);
    let htmlTemplate = `
      <div class="row-wrapper">
        <div class="rewleftcon"><div class="textclaimthing" id="name${i}">${nameVal}</div></div>
        <div class="rewmidcon"><div class="textclaimthing" id="desc${i}">${descVal}</div></div>
        <div class="rewrightcon"><div type="text" class="textclaimthing" id="cost${i}">${costVal}</div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', htmlTemplate);
  }
  container = document.getElementById("off_output");
  for (let i = 0; i<6; i++) {
    let nameVal = await getData("users/" + value + "/product" + i + "/product");
    let descVal = await getData("users/" + value + "/product" + i + "/description");
    let costVal = await getData("users/" + value + "/product" + i + "/cost");
    let htmlTemplate = `
      <div class="row-wrapper">
        <div class="rewleftcon"><div class="textclaimthing" id="rname${i}">${nameVal}</div></div>
        <div class="rewmidcon"><div type="text" class="textclaimthing" id="rdesc${i}">${descVal}</div></div>
        <div class="rewrightcon"><input type="button" class="claimbutton" value="${costVal}" id="rcost${i}"></div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', htmlTemplate);
    document.getElementById(`rcost${i}`).addEventListener("click", async (e) => {
      console.log("Item purchased");
  
      const customerId = uid;
      const productN = document.getElementById(`rname${i}`).innerHTML;
      const productVal = document.getElementById(`rcost${i}`).value;
      const enterpriseID = document.getElementById("enterprise_id").value;
      const pointsAmount = await getData("users/" + enterpriseID + "/product" + i + "/cost");
  
      await givePoints(customerId, -pointsAmount, productN);

    });
  }
}

async function givePoints(customer, amount, productName) {
  const db = getDatabase();
  const numericAmount = Number(amount); 
  
  const enterpriseId = document.getElementById("enterprise_id").value;

  if (getData(`users/${enterpriseId}/customers/${customer}/points`) < numericAmount) {
    alert("Insufficent points")
    return;
  }

  const updates = {};
  
  updates[`users/${enterpriseId}/customers/${customer}/points`] = increment(numericAmount);

  const redemptionsRef = ref(db, `users/${enterpriseId}/redemptions`);
  const newRedemptionKey = push(redemptionsRef).key;
  const customerEmail = auth.currentUser ? auth.currentUser.email : "Unknown Customer";
  
  updates[`users/${enterpriseId}/redemptions/${newRedemptionKey}`] = {
    productName: productName || "Unknown Product",
    customerID: customer,
    customerEmail: customerEmail,
    timestamp: Date.now()
  };


  const todayDateString = new Date().toISOString().split('T')[0];
  
  const sanitizedProductName = (productName || "Unknown Product").replace(/[\.\#\$\[\]]/g, "_");
  
  updates[`users/${enterpriseId}/analytics/daily_redemptions/${todayDateString}/${sanitizedProductName}`] = increment(1);

  try {
    await update(ref(db), updates);
  } catch (error) {
  }
  alert("Successfully redeemed: " + productName)
  await updatePoints(enterpriseId);
}