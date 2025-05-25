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

    // Show the selected lesson content
    const lessonContent = document.getElementById(`${method}-content`);
    if (lessonContent) {
        lessonContent.style.display = 'block';
        
        // Show the appropriate detailed section
        const detailedSections = lessonContent.querySelectorAll('.detailed-lesson-content > div');
        detailedSections.forEach((section, index) => {
            if (section) {
                section.style.display = index === lessonNumber ? 'block' : 'none';
            }
        });

        // Update active button in lesson list
        const lessonButtons = lessonContent.querySelectorAll('.lesson-list button');
        lessonButtons.forEach((button, index) => {
            if (index === lessonNumber) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
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
            const lessonNumber = Array.from(button.parentElement.children).indexOf(button);
            
            console.log('Lesson button clicked:', method, 'lesson:', lessonNumber);
            
            // Show the selected lesson content
            showLessonContent(method, lessonNumber);
            
            // Only update progress if user is logged in
            const user = auth.currentUser;
            if (!user) {
                showLoginRecommendation();
            } else {
                // Update progress based on lesson number
                let progress = 0;
                switch(method) {
                    case 'cramers-rule':
                        switch(lessonNumber) {
                            case 0: // Lesson 1
                                progress = 0;
                                break;
                            case 1: // Lesson 2
                                progress = 25;
                                break;
                            case 2: // Lesson 3
                                progress = 50;
                                break;
                            case 3: // Practice Problems
                                progress = 75;
                                break;
                            default:
                                progress = 0;
                        }
                        break;
                    case 'lu-decomposition':
                        switch(lessonNumber) {
                            case 0: // Lesson 1
                                progress = 0;
                                break;
                            case 1: // Lesson 2
                                progress = 33;
                                break;
                            case 2: // Lesson 3
                                progress = 66;
                                break;
                            default:
                                progress = 0;
                        }
                        break;
                    default:
                        progress = 0;
                }
                
                // Update progress in Firestore
                const userRef = doc(db, "users", user.uid);
                getDoc(userRef).then((doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        const currentProgress = userData.progress || {};
                        currentProgress[method] = progress;
                        
                        // Update the document
                        updateDoc(userRef, {
                            progress: currentProgress
                        }).then(() => {
                            console.log(`Progress updated for ${method}: ${progress}%`);
                        }).catch((error) => {
                            console.error("Error updating progress:", error);
                        });
                    }
                });
            }

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
