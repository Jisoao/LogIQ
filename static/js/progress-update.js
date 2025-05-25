import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to show login recommendation message
function showLoginRecommendation() {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('login-recommendation');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'login-recommendation';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #157575;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.5s ease-out;
        `;
        
        // Add styles for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
        `;
        closeButton.onclick = () => {
            messageElement.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => messageElement.remove(), 500);
        };
        
        messageElement.appendChild(closeButton);
        document.body.appendChild(messageElement);
    }
    
    // Set message content
    const messageContent = document.createElement('span');
    messageContent.textContent = 'Log in to save and track your learning progress!';
    messageElement.appendChild(messageContent);
    
    // Add login link
    const loginLink = document.createElement('a');
    loginLink.href = '/login';
    loginLink.textContent = 'Login';
    loginLink.style.cssText = `
        color: white;
        text-decoration: underline;
        margin-left: 10px;
        cursor: pointer;
    `;
    messageElement.appendChild(loginLink);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => messageElement.remove(), 500);
        }
    }, 5000);
}

// Function to update progress in Firestore
async function updateProgress(method, increment) {
    const user = auth.currentUser;
    if (!user) {
        console.log("No user logged in");
        showLoginRecommendation();
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentProgress = userData.progress[method] || 0;
            const newProgress = Math.min(100, currentProgress + increment);

            await updateDoc(doc(db, "users", user.uid), {
                [`progress.${method}`]: newProgress
            });

            console.log(`Progress updated for ${method}: ${newProgress}%`);
        }
    } catch (error) {
        console.error("Error updating progress:", error);
    }
}

// Function to set progress to 100% in Firestore
async function completeProgress(method) {
    const user = auth.currentUser;
    if (!user) {
        console.log("No user logged in");
        showLoginRecommendation();
        return;
    }

    try {
        await updateDoc(doc(db, "users", user.uid), {
            [`progress.${method}`]: 100
        });
        console.log(`Progress completed for ${method}`);
        
        // Navigate back to the homepage
        window.location.href = '/';
    } catch (error) {
        console.error("Error completing progress:", error);
    }
}

// Add event listeners for lesson buttons
document.addEventListener('DOMContentLoaded', () => {
    // Cramer's Rule next lesson buttons
    document.querySelectorAll('#cramers-rule-content .next-lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            updateProgress('cramers-rule', 25);
        });
    });

    // Cramer's Rule previous lesson buttons
    document.querySelectorAll('#cramers-rule-content .previous-lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            updateProgress('cramers-rule', -25);
        });
    });

    // Cramer's Rule complete lesson button
    document.querySelector('#cramers-rule-content .complete-lesson-button')?.addEventListener('click', () => {
        completeProgress('cramers-rule');
    });

    // Gauss Elimination complete lesson button
    document.querySelector('#gauss-elimination-content .complete-lesson-button')?.addEventListener('click', () => {
        completeProgress('gauss-elimination');
    });

    // Gauss Jordan complete lesson button
    document.querySelector('#gauss-jordan-content .complete-lesson-button')?.addEventListener('click', () => {
        completeProgress('gauss-jordan');
    });

    // LU Decomposition next lesson buttons
    document.querySelectorAll('#lu-decomposition-content .next-lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            updateProgress('lu-decomposition', 33);
        });
    });

    // LU Decomposition previous lesson buttons
    document.querySelectorAll('#lu-decomposition-content .previous-lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            updateProgress('lu-decomposition', -33);
        });
    });

    // LU Decomposition complete lesson button
    document.querySelector('#lu-decomposition-content .complete-lesson-button')?.addEventListener('click', () => {
        completeProgress('lu-decomposition');
    });
}); 