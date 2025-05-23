document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const startBtn = document.getElementById('startBtn');
    const helpBtn = document.getElementById('helpBtn');
    const gameMessage = document.getElementById('gameMessage');
    const gamePlay = document.getElementById('gamePlay');
    const gameResults = document.getElementById('gameResults');
    const helpModal = document.getElementById('helpModal');
    const closeBtn = document.querySelector('.close-btn');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const timeElement = document.getElementById('time');
    const questionTimerElement = document.getElementById('questionTimer');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    
    // Authentication elements
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const usernameElement = document.getElementById('username');
    
    // Game state
    let currentLevel = 1;
    let score = 0;
    let timeLeft = 60;
    let questionTimeLeft = 15;
    let questionNumber = 1;
    let gameTimer;
    let questionTimer;
    let correctAnswers = 0;
    
    // Game questions by level
    const questions = {
        1: [
            {
                question: "Calculate the determinant of the following matrix:",
                matrix: [[3, 1], [2, 4]],
                options: ["2", "10", "8", "12"],
                correct: "10"
            },
            {
                question: "What is the trace of this matrix?",
                matrix: [[5, 2], [1, 3]],
                options: ["6", "7", "8", "9"],
                correct: "8"
            },
            {
                question: "Find the sum of the elements in this matrix:",
                matrix: [[1, 2], [3, 4]],
                options: ["8", "10", "12", "14"],
                correct: "10"
            },
            {
                question: "What is the determinant of an identity matrix?",
                options: ["0", "1", "2", "It depends on the size"],
                correct: "1"
            },
            {
                question: "What is the result of multiplying a matrix by the identity matrix?",
                options: ["Zero matrix", "The original matrix", "The transpose matrix", "The inverse matrix"],
                correct: "The original matrix"
            }
        ],
        2: [
            {
                question: "Calculate the determinant of this 3x3 matrix:",
                matrix: [[2, 0, 1], [3, 1, 0], [1, 2, 4]],
                options: ["5", "7", "9", "11"],
                correct: "11"
            }
            // More level 2 questions would be added here
        ]
    };

    // Initialize the page
    function init() {
        // Check authentication
        checkAuthState();
        
        // Set up event listeners
        startBtn.addEventListener('click', startGame);
        helpBtn.addEventListener('click', showHelp);
        closeBtn.addEventListener('click', closeHelp);
        playAgainBtn.addEventListener('click', playAgain);
        nextLevelBtn.addEventListener('click', nextLevel);
        
        // Set up level selector
        document.querySelectorAll('.level-btn:not(.locked)').forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.getAttribute('data-level'));
                selectLevel(level);
            });
        });
        
        // Handle logout
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                sessionStorage.removeItem('userLoggedIn');
                sessionStorage.removeItem('username');
                window.location.href = '/auth';
            });
        }
    }
    
    // Check authentication state
    function checkAuthState() {
        const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
        const username = sessionStorage.getItem('username');
        
        if (isLoggedIn && username) {
            // Update UI for logged in user
            if (usernameElement) usernameElement.textContent = username;
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            
            // Unlock level 2 for logged in users
            const level2Btn = document.querySelector('.level-btn[data-level="2"]');
            if (level2Btn && level2Btn.classList.contains('locked')) {
                level2Btn.classList.remove('locked');
                level2Btn.addEventListener('click', () => {
                    selectLevel(2);
                });
            }
        } else {
            // Update UI for guest user
            if (usernameElement) usernameElement.textContent = 'Guest';
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    }
    
    // Start the game
    function startGame() {
        // Reset game state
        score = 0;
        timeLeft = 60;
        questionNumber = 1;
        correctAnswers = 0;
        
        // Update UI
        scoreElement.textContent = score;
        timeElement.textContent = timeLeft;
        
        // Hide message and show gameplay
        gameMessage.style.display = 'none';
        gamePlay.style.display = 'block';
        gameResults.style.display = 'none';
        
        // Start timers
        startTimers();
        
        // Show first question
        showQuestion();
    }
    
    // Show the current question
    function showQuestion() {
        const questionContainer = gamePlay.querySelector('.question-container');
        const questionNumberElement = questionContainer.querySelector('.question-number');
        const questionTextElement = questionContainer.querySelector('.question-text');
        const matrixDisplay = questionContainer.querySelector('.matrix-display');
        const answerOptions = questionContainer.querySelector('.answer-options');
        
        // Get current question from the questions array
        const currentQuestions = questions[currentLevel] || questions[1];
        const currentQuestionData = currentQuestions[questionNumber - 1];
        
        // Update question number
        questionNumberElement.textContent = `Question ${questionNumber}/${currentQuestions.length}`;
        
        // Update question text
        questionTextElement.textContent = currentQuestionData.question;
        
        // Update matrix display if there is a matrix
        if (currentQuestionData.matrix) {
            matrixDisplay.style.display = 'block';
            matrixDisplay.innerHTML = '';
            
            const table = document.createElement('table');
            currentQuestionData.matrix.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
            
            matrixDisplay.appendChild(table);
        } else {
            matrixDisplay.style.display = 'none';
        }
        
        // Update answer options
        answerOptions.innerHTML = '';
        currentQuestionData.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.setAttribute('data-answer', option);
            
            button.addEventListener('click', () => {
                checkAnswer(option, currentQuestionData.correct);
            });
            
            answerOptions.appendChild(button);
        });
        
        // Reset question timer
        questionTimeLeft = 15;
        questionTimerElement.textContent = questionTimeLeft;
        clearInterval(questionTimer);
        questionTimer = setInterval(updateQuestionTimer, 1000);
    }
    
    // Check if the answer is correct
    function checkAnswer(answer, correctAnswer) {
        const answerButtons = gamePlay.querySelectorAll('.answer-btn');
        
        // Prevent multiple answers
        answerButtons.forEach(btn => {
            btn.disabled = true;
        });
        
        // Find the clicked button and the correct button
        const clickedButton = Array.from(answerButtons).find(btn => btn.getAttribute('data-answer') === answer);
        const correctButton = Array.from(answerButtons).find(btn => btn.getAttribute('data-answer') === correctAnswer);
        
        // Add classes for visual feedback
        if (answer === correctAnswer) {
            // Correct answer
            clickedButton.classList.add('correct');
            correctAnswers++;
            
            // Award points (more points for faster answers)
            const timeBonus = Math.ceil(questionTimeLeft / 3);
            const questionPoints = 10 + timeBonus;
            score += questionPoints;
            scoreElement.textContent = score;
            
            // Show a small animation
            clickedButton.innerHTML = `${answer} <span>+${questionPoints}</span>`;
        } else {
            // Incorrect answer
            clickedButton.classList.add('incorrect');
            correctButton.classList.add('correct');
        }
        
        // Clear question timer
        clearInterval(questionTimer);
        
        // Move to next question or show results after a delay
        setTimeout(() => {
            if (questionNumber < (questions[currentLevel] || questions[1]).length) {
                questionNumber++;
                showQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }
    
    // Show help modal
    function showHelp() {
        helpModal.classList.add('active');
    }
    
    // Close help modal
    function closeHelp() {
        helpModal.classList.remove('active');
    }
    
    // Select a level
    function selectLevel(level) {
        // Update UI
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.level-btn[data-level="${level}"]`).classList.add('active');
        
        // Update game state
        currentLevel = level;
        levelElement.textContent = level;
        
        // Update button text to reflect new level
        startBtn.textContent = `Play Level ${level}`;
        
        // If the game is in progress, restart with new level
        if (gamePlay.style.display === 'block') {
            playAgain();
        }
    }
    
    // Start timers
    function startTimers() {
        // Clear existing timers
        clearInterval(gameTimer);
        clearInterval(questionTimer);
        
        // Start new timers
        gameTimer = setInterval(updateGameTimer, 1000);
        questionTimer = setInterval(updateQuestionTimer, 1000);
    }
    
    // Update the game timer
    function updateGameTimer() {
        if (timeLeft > 0) {
            timeLeft--;
            timeElement.textContent = timeLeft;
            
            // Add warning class when time is running low
            if (timeLeft <= 10) {
                timeElement.classList.add('warning');
            }
        } else {
            // Time's up
            clearInterval(gameTimer);
            showResults();
        }
    }
    
    // Update the question timer
    function updateQuestionTimer() {
        if (questionTimeLeft > 0) {
            questionTimeLeft--;
            questionTimerElement.textContent = questionTimeLeft;
            
            // Add warning class when time is running low
            if (questionTimeLeft <= 5) {
                questionTimerElement.classList.add('warning');
            }
        } else {
            // Time's up for this question, move to the next one
            clearInterval(questionTimer);
            
            // Force incorrect answer
            const currentQuestions = questions[currentLevel] || questions[1];
            const currentQuestionData = currentQuestions[questionNumber - 1];
            checkAnswer('time-up', currentQuestionData.correct);
        }
    }
    
    // Show game results
    function showResults() {
        // Clear timers
        clearInterval(gameTimer);
        clearInterval(questionTimer);
        
        // Hide gameplay and show results
        gamePlay.style.display = 'none';
        gameResults.style.display = 'block';
        
        // Update results
        document.getElementById('finalScore').textContent = score;
        document.getElementById('correctAnswers').textContent = `${correctAnswers}/${(questions[currentLevel] || questions[1]).length}`;
        document.getElementById('timeTaken').textContent = `${60 - timeLeft}s`;
        
        // Enable/disable next level button
        if (currentLevel < Object.keys(questions).length && correctAnswers >= 3) {
            nextLevelBtn.disabled = false;
            
            // Unlock next level if score is good enough
            if (correctAnswers >= 4) {
                const nextLevelBtn = document.querySelector(`.level-btn[data-level="${currentLevel + 1}"]`);
                if (nextLevelBtn && nextLevelBtn.classList.contains('locked')) {
                    nextLevelBtn.classList.remove('locked');
                    nextLevelBtn.addEventListener('click', () => {
                        selectLevel(currentLevel + 1);
                    });
                    
                    // Update localStorage
                    localStorage.setItem(`level-${currentLevel + 1}-unlocked`, 'true');
                }
            }
        } else {
            nextLevelBtn.disabled = true;
        }
        
        // Update localStorage with progress
        const problemsSolved = parseInt(localStorage.getItem('problems-solved') || '0');
        localStorage.setItem('problems-solved', problemsSolved + correctAnswers);
    }
    
    // Play again with same level
    function playAgain() {
        startGame();
    }
    
    // Move to next level
    function nextLevel() {
        if (currentLevel < Object.keys(questions).length) {
            selectLevel(currentLevel + 1);
            setTimeout(startGame, 100);
        }
    }
    
    // Handle click outside modal to close it
    window.addEventListener('click', (event) => {
        if (event.target === helpModal) {
            closeHelp();
        }
    });
    
    // Initialize the game
    init();
}); 