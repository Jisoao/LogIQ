import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to get the lesson number based on progress
function getLessonNumber(method, progress) {
    switch(method) {
        case 'cramers-rule':
            if (progress >= 100) return 4;
            if (progress >= 75) return 3;
            if (progress >= 50) return 2;
            if (progress >= 25) return 1;
            return 0;
        case 'lu-decomposition':
            if (progress >= 100) return 3;
            if (progress >= 66) return 2;
            if (progress >= 33) return 1;
            return 0;
        default:
            return 0;
    }
}

// Function to show lesson content
function showLessonContent(method, lessonNumber) {
    console.log('Showing lesson content for:', method, 'lesson:', lessonNumber);

    // Hide all lesson content first
    document.querySelectorAll('.lesson-content-detail').forEach(content => {
        content.style.display = 'none';
    });

    // Show the selected lesson content container
    const lessonContent = document.getElementById(`${method}-content`);
    if (lessonContent) {
        lessonContent.style.display = 'block';

        // Hide the detailed lesson content initially for all methods
        const detailedContent = lessonContent.querySelector('.detailed-lesson-content');
        if (detailedContent) {
            detailedContent.style.display = 'none';
        }

        // The logic to show the specific lesson section when a button is clicked is in the '.lesson-list button' event listener.
        // We don't show any specific section here initially.

        // Update active button in lesson list (optional, you might want to remove the active class initially)
        const lessonButtons = lessonContent.querySelectorAll('.lesson-list button');
        lessonButtons.forEach(button => {
             button.classList.remove('active');
        });

    } else {
        console.error('Lesson content not found for method:', method);
    }
}

// Function to load user progress and show appropriate lesson
async function loadUserProgressAndShowLesson(method) {
    const user = auth.currentUser;
    let lessonNumber = 0;  // Default to first lesson for non-logged in users

    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const progress = userData.progress[method] || 0;
                lessonNumber = getLessonNumber(method, progress);
            }
        } catch (error) {
            console.error("Error loading user progress:", error);
        }
    }

    // Show lesson content regardless of login status
    showLessonContent(method, lessonNumber);
}

// Function to show login recommendation popup
function showLoginRecommendation() {
    const popup = document.createElement('div');
    popup.className = 'login-recommendation';
    popup.innerHTML = `
        <button class="close-btn">&times;</button>
        <p>Login to save your progress and track your learning journey!</p>
        <button class="btn" onclick="window.location.href='/auth'">Login Now</button>
    `;
    document.body.appendChild(popup);

    // Add click event to close button
    popup.querySelector('.close-btn').addEventListener('click', () => {
        popup.remove();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('learn.js script started');

    // Authentication elements
    const loginButton = document.getElementById('loginBtn');
    const logoutButton = document.getElementById('logoutBtn');
    const usernameElement = document.getElementById('username');

    // Check authentication state
    function checkAuthState() {
        const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
        const username = sessionStorage.getItem('username');

        if (isLoggedIn && username) {
            if (usernameElement) usernameElement.textContent = username;
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
        } else {
            if (usernameElement) usernameElement.textContent = 'Guest';
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('userLoggedIn');
            sessionStorage.removeItem('username');
            window.location.href = '/auth';
        });
    }

    checkAuthState();

    // Hide all lesson content initially
    document.querySelectorAll('.lesson-content-detail').forEach(content => {
        content.style.display = 'none';
    });

    // Show lesson selection
    document.getElementById('lesson-selection').style.display = 'block';

    // Add event listeners for lesson buttons
    document.querySelectorAll('.lesson-button').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const method = button.dataset.lesson;
            
            // Hide lesson selection
            document.getElementById('lesson-selection').style.display = 'none';
            
            // Load user progress and show appropriate lesson
            loadUserProgressAndShowLesson(method);
        });
    });

    // Add event listeners for back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            // Hide all lesson content
            document.querySelectorAll('.lesson-content-detail').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show lesson selection
            document.getElementById('lesson-selection').style.display = 'block';
            });
        });

    // Add event listeners for lesson list buttons
    document.querySelectorAll('.lesson-list button').forEach(button => {
        button.addEventListener('click', () => {
            const method = button.closest('.lesson-content-detail').id.replace('-content', '');
            const targetId = button.getAttribute('data-target-id');
            const videoUrl = button.getAttribute('data-video-url');
            
            // Update video if URL is provided
            if (videoUrl) {
                const videoFrame = document.querySelector(`#${method}-content .video-section iframe`);
                if (videoFrame) {
                    videoFrame.src = videoUrl;
                }
            }

            // Show the selected lesson content
            const lessonContent = button.closest('.lesson-content-detail');
            const detailedContent = lessonContent.querySelector('.detailed-lesson-content');
            
            if (detailedContent) {
                // For Gauss Elimination and Gauss-Jordan, show the detailed content
                // This condition is no longer needed as showLessonContent hides for all initially.
                // if (method === 'gauss-elimination' || method === 'gauss-jordan') {
                    detailedContent.style.display = 'block';
                // }

                // Show the selected section and hide others
                document.querySelectorAll('.lesson-section-detail').forEach(section => {
                    section.style.display = section.id === targetId ? 'block' : 'none';
                });
            }

            // Update active button
            button.closest('.lesson-list').querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');

            // Scroll to top of the lesson content
            const container = document.querySelector('.container');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Add event listeners for method cards
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('click', () => {
            const method = card.getAttribute('data-method');
            if (method) {
                // Hide method selection
                document.getElementById('method-selection').style.display = 'none';
                
                // Show lesson content
                const lessonContent = document.getElementById(`${method}-content`);
                if (lessonContent) {
                    lessonContent.style.display = 'block';
                    // Load user progress and show appropriate lesson
                    loadUserProgressAndShowLesson(method);
                }
                }
            });
        });

    // Add event listeners for next lesson buttons
    document.querySelectorAll('.next-lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            const currentSection = button.closest('.lesson-section-detail');
            const nextSectionId = button.getAttribute('data-next-target-id');
            const nextSection = document.getElementById(nextSectionId);
            
            if (currentSection && nextSection) {
                // Hide current section and show next section
                currentSection.style.display = 'none';
                nextSection.style.display = 'block';
                
                // Update lesson list buttons
                const lessonContent = currentSection.closest('.lesson-content-detail');
                const lessonButtons = lessonContent.querySelectorAll('.lesson-list button');
                const currentIndex = Array.from(lessonContent.querySelectorAll('.detailed-lesson-content > div')).indexOf(currentSection);
                const nextIndex = currentIndex + 1;
                
                lessonButtons.forEach((btn, index) => {
                    if (index === nextIndex) {
                        btn.classList.add('active');
                        // Update video if URL is provided
                        const videoUrl = btn.getAttribute('data-video-url');
                        if (videoUrl) {
                            const videoFrame = document.getElementById('lesson-video');
                            if (videoFrame) {
                                videoFrame.src = videoUrl;
                            }
                        }
                    } else {
                        btn.classList.remove('active');
                    }
                });

                // Scroll the lesson content container to the top
                const container = document.querySelector('.container');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Add event listeners for previous lesson buttons
    document.querySelectorAll('.previous-lesson-button').forEach(button => {
        button.addEventListener('click', () => {
            const currentSection = button.closest('.lesson-section-detail');
            const prevSectionId = button.getAttribute('data-previous-target-id');
            const prevSection = document.getElementById(prevSectionId);
            
            if (currentSection && prevSection) {
                // Hide current section and show previous section
                currentSection.style.display = 'none';
                prevSection.style.display = 'block';
                
                // Update lesson list buttons
                const lessonContent = currentSection.closest('.lesson-content-detail');
                const lessonButtons = lessonContent.querySelectorAll('.lesson-list button');
                const currentIndex = Array.from(lessonContent.querySelectorAll('.detailed-lesson-content > div')).indexOf(currentSection);
                const prevIndex = currentIndex - 1;
                
                lessonButtons.forEach((btn, index) => {
                    if (index === prevIndex) {
                        btn.classList.add('active');
                        // Update video if URL is provided
                        const videoUrl = btn.getAttribute('data-video-url');
                        if (videoUrl) {
                            const videoFrame = document.getElementById('lesson-video');
                            if (videoFrame) {
                                videoFrame.src = videoUrl;
                            }
                        }
                    } else {
                        btn.classList.remove('active');
                    }
                });

                // Scroll the lesson content container to the top
                const container = document.querySelector('.container');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
});
