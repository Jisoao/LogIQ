document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const methodOptions = document.querySelectorAll('.method-option');
    const sizeOptions = document.querySelectorAll('.size-option');
    const sizeInputs = document.querySelectorAll('input[name="matrix-size"]');
    const coefficientGrid = document.getElementById('coefficient-grid');
    const constantGrid = document.getElementById('constant-grid');
    const randomBtn = document.getElementById('random-values');
    const clearBtn = document.getElementById('clear-values');
    const calculateBtn = document.getElementById('calculate-btn');
    const backBtn = document.getElementById('back-to-calculator');
    const resultContainer = document.querySelector('.result-container');
    const calculatorContainer = document.querySelector('.calculator-container');
    const solutionMethod = document.getElementById('solution-method');

    // State
    let currentMethod = 'cramers-rule';
    let matrixSize = 2;
    let coefficientInputs = [];
    let constantInputs = [];

    // Initialize
    createMatrixInputs();

    // Event Listeners
    methodOptions.forEach(option => {
        option.addEventListener('click', () => {
            methodOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentMethod = option.dataset.method;
        });
    });

    sizeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            matrixSize = parseInt(e.target.value);
            
            // Update active class
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            e.target.parentElement.classList.add('active');
            
            // Regenerate matrix inputs
            createMatrixInputs();
        });
    });

    randomBtn.addEventListener('click', generateRandomValues);
    clearBtn.addEventListener('click', clearValues);
    calculateBtn.addEventListener('click', calculateSolution);
    backBtn.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        calculatorContainer.style.display = 'block';
    });

    // Functions
    function createMatrixInputs() {
        // Clear previous inputs
        coefficientGrid.innerHTML = '';
        constantGrid.innerHTML = '';
        coefficientInputs = [];
        constantInputs = [];
        
        // Set grid layout
        coefficientGrid.style.gridTemplateColumns = `repeat(${matrixSize}, 1fr)`;
        coefficientGrid.style.gridTemplateRows = `repeat(${matrixSize}, 1fr)`;
        constantGrid.style.gridTemplateRows = `repeat(${matrixSize}, 1fr)`;
        
        // Create coefficient matrix inputs
        for (let i = 0; i < matrixSize; i++) {
            coefficientInputs[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-input-field';
                input.dataset.row = i;
                input.dataset.col = j;
                input.step = 'any'; // Allow decimal numbers
                coefficientInputs[i][j] = input;
                coefficientGrid.appendChild(input);
            }
        }
        
        // Create constant vector inputs
        constantInputs = [];
        for (let i = 0; i < matrixSize; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-input-field';
            input.dataset.row = i;
            input.step = 'any'; // Allow decimal numbers
            constantInputs[i] = input;
            constantGrid.appendChild(input);
        }
    }

    function generateRandomValues() {
        // Generate random values between -10 and 10
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                coefficientInputs[i][j].value = Math.floor(Math.random() * 21) - 10;
            }
            constantInputs[i].value = Math.floor(Math.random() * 21) - 10;
        }
    }

    function clearValues() {
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                coefficientInputs[i][j].value = '';
            }
            constantInputs[i].value = '';
        }
    }

    function calculateSolution() {
        // Get coefficient matrix and constant vector
        const A = [];
        const b = [];
        
        for (let i = 0; i < matrixSize; i++) {
            A[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                const val = parseFloat(coefficientInputs[i][j].value) || 0;
                A[i][j] = val;
            }
            const val = parseFloat(constantInputs[i].value) || 0;
            b[i] = val;
        }
        
        // Update the method name in the solution
        solutionMethod.textContent = currentMethod.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Display solution
        resultContainer.style.display = 'block';
        calculatorContainer.style.display = 'none';
        
        // Call the appropriate solution method
        switch (currentMethod) {
            case 'cramers-rule':
                solveByCramersRule(A, b);
                break;
            case 'gauss-elimination':
                solveByGaussElimination(A, b);
                break;
            case 'gauss-jordan':
                solveByGaussJordan(A, b);
                break;
            case 'lu-decomposition':
                solveByLUDecomposition(A, b);
                break;
            default:
                solveByCramersRule(A, b);
        }
    }

    function solveByCramersRule(A, b) {
        const detA = calculateDeterminant(A);
        
        // Display the determinant calculation
        document.getElementById('determinant-calculation').innerHTML = `
            \\begin{align}
            \\det(A) &= ${detA.toFixed(2)} \\\\
            \\end{align}
        `;
        
        if (Math.abs(detA) < 1e-10) {
            // Determinant is zero or very close to zero
            document.getElementById('variable-calculations').innerHTML = '\\text{The system has no unique solution because the determinant is zero.}';
            document.getElementById('final-solution').innerHTML = 'No unique solution exists.';
            return;
        }
        
        const x = [];
        let variableCalculationsHTML = '\\begin{align}';
        
        for (let i = 0; i < matrixSize; i++) {
            // Create a copy of A and replace the i-th column with b
            const Ai = [];
            for (let j = 0; j < matrixSize; j++) {
                Ai[j] = [...A[j]];
                Ai[j][i] = b[j];
            }
            
            const detAi = calculateDeterminant(Ai);
            x[i] = detAi / detA;
            
            variableCalculationsHTML += `x_{${i+1}} &= \\frac{\\det(A_{${i+1}})}{\\det(A)} = \\frac{${detAi.toFixed(2)}}{${detA.toFixed(2)}} = ${x[i].toFixed(4)} \\\\`;
        }
        
        variableCalculationsHTML += '\\end{align}';
        document.getElementById('variable-calculations').innerHTML = variableCalculationsHTML;
        
        // Display final solution
        let finalSolutionHTML = '';
        for (let i = 0; i < matrixSize; i++) {
            finalSolutionHTML += `x<sub>${i+1}</sub> = ${x[i].toFixed(4)}${i < matrixSize - 1 ? ', ' : ''}`;
        }
        document.getElementById('final-solution').innerHTML = finalSolutionHTML;
        
        // Render math with MathJax
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise();
        }
    }

    function solveByGaussElimination(A, b) {
        // This is a placeholder. For a real implementation, you'd code the Gauss elimination algorithm
        document.getElementById('determinant-calculation').innerHTML = '\\text{Gauss Elimination step 1: Create an augmented matrix}';
        document.getElementById('variable-calculations').innerHTML = '\\text{Gauss Elimination steps 2-3: Perform forward elimination}';
        document.getElementById('final-solution').innerHTML = 'Placeholder for Gauss Elimination solution';
        
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise();
        }
    }

    function solveByGaussJordan(A, b) {
        // This is a placeholder. For a real implementation, you'd code the Gauss-Jordan algorithm
        document.getElementById('determinant-calculation').innerHTML = '\\text{Gauss-Jordan step 1: Create an augmented matrix}';
        document.getElementById('variable-calculations').innerHTML = '\\text{Gauss-Jordan steps 2-4: Perform forward and backward elimination}';
        document.getElementById('final-solution').innerHTML = 'Placeholder for Gauss-Jordan solution';
        
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise();
        }
    }

    function solveByLUDecomposition(A, b) {
        // This is a placeholder. For a real implementation, you'd code the LU decomposition algorithm
        document.getElementById('determinant-calculation').innerHTML = '\\text{LU Decomposition step 1: Decompose A into L and U matrices}';
        document.getElementById('variable-calculations').innerHTML = '\\text{LU Decomposition steps 2-3: Solve Ly = b and Ux = y}';
        document.getElementById('final-solution').innerHTML = 'Placeholder for LU Decomposition solution';
        
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise();
        }
    }

    function calculateDeterminant(matrix) {
        const n = matrix.length;
        
        // Base case for 1x1 matrix
        if (n === 1) {
            return matrix[0][0];
        }
        
        // Base case for 2x2 matrix
        if (n === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }
        
        // For larger matrices, use cofactor expansion
        let det = 0;
        for (let j = 0; j < n; j++) {
            det += Math.pow(-1, j) * matrix[0][j] * calculateDeterminant(getSubMatrix(matrix, 0, j));
        }
        
        return det;
    }
    
    // Helper function to get the submatrix after removing a row and column
    function getSubMatrix(matrix, rowToRemove, colToRemove) {
        const n = matrix.length;
        const subMatrix = [];
        
        for (let i = 0; i < n; i++) {
            if (i === rowToRemove) continue;
            
            const row = [];
            for (let j = 0; j < n; j++) {
                if (j === colToRemove) continue;
                row.push(matrix[i][j]);
            }
            
            subMatrix.push(row);
        }
        
        return subMatrix;
    }
}); 