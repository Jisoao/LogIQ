document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    const checkAuth = () => {
        const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
        const username = sessionStorage.getItem('username');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');

        if (isLoggedIn && username) {
            // Update UI for logged in user
            document.getElementById('username').textContent = username;
            document.getElementById('profile-name').textContent = username;
            document.getElementById('profile-email').textContent = `${username.toLowerCase()}@example.com`;
            
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
        } else {
            // Update UI for guest user
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    };
    
    // Handle logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('userLoggedIn');
            sessionStorage.removeItem('username');
            window.location.href = '/auth';
        });
    }
    
    // Load user statistics and achievements
    const loadUserStats = () => {
        // This would usually come from a backend API
        // Here we're using localStorage to simulate progress data
        const methods = ['cramers-rule', 'gauss-elimination', 'gauss-jordan', 'lu-decomposition'];
        let methodsStarted = 0;
        let methodsCompleted = 0;
        let totalProgress = 0;
        
        methods.forEach(method => {
            const progress = parseInt(localStorage.getItem(`${method}-progress`) || 0);
            totalProgress += progress;
            
            if (progress > 0) methodsStarted++;
            if (progress === 100) methodsCompleted++;
        });
        
        const avgProgress = methods.length > 0 ? Math.round(totalProgress / methods.length) : 0;
        
        // Update the statistics in the UI
        document.querySelectorAll('.stat-item').forEach(statItem => {
            const statLabel = statItem.querySelector('.stat-label').textContent;
            const statValue = statItem.querySelector('.stat-value');
            
            if (statLabel.includes('Started')) {
                statValue.textContent = methodsStarted;
            } else if (statLabel.includes('Completed')) {
                statValue.textContent = methodsCompleted;
            } else if (statLabel.includes('Overall Progress')) {
                statValue.textContent = `${avgProgress}%`;
            }
        });
        
        // Update achievements
        updateAchievements(methodsStarted, methodsCompleted, avgProgress);
    };
    
    // Update achievements based on progress
    const updateAchievements = (started, completed, progress) => {
        const achievements = document.querySelectorAll('.achievement');
        
        // New Learner achievement
        if (started > 0) {
            const newLearner = Array.from(achievements).find(a => 
                a.querySelector('.achievement-name').textContent === 'New Learner');
            if (newLearner) {
                newLearner.querySelector('.achievement-icon').classList.remove('locked');
            }
        }
        
        // Problem Solver achievement
        if (localStorage.getItem('problems-solved') >= 3) {
            const problemSolver = Array.from(achievements).find(a => 
                a.querySelector('.achievement-name').textContent === 'Problem Solver');
            if (problemSolver) {
                problemSolver.querySelector('.achievement-icon').classList.remove('locked');
            }
        }
        
        // Matrix Master achievement
        if (completed >= 3) {
            const matrixMaster = Array.from(achievements).find(a => 
                a.querySelector('.achievement-name').textContent === 'Matrix Master');
            if (matrixMaster) {
                matrixMaster.querySelector('.achievement-icon').classList.remove('locked');
            }
        }
    };

    // Initialize the page
    checkAuth();
    loadUserStats();
    
    // Add some animation to statistics
    document.querySelectorAll('.stat-item').forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}); 