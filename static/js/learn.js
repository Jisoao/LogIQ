document.addEventListener('DOMContentLoaded', () => {
    console.log('learn.js script started');

    // Authentication elements
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
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

    const lessonButtons = document.querySelectorAll('.lesson-button');
    const lessonSelection = document.getElementById('lesson-selection');
    const lessonContentViews = document.querySelectorAll('.lesson-content-detail');

    lessonContentViews.forEach(view => view.style.display = 'none');
    // Keep lessonSelection visible initially
    lessonSelection.style.display = 'block'; // Ensure lesson selection is visible on load

    lessonButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            console.log('Lesson button clicked');
            event.preventDefault();
            console.log('Default prevented');

            const lessonId = button.dataset.lesson + '-content';
            const targetContentView = document.getElementById(lessonId);

            console.log('Clicked lesson button data-lesson:', button.dataset.lesson);
            console.log('Target lesson ID:', lessonId);
            console.log('Target content view found:', targetContentView);

            if (targetContentView) {
                console.log('Target content view found, proceeding to show/hide sections');
                // Hide the lesson selection screen
                lessonSelection.style.display = 'none';
                console.log('Lesson selection hidden');

                // Hide all lesson content detail views first
                lessonContentViews.forEach(view => view.style.display = 'none');
                console.log('All lesson content views hidden');

                // Show the selected lesson content detail view
                targetContentView.style.display = 'block';
                console.log('Target content view displayed');

                // Setup navigation for the specific lesson
                if (lessonId === 'cramers-rule-content') {
                    console.log("Setting up Cramer's Rule lesson navigation");
                    setupCramersRuleLessonNavigation();
                    console.log("Cramer's Rule lesson navigation setup complete");
                } else if (lessonId === 'gauss-elimination-content') {
                    console.log("Setting up Gauss Elimination lesson navigation");
                    setupGaussEliminationLessonNavigation();
                    console.log("Gauss Elimination lesson navigation setup complete");
                } else if (lessonId === 'gauss-jordan-content') {
                    console.log("Setting up Gauss-Jordan Elimination lesson navigation");
                    setupGaussJordanLessonNavigation();
                    console.log("Gauss-Jordan Elimination lesson navigation setup complete");
                } else if (lessonId === 'lu-decomposition-content') { // Add LU Decomposition setup
                    console.log("Setting up LU Decomposition lesson navigation");
                    setupLUDecompositionLessonNavigation();
                    console.log("LU Decomposition lesson navigation setup complete");
                }

                // Initially show the first detailed section for the selected lesson
                const firstDetailedSection = targetContentView.querySelector('.detailed-lesson-content > div');
                if (firstDetailedSection) {
                    firstDetailedSection.style.display = 'block';
                    const firstButtonTargetId = firstDetailedSection.id;
                    updateActiveLessonButton(firstButtonTargetId);
                }


            } else {
                console.log('Target content view not found!', lessonId);
            }
        });
    });

    // === Utility function for highlighting active button ===
    function updateActiveLessonButton(targetId) {
        document.querySelectorAll('.lesson-list button').forEach(button => {
            if (button.dataset.targetId === targetId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // === Detailed section navigation for Cramer\'s Rule ===
    function setupCramersRuleLessonNavigation() {
        const cramersLessonButtons = document.querySelectorAll('#cramers-rule-content .lesson-list button');
        const detailedSections = document.querySelectorAll('#cramers-rule-content .detailed-lesson-content > div');
        const nextLessonButtons = document.querySelectorAll('#cramers-rule-content .next-lesson-button');
        const previousLessonButtons = document.querySelectorAll('#cramers-rule-content .previous-lesson-button');

        detailedSections.forEach(section => section.style.display = 'none');

        cramersLessonButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = button.dataset.targetId;
                const targetSection = document.getElementById(targetId);

                detailedSections.forEach(section => section.style.display = 'none');
                if (targetSection) {
                    targetSection.style.display = 'block';
                    updateActiveLessonButton(targetId);
                }
            });
        });

        nextLessonButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const nextTargetId = button.dataset.nextTargetId;
                const nextTargetSection = document.getElementById(nextTargetId);
                detailedSections.forEach(section => section.style.display = 'none');
                if (nextTargetSection) {
                    nextTargetSection.style.display = 'block';
                    updateActiveLessonButton(nextTargetId);
                }
            });
        });

        previousLessonButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const previousTargetId = button.dataset.previousTargetId;
                const previousTargetSection = document.getElementById(previousTargetId);
                detailedSections.forEach(section => section.style.display = 'none');
                if (previousTargetSection) {
                    previousTargetSection.style.display = 'block';
                    updateActiveLessonButton(previousTargetId);
                }
            });
        });

        // Initially show the first detailed section for Cramer's Rule
        if (detailedSections.length > 0) {
            detailedSections[0].style.display = 'block';
            const firstButtonTargetId = detailedSections[0].id;
            updateActiveLessonButton(firstButtonTargetId);
        }
    }

    // === Detailed section navigation for Gauss Elimination ===
    function setupGaussEliminationLessonNavigation() {
        console.log('setupGaussEliminationLessonNavigation function called');
        const gaussLessonButtons = document.querySelectorAll('#gauss-elimination-content .lesson-list button');
        const detailedSections = document.querySelectorAll('#gauss-elimination-content .detailed-lesson-content > div');
        const nextLessonButtons = document.querySelectorAll('#gauss-elimination-content .next-lesson-button');
        const previousLessonButtons = document.querySelectorAll('#gauss-elimination-content .previous-lesson-button');

        console.log('Gauss Elimination detailed sections found:', detailedSections.length);
        detailedSections.forEach(section => {
            section.style.display = 'none';
            console.log('Hiding section:', section.id);
        });

        gaussLessonButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                console.log('Gauss Elimination lesson list button clicked', button.dataset.targetId);
                event.preventDefault();
                const targetId = button.dataset.targetId;
                const targetSection = document.getElementById(targetId);

                detailedSections.forEach(section => section.style.display = 'none');
                if (targetSection) {
                    targetSection.style.display = 'block';
                    updateActiveLessonButton(targetId);
                }
            });
        });

        nextLessonButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                console.log('Gauss Elimination next lesson button clicked', button.dataset.nextTargetId);
                event.preventDefault();
                const nextTargetId = button.dataset.nextTargetId;
                const nextTargetSection = document.getElementById(nextTargetId);
                detailedSections.forEach(section => section.style.display = 'none');
                if (nextTargetSection) {
                    nextTargetSection.style.display = 'block';
                    updateActiveLessonButton(nextTargetId);
                }
            });
        });

        previousLessonButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                console.log('Gauss Elimination previous lesson button clicked', button.dataset.previousTargetId);
                event.preventDefault();
                const previousTargetId = button.dataset.previousTargetId;
                const previousTargetSection = document.getElementById(previousTargetId);
                detailedSections.forEach(section => section.style.display = 'none');
                if (previousTargetSection) {
                    previousTargetSection.style.display = 'block';
                    updateActiveLessonButton(previousTargetId);
                }
            });
        });

         // Initially show the first detailed section for Gauss Elimination
         if (detailedSections.length > 0) {
             detailedSections[0].style.display = 'block';
             const firstButtonTargetId = detailedSections[0].id;
             updateActiveLessonButton(firstButtonTargetId);
         }
    }

    // === Detailed section navigation for Gauss-Jordan Elimination ===
    function setupGaussJordanLessonNavigation() {
        console.log('setupGaussJordanLessonNavigation function called');
        const gaussJordanButtons = document.querySelectorAll('#gauss-jordan-content .lesson-list button');
        const detailedSections = document.querySelectorAll('#gauss-jordan-content .detailed-lesson-content > div');
        const nextLessonButtons = document.querySelectorAll('#gauss-jordan-content .next-lesson-button');
        const previousLessonButtons = document.querySelectorAll('#gauss-jordan-content .previous-lesson-button'); // Added previous buttons

        console.log('Gauss-Jordan Elimination detailed sections found:', detailedSections.length);
        detailedSections.forEach(section => {
            section.style.display = 'none';
            // console.log('Hiding section:', section.id); // Keep console logs for debugging if needed
        });

        gaussJordanButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                console.log('Gauss-Jordan Elimination lesson list button clicked', button.dataset.targetId);
                event.preventDefault();
                const targetId = button.dataset.targetId;
                const targetSection = document.getElementById(targetId);

                detailedSections.forEach(section => section.style.display = 'none');
                if (targetSection) {
                    targetSection.style.display = 'block';
                    updateActiveLessonButton(targetId);
                }
            });
        });

        nextLessonButtons.forEach(button => { // Iterate through next buttons
            button.addEventListener('click', (event) => {
                console.log('Gauss-Jordan Elimination next button clicked', button.dataset.nextTargetId);
                event.preventDefault();
                const nextTargetId = button.dataset.nextTargetId;
                const nextTargetSection = document.getElementById(nextTargetId);
                detailedSections.forEach(section => section.style.display = 'none');
                if (nextTargetSection) {
                    nextTargetSection.style.display = 'block';
                    updateActiveLessonButton(nextTargetId);
                }
            });
        });

         previousLessonButtons.forEach(button => { // Iterate through previous buttons
            button.addEventListener('click', (event) => {
                console.log('Gauss-Jordan Elimination previous button clicked', button.dataset.previousTargetId);
                event.preventDefault();
                const previousTargetId = button.dataset.previousTargetId;
                const previousTargetSection = document.getElementById(previousTargetId);
                detailedSections.forEach(section => section.style.display = 'none');
                if (previousTargetSection) {
                    previousTargetSection.style.display = 'block';
                    updateActiveLessonButton(previousTargetId);
                }
            });
        });

        // Initially show the first detailed section for Gauss-Jordan Elimination
        if (detailedSections.length > 0) {
            detailedSections[0].style.display = 'block';
            const firstButtonTargetId = detailedSections[0].id;
            updateActiveLessonButton(firstButtonTargetId);
        }
    }

     // === Detailed section navigation for LU Decomposition ===
     function setupLUDecompositionLessonNavigation() {
         console.log('setupLUDecompositionLessonNavigation function called');
         const luLessonButtons = document.querySelectorAll('#lu-decomposition-content .lesson-list button');
         const detailedSections = document.querySelectorAll('#lu-decomposition-content .detailed-lesson-content > div');
         const nextLessonButtons = document.querySelectorAll('#lu-decomposition-content .next-lesson-button');
         const previousLessonButtons = document.querySelectorAll('#lu-decomposition-content .previous-lesson-button');

         console.log('LU Decomposition detailed sections found:', detailedSections.length);
         detailedSections.forEach(section => {
             section.style.display = 'none';
         });

         luLessonButtons.forEach(button => {
             button.addEventListener('click', (event) => {
                 console.log('LU Decomposition lesson list button clicked', button.dataset.targetId);
                 event.preventDefault();
                 const targetId = button.dataset.targetId;
                 const targetSection = document.getElementById(targetId);

                 detailedSections.forEach(section => section.style.display = 'none');
                 if (targetSection) {
                     targetSection.style.display = 'block';
                     updateActiveLessonButton(targetId);
                 }
             });
         });

         nextLessonButtons.forEach(button => {
             button.addEventListener('click', (event) => {
                 console.log('LU Decomposition next lesson button clicked', button.dataset.nextTargetId);
                 event.preventDefault();
                 const nextTargetId = button.dataset.nextTargetId;
                 const nextTargetSection = document.getElementById(nextTargetId);
                 detailedSections.forEach(section => section.style.display = 'none');
                 if (nextTargetSection) {
                     nextTargetSection.style.display = 'block';
                     updateActiveLessonButton(nextTargetId);
                 }
             });
         });

         previousLessonButtons.forEach(button => {
             button.addEventListener('click', (event) => {
                 console.log('LU Decomposition previous lesson button clicked', button.dataset.previousTargetId);
                 event.preventDefault();
                 const previousTargetId = button.dataset.previousTargetId;
                 const previousTargetSection = document.getElementById(previousTargetId);
                 detailedSections.forEach(section => section.style.display = 'none');
                 if (previousTargetSection) {
                     previousTargetSection.style.display = 'block';
                     updateActiveLessonButton(previousTargetId);
                 }
             });
         });

         // Initially show the first detailed section for LU Decomposition
         if (detailedSections.length > 0) {
             detailedSections[0].style.display = 'block';
             const firstButtonTargetId = detailedSections[0].id;
             updateActiveLessonButton(firstButtonTargetId);
         }
     }

    // Hide all detailed lesson sections at start and show lesson selection
    document.querySelectorAll('.lesson-content-detail').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('lesson-selection').style.display = 'block';
});
