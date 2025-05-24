/**
 * Homepage interactions and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    initCardHoverEffects();
    initProgressRings();
    updateUsername();
    setupAuth();
    addStatusBadges();
});

/**
 * Initialize card hover effects with gradient follow
 */
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.method-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Get position relative to card
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Set CSS custom properties for the gradient position
            card.style.setProperty('--x', `${x}%`);
            card.style.setProperty('--y', `${y}%`);
            
            // Add hovered class for style effects
            card.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hovered');
        });
    });
}

/**
 * Initialize progress rings animation
 */
function initProgressRings() {
    const progressCards = document.querySelectorAll('.progress-card');
    
    progressCards.forEach(card => {
        const ring = card.querySelector('.progress-indicator');
        const percentage = card.querySelector('.percentage').textContent;
        const value = parseInt(percentage);
        
        // Set initial value of circle to full (to prepare for animation)
        ring.style.strokeDashoffset = '100';
        
        // Set a timeout to allow the browser to paint the initial state
        setTimeout(() => {
            // Calculate stroke dash offset from percentage (100 - value because stroke-dashoffset works backwards)
            const offset = 100 - value;
            ring.style.strokeDashoffset = offset;
        }, 300);
    });
    
    // Also animate method cards' progress status
    const methodCards = document.querySelectorAll('.method-card');
    methodCards.forEach(card => {
        const progress = card.getAttribute('data-progress');
        if (progress) {
            const value = parseInt(progress);
            
            // Set appropriate status badge based on progress value
            let statusClass = 'status-badge-not-started';
            let statusText = 'Not Started';
            
            if (value > 0 && value < 100) {
                statusClass = 'status-badge-in-progress';
                statusText = 'In Progress';
            } else if (value === 100) {
                statusClass = 'status-badge-completed';
                statusText = 'Completed';
            }
            
            // Create status badge if it doesn't exist
            if (!card.querySelector('.status-badge')) {
                const badge = document.createElement('div');
                badge.className = `status-badge ${statusClass}`;
                badge.textContent = statusText;
                card.appendChild(badge);
            }
        }
    });
}

/**
 * Update username from localStorage if available and handle auth UI
 */
function updateUsername() {
    const usernameElement = document.getElementById('username');
    const storedUsername = localStorage.getItem('username') || 'Guest';
    
    if (usernameElement) {
        usernameElement.textContent = storedUsername;
    }
}

/**
 * Setup authentication UI elements
 */
function setupAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileLink = document.querySelector('.profile-link');
    
    // Check if user is logged in (from localStorage)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Show/hide login/logout buttons based on auth status
    if (loginBtn && logoutBtn) {
        if (isLoggedIn) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'flex';
        } else {
            loginBtn.style.display = 'flex';
            logoutBtn.style.display = 'none';
        }
    }
    
    // Setup logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.setItem('username', 'Guest');
            window.location.reload();
        });
    }
}

/**
 * Add status badges to method cards
 */
function addStatusBadges() {
    const methodCards = document.querySelectorAll('.method-card');
    methodCards.forEach(card => {
        // Skip if badge already exists
        if (card.querySelector('.status-badge')) return;
        
        // Create badge based on progress data or card data
        const progressPercentage = card.dataset.progress || "0";
        let badgeText = 'Not Started';
        let badgeClass = 'status-badge-not-started';
        
        if (progressPercentage > 0 && progressPercentage < 100) {
            badgeText = 'In Progress';
            badgeClass = 'status-badge-in-progress';
        } else if (progressPercentage == 100) {
            badgeText = 'Completed';
            badgeClass = 'status-badge-completed';
        }
        
        const badge = document.createElement('span');
        badge.className = `status-badge ${badgeClass}`;
        badge.textContent = badgeText;
        card.appendChild(badge);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize progress rings
    const cards = document.querySelectorAll('.method-card');
    
    // Function to set progress
    function setProgress(card) {
        const progressPath = card.querySelector('.progress-indicator');
        const percentageElement = card.querySelector('.percentage');
        const statusLabel = card.querySelector('.status-label');
        const percent = parseInt(card.getAttribute('data-progress'));
        
        if (!progressPath || !percentageElement) return;
        
        const radius = 15.9155;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percent / 100 * circumference);
        
        // Animation delay for staggered effect
        setTimeout(() => {
            progressPath.style.strokeDasharray = `${circumference} ${circumference}`;
            progressPath.style.strokeDashoffset = offset;
            percentageElement.textContent = `${percent}%`;
            
            // Update status label
            if (statusLabel) {
                if (percent === 0) {
                    statusLabel.textContent = 'Not Started';
                } else if (percent === 100) {
                    statusLabel.textContent = 'Completed';
                } else {
                    statusLabel.textContent = 'In Progress';
                }
            }
        }, 300 * parseInt(card.style.getPropertyValue('--i') || 0));
    }

    // Initialize all cards
    cards.forEach(card => {
        // Add click event
        card.addEventListener('click', () => {
            const method = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `/learn/${method}`;
        });
        
        // Set animation delay to fade in cards sequentially
        const delay = parseInt(card.style.getPropertyValue('--i') || 0) * 100;
        setTimeout(() => {
            card.style.opacity = '1';
        }, delay);
        
        // Initialize progress
        setProgress(card);
    });

    // Example: Update a progress value when a user makes progress (simulated here)
    function updateCardProgress(methodName, newProgress) {
        // Find the card with this method
        const card = Array.from(cards).find(card => {
            const cardMethod = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
            return cardMethod === methodName;
        });
        
        if (card) {
            // Update data attribute
            card.setAttribute('data-progress', newProgress);
            
            // Update the visual
            setProgress(card);
            
            // Save to localStorage to persist
            localStorage.setItem(`${methodName}-progress`, newProgress);
            
            // Add pulse animation briefly
            card.classList.add('pulse');
            setTimeout(() => {
                card.classList.remove('pulse');
            }, 2000);
        }
    }
    
    // Load progress from localStorage if available
    cards.forEach(card => {
        const methodName = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
        const savedProgress = localStorage.getItem(`${methodName}-progress`);
        if (savedProgress !== null) {
            card.setAttribute('data-progress', savedProgress);
            setProgress(card);
        }
    });

    // Handle authentication UI updates
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const usernameElement = document.getElementById('username');

    // Check for authentication state from localStorage (this will be managed by auth.js)
    const checkAuthState = () => {
        const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
        const username = sessionStorage.getItem('username');

        if (isLoggedIn && username) {
            // User is logged in
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            if (usernameElement) usernameElement.textContent = username;
        } else {
            // User is not logged in
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (usernameElement) usernameElement.textContent = 'Guest';
        }
    };

    // Check auth state on page load
    checkAuthState();

    // Add logout handler
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // This is a simplified example since we can't directly access Firebase here
            sessionStorage.removeItem('userLoggedIn');
            sessionStorage.removeItem('username');
            window.location.href = '/auth';
        });
    }
}); 