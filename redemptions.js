import { getDatabase, ref, set, update, child, get, increment, push, remove } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";

// Keep this config matching your main app configuration block
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

const enterpriseDropdown = document.getElementById("enterprise_id");

var uid = 0

onAuthStateChanged(auth, async (user) => {
  if (user) {
    uid = user.uid;
    
    document.getElementById("enterprise_id").innerHTML = uid;

    loadRedemptions(uid);
    
  } else {
    console.warn("No user is signed in.");
  }
});

async function loadRedemptions(enterpriseId) {
    const listContainer = document.getElementById("redemptions-list");
    const loadingEl = document.getElementById("loading");
    
    if (!listContainer) {
        return;
    }
    
    listContainer.innerHTML = "";
    if (loadingEl) loadingEl.style.display = "block";

    const targetDatabasePath = `users/${enterpriseId}/redemptions`;

    try {
        const snapshot = await get(child(dbRef, targetDatabasePath));
        
        if (loadingEl) loadingEl.style.display = "none";

        if (snapshot.exists()) {
            const redemptionsData = snapshot.val();
            console.log("Data records found! Parsing entries...");
            
            Object.keys(redemptionsData).forEach((key) => {
                const item = redemptionsData[key];
                
                const formattedDate = item.timestamp 
                    ? new Date(item.timestamp).toLocaleString() 
                    : "N/A";

                const htmlRow = `
                    <tr>
                        <td><strong>${item.customerID || "Unknown ID"}</strong></td>
                        <td>${item.customerEmail || "N/A"}</td>
                        <td>${item.productName || "Unknown Reward"}</td>
                        <td><small>${formattedDate}</small></td>
                        <td>
                            <input type="button" value="Remove" id="del-${key}" style="background-color: #5d0158; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        </td>
                    </tr>
                `;
                
                listContainer.insertAdjacentHTML("beforeend", htmlRow);

                document.getElementById(`del-${key}`).addEventListener("click", async () => {
                    if (confirm("Are you sure you want to remove this redemption record?")) {
                        await deleteRedemption(enterpriseId, key);
                    }
                });
            });
            console.log("Finished rendering rows to layout table.");
        } else {
            console.warn("Snapshot returned empty. No data exists at path: " + targetDatabasePath);
            listContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999; padding: 20px;">No redemptions found under UID: ${enterpriseId}</td></tr>`;
        }
    } catch (error) {
        console.error("Firebase read failure exception occurred:", error);
        if (loadingEl) loadingEl.style.display = "none";
        listContainer.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; padding: 20px;">Database Error. View console logs.</td></tr>`;
    }
}

async function deleteRedemption(enterpriseId, logKey) {
    const db = getDatabase();
    const listContainer = document.getElementById("redemptions-list");
    try {
        await remove(ref(db, `users/${enterpriseId}/redemptions/${logKey}`));
        console.log(`Successfully deleted record: ${logKey}`);

        const targetRow = document.getElementById(`row-${logKey}`);
        if (targetRow) {
            targetRow.remove();
        }
        
        if (listContainer && listContainer.children.length === 0) {
            listContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding: 20px;">No redemptions found under UID: ${enterpriseId}</td></tr>`;
        }
        loadRedemptions(uid);
    } catch (error) {
        console.error("Failed to delete redemption entry:", error);
    }
}