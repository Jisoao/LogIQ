import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Map of display names to Firestore keys
const methodNameMap = {
    "cramer's-rule": "cramers-rule",
    "gauss-elimination": "gauss-elimination",
    "gauss-jordan": "gauss-jordan",
    "lu-decomposition": "lu-decomposition"
};

// Function to update progress rings
function updateProgressRings(progress) {
    console.log("Updating progress rings with:", progress);
    const progressCards = document.querySelectorAll('.progress-card');
    
    progressCards.forEach(card => {
        const displayName = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
        const firestoreKey = methodNameMap[displayName];
        const ring = card.querySelector('.progress-indicator');
        const percentageElement = card.querySelector('.percentage');
        
        // Get progress value from Firestore data using the correct key
        const progressValue = progress[firestoreKey] || 0;
        console.log(`Updating ${displayName} (${firestoreKey}) progress to:`, progressValue);
        
        // Update the percentage text
        percentageElement.textContent = `${progressValue}%`;
        
        // Calculate and set the stroke dash offset
        const offset = 100 - progressValue;
        ring.style.strokeDashoffset = offset;
        
        // Update method card progress
        const methodCard = document.querySelector(`.method-card[data-method="${firestoreKey}"]`);
        if (methodCard) {
            methodCard.setAttribute('data-progress', progressValue);
            
            // Update status badge
            let statusClass = 'status-badge-not-started';
            let statusText = 'Not Started';
            
            if (progressValue > 0 && progressValue < 100) {
                statusClass = 'status-badge-in-progress';
                statusText = 'In Progress';
            } else if (progressValue === 100) {
                statusClass = 'status-badge-completed';
                statusText = 'Completed';
            }
            
            // Update or create status badge
            let badge = methodCard.querySelector('.status-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'status-badge';
                methodCard.appendChild(badge);
            }
            badge.className = `status-badge ${statusClass}`;
            badge.textContent = statusText;
        }
    });
}

// Function to load user progress from Firestore
async function loadUserProgress(userId) {
    try {
        console.log("Loading progress for user:", userId);
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data from Firestore:", userData);
            if (userData.progress) {
                updateProgressRings(userData.progress);
            }
        } else {
            console.log("No user document found");
        }
    } catch (error) {
        console.error("Error loading user progress:", error);
    }
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in, loading progress");
        loadUserProgress(user.uid);
    } else {
        console.log("No user signed in, resetting progress");
        updateProgressRings({
            "cramers-rule": 0,
            "gauss-elimination": 0,
            "gauss-jordan": 0,
            "lu-decomposition": 0
        });
    }
});

// Load progress when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("Page loaded, checking auth state");
    const user = auth.currentUser;
    if (user) {
        console.log("User found on page load, loading progress");
        loadUserProgress(user.uid);
    } else {
        console.log("No user found on page load");
    }
}); 