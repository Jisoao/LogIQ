import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdWP3waol5iOJ2TlneoNFg48hMxX_DWDo",
  authDomain: "logiq-5012d.firebaseapp.com",
  projectId: "logiq-5012d",
  storageBucket: "logiq-5012d.firebasestorage.app",
  messagingSenderId: "181685211903",
  appId: "1:181685211903:web:efbb6296140011220c72ca"
};


// Initialize Firebase
let app;
let auth;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  analytics = getAnalytics(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Toggle forms
function showLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
  clearMessages();
  document.getElementById('switchLogin')?.classList.add('active');
  document.getElementById('switchRegister')?.classList.remove('active');
}

function showRegister() {
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
  clearMessages();
  document.getElementById('switchRegister')?.classList.add('active');
  document.getElementById('switchLogin')?.classList.remove('active');
}

function clearMessages() {
  document.getElementById('registerError').textContent = '';
  document.getElementById('registerSuccess').textContent = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginSuccess').textContent = '';
}

// Make functions globally available
window.showLogin = showLogin;
window.showRegister = showRegister;

// Registration form handler
document.getElementById('registerForm').addEventListener('submit', function(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');

  if (password !== confirm) {
    errorEl.textContent = "Passwords do not match.";
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      successEl.textContent = "Registration successful! Please log in.";
      setTimeout(showLogin, 1200);
    })
    .catch((error) => {
      errorEl.textContent = error.message;
    });
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const successEl = document.getElementById('loginSuccess');

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      successEl.textContent = "Login successful! Redirecting...";
      // Use a more reliable redirection method
      setTimeout(() => {
        window.location.replace('homepage.html');
      }, 1000);
    })
    .catch((error) => {
      errorEl.textContent = error.message;
    });
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.email);
    // If we're on the auth page and user is signed in, redirect to homepage
    if (window.location.pathname.includes('auth.html')) {
      window.location.replace('homepage.html');
    }
  } else {
    console.log('No user is signed in');
  }
});

// On page load, show the correct form based on the hash
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#signup') {
    showRegister();
  } else {
    showLogin();
  }
}); 