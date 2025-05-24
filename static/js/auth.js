import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
import { firebaseConfig } from './config.js';

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

// Form validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function clearMessages() {
  var el;
  el = document.getElementById('registerError');
  if (el) el.textContent = '';
  el = document.getElementById('registerSuccess');
  if (el) el.textContent = '';
  el = document.getElementById('loginError');
  if (el) el.textContent = '';
  el = document.getElementById('loginSuccess');
  if (el) el.textContent = '';
}

// Registration form handler
document.getElementById('registerForm')?.addEventListener('submit', function(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');

  // Validate email
  if (!validateEmail(email)) {
    errorEl.textContent = "Please enter a valid email address.";
    return;
  }

  // Validate password
  if (!validatePassword(password)) {
    errorEl.textContent = "Password must be at least 6 characters long.";
    return;
  }

  if (password !== confirm) {
    errorEl.textContent = "Passwords do not match.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      successEl.textContent = "Registration successful! Please log in.";
      // Store user info in sessionStorage
      const username = email.split('@')[0];
      sessionStorage.setItem('userLoggedIn', 'true');
      sessionStorage.setItem('username', username);
      setTimeout(() => {
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
      }, 1200);
    })
    .catch((error) => {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorEl.textContent = "This email is already registered. Please log in instead.";
          break;
        case 'auth/invalid-email':
          errorEl.textContent = "Please enter a valid email address.";
          break;
        default:
          errorEl.textContent = "An error occurred during registration. Please try again.";
      }
    });
});

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const successEl = document.getElementById('loginSuccess');

  // Validate email
  if (!validateEmail(email)) {
    errorEl.textContent = "Please enter a valid email address.";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Store user info in sessionStorage
      const username = email.split('@')[0];
      sessionStorage.setItem('userLoggedIn', 'true');
      sessionStorage.setItem('username', username);
      
      successEl.textContent = "Login successful! Redirecting...";
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);
    })
    .catch((error) => {
      switch (error.code) {
        case 'auth/user-not-found':
          errorEl.textContent = "No account found with this email. Please sign up first.";
          break;
        case 'auth/wrong-password':
          errorEl.textContent = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorEl.textContent = "Please enter a valid email address.";
          break;
        default:
          errorEl.textContent = "An error occurred during login. Please try again.";
      }
    });
});

// Logout handler
function handleLogout() {
  signOut(auth)
    .then(() => {
      // Clear session storage
      sessionStorage.removeItem('userLoggedIn');
      sessionStorage.removeItem('username');
      console.log('User signed out');
      
      // Redirect to login page
      window.location.replace('/auth');
    })
    .catch((error) => {
      console.error('Sign out error:', error);
    });
}

// Attach logout handler to logout buttons
document.querySelectorAll('#logoutBtn').forEach(button => {
  button.addEventListener('click', handleLogout);
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.email);
    // Store user info in sessionStorage
    const username = user.email.split('@')[0];
    sessionStorage.setItem('userLoggedIn', 'true');
    sessionStorage.setItem('username', username);
    
    // If we're on the auth page and user is signed in, redirect to homepage
    if (window.location.pathname.includes('auth')) {
      window.location.replace('/');
    }
    
    // Update username on pages with navbar
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = username;
    }
    
    // Update login/logout buttons
    document.querySelectorAll('#loginBtn').forEach(el => {
      if (el) el.style.display = 'none';
    });
    document.querySelectorAll('#logoutBtn').forEach(el => {
      if (el) el.style.display = 'block';
    });
  } else {
    console.log('No user is signed in');
    // Clear session storage
    sessionStorage.removeItem('userLoggedIn');
    sessionStorage.removeItem('username');
    
    // Update UI for logged out state
    document.querySelectorAll('#username').forEach(el => {
      if (el) el.textContent = 'Guest';
    });
    document.querySelectorAll('#loginBtn').forEach(el => {
      if (el) el.style.display = 'block';
    });
    document.querySelectorAll('#logoutBtn').forEach(el => {
      if (el) el.style.display = 'none';
    });
  }
});

// On page load, show the correct form based on the hash
window.addEventListener('load', () => {
  if (window.location.hash === '#signup') {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  } else {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
  }
});

//Forgot Password
function handleForgotPassword() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const errorEl = document.getElementById('loginError');
  const successEl = document.getElementById('loginSuccess');
  if (!email) {
    if (errorEl) errorEl.textContent = "Please enter your email address above to reset your password.";
    return;
  }
  // Optionally validate email format
  if (!validateEmail(email)) {
    if (errorEl) errorEl.textContent = "Please enter a valid email address.";
    return;
  }
  sendPasswordResetEmail(auth, email)
    .then(() => {
      if (successEl) successEl.textContent = "Password reset email sent! Please check your inbox.";
    })
    .catch((error) => {
      if (errorEl) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorEl.textContent = "No account found with this email.";
            break;
          case 'auth/invalid-email':
            errorEl.textContent = "Please enter a valid email address.";
            break;
          default:
            errorEl.textContent = "Failed to send password reset email. Please try again.";
        }
      }
    });
}

window.handleForgotPassword = handleForgotPassword; 