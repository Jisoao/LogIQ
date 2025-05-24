document.addEventListener('DOMContentLoaded', function() {
    // Display username
    displayUsername();
    
    // Setup logout functionality
    setupLogout();
    
    // Initialize calculator components
    initCalculator();
});

/**
 * Display username from session storage
 */
function displayUsername() {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        const username = sessionStorage.getItem('username') || 'Guest';
        usernameElement.textContent = username;
    }
}

/**
 * Setup logout functionality
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('userLoggedIn');
            sessionStorage.removeItem('username');
            window.location.href = '/auth';
        });
    }
}

/**
 * Initialize calculator functionality
 */
function initCalculator() {
    // Method options
    const methodOptions = document.querySelectorAll('.method-option');
    let selectedMethod = 'cramers-rule';
    
    // Size options
    const sizeOptions = document.querySelectorAll('.size-option input');
    let matrixSize = 2;
    
    // Grid elements
    const coefficientGrid = document.getElementById('coefficient-grid');
    const constantGrid = document.getElementById('constant-grid');
    
    // Action buttons
    const randomBtn = document.getElementById('random-values');
    const clearBtn = document.getElementById('clear-values');
    const calculateBtn = document.getElementById('calculate-btn');
    const backBtn = document.getElementById('back-to-calculator');
    
    // Result container
    const resultContainer = document.querySelector('.result-container');
    const calculatorContainer = document.querySelector('.calculator-container');
    
    // Method selection
    methodOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            methodOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Update selected method
            selectedMethod = option.getAttribute('data-method');
            
            // Update solution method display
            document.getElementById('solution-method').textContent = 
                option.querySelector('span').textContent;
        });
    });
    
    // Size selection
    sizeOptions.forEach(option => {
        option.addEventListener('change', () => {
            matrixSize = parseInt(option.value);
            createMatrixGrids();
        });
    });
    
    // Create matrix input grids
    function createMatrixGrids() {
        // Clear existing grids
        coefficientGrid.innerHTML = '';
        constantGrid.innerHTML = '';
        
        // Create coefficient matrix grid
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-input';
                input.placeholder = '0';
                input.dataset.row = i;
                input.dataset.col = j;
                coefficientGrid.appendChild(input);
            }
        }
        
        // Set grid template columns
        coefficientGrid.style.gridTemplateColumns = `repeat(${matrixSize}, 1fr)`;
        
        // Create constant matrix grid
        for (let i = 0; i < matrixSize; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-input';
            input.placeholder = '0';
            input.dataset.row = i;
            constantGrid.appendChild(input);
        }
        
        // Set grid template columns
        constantGrid.style.gridTemplateColumns = '1fr';
    }
    
    // Generate random values
    randomBtn.addEventListener('click', () => {
        const coeffInputs = coefficientGrid.querySelectorAll('input');
        const constInputs = constantGrid.querySelectorAll('input');
        
        coeffInputs.forEach(input => {
            input.value = Math.floor(Math.random() * 20) - 10;
        });
        
        constInputs.forEach(input => {
            input.value = Math.floor(Math.random() * 20) - 10;
        });
    });
    
    // Clear values
    clearBtn.addEventListener('click', () => {
        const coeffInputs = coefficientGrid.querySelectorAll('input');
        const constInputs = constantGrid.querySelectorAll('input');
        
        coeffInputs.forEach(input => {
            input.value = '';
        });
        
        constInputs.forEach(input => {
            input.value = '';
        });
    });
    
    // Calculate solution
    calculateBtn.addEventListener('click', () => {
        // Get matrix values
        const coeffMatrix = [];
        const constVector = [];
        
        // Get coefficient matrix values
        for (let i = 0; i < matrixSize; i++) {
            coeffMatrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                const input = coefficientGrid.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                coeffMatrix[i][j] = parseFloat(input.value) || 0;
            }
        }
        
        // Get constant vector values
        for (let i = 0; i < matrixSize; i++) {
            const input = constantGrid.querySelector(`input[data-row="${i}"]`);
            constVector[i] = parseFloat(input.value) || 0;
        }
        
        // Calculate solution based on selected method
        let solution = calculateSolution(coeffMatrix, constVector, selectedMethod);
        
        // Display solution
        displaySolution(solution);
        
        // Show result container
        calculatorContainer.style.display = 'none';
        resultContainer.style.display = 'block';
    });
    
    // Back to calculator
    backBtn.addEventListener('click', () => {
        calculatorContainer.style.display = 'block';
        resultContainer.style.display = 'none';
    });
    
    // Calculate solution based on method
    function calculateSolution(coeffMatrix, constVector, method) {
        // For demo purposes, we'll just return dummy data
        // In a real app, you would implement the actual algorithms
        
        const solution = {
            method: method,
            variables: [],
            steps: {
                determinant: "\\det(A) = \\begin{vmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{vmatrix} = a_{11}a_{22} - a_{12}a_{21}",
                variables: "x = \\frac{\\det(A_x)}{\\det(A)}, y = \\frac{\\det(A_y)}{\\det(A)}"
            }
        };
        
        // Generate solution values
        for (let i = 0; i < matrixSize; i++) {
            solution.variables.push({
                name: String.fromCharCode(120 + i), // x, y, z, ...
                value: Math.round((Math.random() * 100) - 50) / 10
            });
        }
        
        return solution;
    }
    
    // Display solution
    function displaySolution(solution) {
        // Update method name
        document.getElementById('solution-method').textContent = 
            getMethodDisplayName(solution.method);
        
        // Display determinant calculation (MathJax)
        document.getElementById('determinant-calculation').textContent = solution.steps.determinant;
        
        // Display variable calculations (MathJax)
        document.getElementById('variable-calculations').textContent = solution.steps.variables;
        
        // Display final solution
        const finalSolution = document.getElementById('final-solution');
        finalSolution.innerHTML = '';
        
        solution.variables.forEach(variable => {
            const varElement = document.createElement('div');
            varElement.className = 'variable-solution';
            varElement.innerHTML = `<span class="variable-name">${variable.name}</span> = <span class="variable-value">${variable.value}</span>`;
            finalSolution.appendChild(varElement);
        });
        
        // Refresh MathJax to render math expressions
        if (window.MathJax) {
            window.MathJax.typeset();
        }
    }
    
    // Get display name for method
    function getMethodDisplayName(method) {
        switch (method) {
            case 'cramers-rule':
                return "Cramer's Rule";
            case 'gauss-elimination':
                return "Gauss Elimination";
            case 'gauss-jordan':
                return "Gauss-Jordan";
            case 'lu-decomposition':
                return "LU Decomposition";
            default:
                return method;
        }
    }
    
    // Initialize the calculator
    createMatrixGrids();
} 