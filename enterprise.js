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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const dbRef = ref(getDatabase());

let redemptionChartInstance = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const email = user.email;
    const uid = user.uid;
    console.log(user.email);
    document.getElementById("welcome").innerHTML = ("Welcome, " + email);
    document.getElementById("entid").innerHTML = ("Enterprise ID: " + uid);

    await initializeDashboardAnalytics(uid);
  } else {
    console.warn("No user is signed in.");
  }
});

async function initializeDashboardAnalytics(enterpriseId) {
    const productSelect = document.getElementById("productSelect");
    const dateLabels = getLast7Days();
    
    const productsFound = new Set();
    
    for (const dateStr of dateLabels) {
        try {
            const daySnapshot = await get(child(dbRef, `users/${enterpriseId}/analytics/daily_redemptions/${dateStr}`));
            if (daySnapshot.exists()) {
                Object.keys(daySnapshot.val()).forEach(prodName => productsFound.add(prodName));
            }
        } catch (err) {
            console.error("Error evaluating daily records on: " + dateStr, err);
        }
    }

    productSelect.innerHTML = '<option value="">-- Select a Product --</option>';
    productsFound.forEach(productName => {
        const cleanDisplayName = productName.replace(/_/g, " ");
        const option = document.createElement("option");
        option.value = productName;
        option.textContent = cleanDisplayName;
        productSelect.appendChild(option);
    });

    productSelect.addEventListener("change", async (e) => {
        const chosenSanitizedProduct = e.target.value;
        if (!chosenSanitizedProduct) return;

        const weeklyFrequencyData = [];

        for (const dateStr of dateLabels) {
            try {
                const targetNode = `users/${enterpriseId}/analytics/daily_redemptions/${dateStr}/${chosenSanitizedProduct}`;
                const countSnapshot = await get(child(dbRef, targetNode));
                weeklyFrequencyData.push(countSnapshot.exists() ? Number(countSnapshot.val()) : 0);
            } catch (error) {
                weeklyFrequencyData.push(0);
            }
        }

        renderChart(dateLabels, weeklyFrequencyData, chosenSanitizedProduct.replace(/_/g, " "));
    });
}

function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

function renderChart(labels, values, productTitle) {
    const ctx = document.getElementById('redemptionChart').getContext('2d');

    if (redemptionChartInstance) {
        redemptionChartInstance.destroy();
    }

    redemptionChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Units Redeemed: ${productTitle}`,
                data: values,
                backgroundColor: 'rgba(121, 4, 217, 0.6)',
                borderColor: 'rgb(142, 4, 217)',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, precision: 0 },
                    title: { display: true, text: 'Quantity Claimed' }
                },
                x: {
                    title: { display: true, text: 'Date' }
                }
            }
        }
    });
}