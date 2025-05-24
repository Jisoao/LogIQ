document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const methodOptions = document.querySelectorAll('.method-option');
    const matrixSizeOptions = document.querySelectorAll('.size-option');
    const coefficientGrid = document.getElementById('coefficient-grid');
    const resultGrid = document.getElementById('result-grid');
    const calculateBtn = document.getElementById('calculate-btn');
    const randomValuesBtn = document.getElementById('random-values');
    const clearValuesBtn = document.getElementById('clear-values');
    const backToCalculatorBtn = document.getElementById('back-to-calculator');
    const solutionMethodEl = document.getElementById('solution-method');
    const calculatorContainer = document.querySelector('.calculator-container');
    const resultContainer = document.querySelector('.result-container');
    
    // State
    let currentMethod = 'determinant';
    let currentSize = 2;
    let coefficientInputs = [];
    
    // Initialize
    initializeCalculator();
    
    // Method selection
    methodOptions.forEach(option => {
        option.addEventListener('click', () => {
            methodOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentMethod = option.dataset.method;
            updateOperationSign();
            
            // Update UI based on method
            if (currentMethod === 'multiplication' || currentMethod === 'addition') {
                showSecondMatrix();
            } else {
                hideSecondMatrix();
            }
        });
    });
    
    // Matrix size selection
    matrixSizeOptions.forEach(option => {
        const radio = option.querySelector('input');
        radio.addEventListener('change', () => {
            matrixSizeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentSize = parseInt(radio.value);
            createMatrixGrids();
        });
    });
    
    // Calculate button
    calculateBtn.addEventListener('click', () => {
        performCalculation();
    });
    
    // Random values button
    randomValuesBtn.addEventListener('click', () => {
        fillRandomValues();
    });
    
    // Clear button
    clearValuesBtn.addEventListener('click', () => {
        clearValues();
    });
    
    // Back button
    backToCalculatorBtn.addEventListener('click', () => {
        calculatorContainer.style.display = 'block';
        resultContainer.style.display = 'none';
    });
    
    // Initialize calculator
    function initializeCalculator() {
        createMatrixGrids();
    }
    
    // Create matrix input grids
    function createMatrixGrids() {
        // Clear existing grids
        coefficientGrid.innerHTML = '';
        resultGrid.innerHTML = '';
        coefficientInputs = [];
        
        // Create coefficient matrix
        for (let i = 0; i < currentSize; i++) {
            const row = [];
            for (let j = 0; j < currentSize; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-input';
                input.value = '0';
                coefficientGrid.appendChild(input);
                row.push(input);
            }
            coefficientInputs.push(row);
        }
        
        // Set the grid template
        coefficientGrid.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;
        resultGrid.style.gridTemplateColumns = `repeat(${currentSize}, 1fr)`;
        
        // Style the grid as a matrix
        setTimeout(() => {
            styleMatrixBorders(coefficientGrid);
        }, 0);
    }
    
    // Style matrix borders to look like bracket notation
    function styleMatrixBorders(grid) {
        const inputs = grid.querySelectorAll('input');
        inputs.forEach((input, index) => {
            input.classList.remove('top-left', 'top-right', 'bottom-left', 'bottom-right');
            
            const row = Math.floor(index / currentSize);
            const col = index % currentSize;
            
            if (row === 0 && col === 0) {
                input.classList.add('top-left');
            }
            
            if (row === 0 && col === currentSize - 1) {
                input.classList.add('top-right');
            }
            
            if (row === currentSize - 1 && col === 0) {
                input.classList.add('bottom-left');
            }
            
            if (row === currentSize - 1 && col === currentSize - 1) {
                input.classList.add('bottom-right');
            }
        });
    }
    
    // Fill random values
    function fillRandomValues() {
        for (let i = 0; i < currentSize; i++) {
            for (let j = 0; j < currentSize; j++) {
                coefficientInputs[i][j].value = Math.floor(Math.random() * 10) - 5;
            }
        }
    }
    
    // Clear values
    function clearValues() {
        for (let i = 0; i < currentSize; i++) {
            for (let j = 0; j < currentSize; j++) {
                coefficientInputs[i][j].value = 0;
            }
        }
    }
    
    // Update operation sign based on selected method
    function updateOperationSign() {
        const operationSign = document.querySelector('.operation-sign');
        
        switch (currentMethod) {
            case 'determinant':
                operationSign.textContent = '→';
                break;
            case 'inverse':
                operationSign.innerHTML = '<sup>-1</sup>';
                break;
            case 'multiplication':
                operationSign.textContent = '×';
                break;
            case 'addition':
                operationSign.textContent = '+';
                break;
            default:
                operationSign.textContent = '=';
        }
    }
    
    // Show/hide second matrix for operations that need it
    function showSecondMatrix() {
        // Implementation placeholder
        console.log('Second matrix would be shown here');
    }
    
    function hideSecondMatrix() {
        // Implementation placeholder
        console.log('Second matrix would be hidden here');
    }
    
    // Perform matrix calculation
    function performCalculation() {
        // Get matrix values
        const matrix = getMatrixValues();
        
        // Update UI to show result
        solutionMethodEl.textContent = currentMethod.charAt(0).toUpperCase() + currentMethod.slice(1);
        calculatorContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Display calculation steps based on method
        displayCalculationSteps(matrix);
    }
    
    // Get matrix values
    function getMatrixValues() {
        const matrix = [];
        
        for (let i = 0; i < currentSize; i++) {
            const row = [];
            for (let j = 0; j < currentSize; j++) {
                row.push(parseFloat(coefficientInputs[i][j].value) || 0);
            }
            matrix.push(row);
        }
        
        return matrix;
    }
    
    // Display calculation steps
    function displayCalculationSteps(matrix) {
        const matrixSetupEl = document.getElementById('matrix-setup');
        const matrixCalculationEl = document.getElementById('matrix-calculation');
        const finalSolutionEl = document.getElementById('final-solution');
        
        // Format matrix for MathJax
        const matrixLatex = formatMatrixLatex(matrix);
        
        // Display matrix setup
        matrixSetupEl.innerHTML = `\\[A = ${matrixLatex}\\]`;
        
        let result;
        
        // Calculate result based on method
        switch (currentMethod) {
            case 'determinant':
                result = calculateDeterminant(matrix);
                matrixCalculationEl.innerHTML = `\\[\\det(A) = ${result}\\]`;
                break;
            case 'inverse':
                // Placeholder for inverse calculation
                matrixCalculationEl.innerHTML = `\\[A^{-1} = \\text{(inverse calculation)}\\]`;
                result = "Inverse calculation placeholder";
                break;
            case 'multiplication':
                // Placeholder for multiplication
                matrixCalculationEl.innerHTML = `\\[A \\times B = \\text{(multiplication result)}\\]`;
                result = "Multiplication calculation placeholder";
                break;
            case 'addition':
                // Placeholder for addition
                matrixCalculationEl.innerHTML = `\\[A + B = \\text{(addition result)}\\]`;
                result = "Addition calculation placeholder";
                break;
        }
        
        // Update final solution
        finalSolutionEl.innerHTML = `<div class="final-answer">${result}</div>`;
        
        // Render MathJax
        if (window.MathJax) {
            MathJax.typeset();
        }
    }
    
    // Format matrix for LaTeX
    function formatMatrixLatex(matrix) {
        const rows = matrix.map(row => row.join(' & ')).join(' \\\\ ');
        return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
    }
    
    // Calculate determinant (simple implementation for 2x2 and 3x3)
    function calculateDeterminant(matrix) {
        if (currentSize === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        } else if (currentSize === 3) {
            return matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                   matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                   matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
        } else {
            // For larger matrices, we would use a more complex algorithm
            return "Determinant calculation for 4x4+ matrices coming soon";
        }
    }
}); 