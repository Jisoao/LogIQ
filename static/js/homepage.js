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