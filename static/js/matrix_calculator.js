document.addEventListener('DOMContentLoaded', function() {
    displayUsername();
    setupLogout();
    initCalculator();
});

function displayUsername() {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        const username = sessionStorage.getItem('username') || 'Guest';
        usernameElement.textContent = username;
    }
}

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

function initCalculator() {
    const methodOptions = document.querySelectorAll('.method-option');
    let selectedMethod = 'determinant';
    const sizeOptions = document.querySelectorAll('.size-option input');
    let matrixSize = 2;

    // Equation input elements
    const equationInputContainer = document.querySelector('.equation-input-container');
    let equationFields = document.getElementById('equation-fields');

    const randomBtn = document.getElementById('random-values');
    const clearBtn = document.getElementById('clear-values');
    const calculateBtn = document.getElementById('calculate-btn');
    const backBtn = document.getElementById('back-to-calculator');
    const resultContainer = document.querySelector('.result-container');
    const calculatorContainer = document.querySelector('.calculator-container');

    methodOptions.forEach(option => {
        option.addEventListener('click', () => {
            methodOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedMethod = option.getAttribute('data-method');
            document.getElementById('solution-method').textContent = option.querySelector('span').textContent;
            createEquationFields();
        });
    });

    sizeOptions.forEach(option => {
        option.addEventListener('change', function() {
            matrixSize = parseInt(option.value);
            document.querySelectorAll('.size-option').forEach(label => label.classList.remove('active'));
            option.closest('.size-option').classList.add('active');
            createEquationFields();
        });
    });

    function createEquationFields() {
        if (!equationFields) equationFields = document.getElementById('equation-fields');
        equationFields.innerHTML = '';
        for (let i = 0; i < matrixSize; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'equation-row';
            const label = document.createElement('label');
            label.textContent = `Equation ${i + 1}: `;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'equation-input';
            input.placeholder = equationPlaceholder(matrixSize, i);
            input.dataset.idx = i;
            label.appendChild(input);
            rowDiv.appendChild(label);
            equationFields.appendChild(rowDiv);
        }
    }

    function equationPlaceholder(size, idx) {
        const vars = ['x','y','z','d','e','f','g','h'];
        let eq = '';
        for (let j = 0; j < size; j++) {
            eq += `${j > 0 ? ' + ' : ''}${Math.floor(Math.random() * 9 + 1)}${vars[j]}`;
        }
        eq += ` = ${Math.floor(Math.random() * 21) - 10}`;
        return eq;
    }

    randomBtn.addEventListener('click', () => {
        const eqInputs = document.querySelectorAll('.equation-input');
        for (let i = 0; i < eqInputs.length; i++) {
            eqInputs[i].value = equationPlaceholder(matrixSize, i);
        }
    });

    clearBtn.addEventListener('click', () => {
        document.querySelectorAll('.equation-input').forEach(input => input.value = '');
    });

    calculateBtn.addEventListener('click', () => {
        const variableNames = ['x','y','z','d','e','f','g','h'].slice(0, matrixSize);
        const eqInputs = Array.from(document.querySelectorAll('.equation-input'));
        const eqStrings = eqInputs.map(input => input.value.trim());
        if (eqStrings.some(s => !s)) {
            displaySolution({
                error: "Please enter all equations before calculating."
            });
            calculatorContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            return;
        }
        let matrixA, matrixB;
        try {
            ({ matrixA, matrixB } = parseEquationsToMatrixVars(eqStrings, variableNames));
        } catch (e) {
            displaySolution({ error: e.message });
            calculatorContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            return;
        }

        let solution;
        switch (selectedMethod) {
            case 'determinant':
                solution = solveDeterminant(matrixA);
                break;
            case 'cramers-rule':
                solution = solveLinearSystemCramersRule(matrixA, matrixB, variableNames, eqStrings);
                break;
            case 'gauss-elimination':
                solution = solveLinearSystemGaussElimination(matrixA, matrixB, variableNames, eqStrings);
                break;
            case 'gauss-jordan':
                solution = solveLinearSystemGaussJordan(matrixA, matrixB, variableNames, eqStrings);
                break;
            case 'lu-decomposition':
                solution = solveLinearSystemLUDecomposition(matrixA, matrixB, variableNames, eqStrings);
                break;
            default:
                solution = { error: "Unknown method." };
        }
        displaySolution(solution, variableNames);
        calculatorContainer.style.display = 'none';
        resultContainer.style.display = 'block';
    });

    backBtn.addEventListener('click', () => {
        calculatorContainer.style.display = 'block';
        resultContainer.style.display = 'none';
    });

    // --- Improved Equation Parsing ---
    function parseEquationsToMatrixVars(equations, variableNames) {
        const matrixA = [];
        const matrixB = [];
        for (let eq of equations) {
            eq = eq.replace(/\s+/g, '');
            const [lhs, rhs] = eq.split('=');
            if (!lhs || !rhs) throw new Error('Invalid equation: ' + eq);
            const row = new Array(variableNames.length).fill(0);
            // Match all terms like "+2x", "-y", "4z", "+z", etc.
            const termRegex = /([+-]?\d*(?:\.\d+)?)([a-z])/gi;
            let match;
            while ((match = termRegex.exec(lhs)) !== null) {
                let [ , coeffStr, varName ] = match;
                let idx = variableNames.indexOf(varName);
                if (idx === -1) throw new Error('Unknown variable: ' + varName);
                if (coeffStr === '' || coeffStr === '+') coeffStr = '1';
                if (coeffStr === '-') coeffStr = '-1';
                row[idx] += parseFloat(coeffStr);
            }
            matrixA.push(row);
            matrixB.push(parseFloat(rhs));
        }
        return { matrixA, matrixB };
    }

    // --- Cramer's Rule ---
    function solveLinearSystemCramersRule(A, B, variableNames, eqStrings) {
        let steps = [];
        let n = A.length;
        steps.push("$$\\text{System of equations:}$$");
        eqStrings.forEach(eq => steps.push("$$" + eq.replace(/([a-z])/g, '\\$1') + "$$"));
        steps.push("$$\\mathbf{A} = " + matrixToLatex(A) + "$$");
        steps.push("$$\\vec{b} = " + matrixToLatex(B.map(b => [b])) + "$$");
        let detA = determinant(A);
        steps.push(`$$\\det(A) = ${detA}$$`);
        if (Math.abs(detA) < 1e-12) {
            steps.push('$$\\text{Determinant is zero. System has no unique solution.}$$');
            return { steps, result: null };
        }
        let X = [];
        for (let k = 0; k < n; k++) {
            let Ak = A.map((row, i) => row.map((v, j) => (j === k ? B[i] : v)));
            steps.push(`$$\\text{Replace column ${k + 1} (${variableNames[k]}) of } A \\text{ with } b:\\ A_{${variableNames[k]}} = ${matrixToLatex(Ak)}$$`);
            let detAk = determinant(Ak);
            steps.push(`$$\\det(A_{${variableNames[k]}}) = ${detAk}$$`);
            X[k] = detAk / detA;
            steps.push(
                `$$${variableNames[k]} = \\frac{\\det(A_{${variableNames[k]}})}{\\det(A)} = \\frac{${detAk}}{${detA}} = ${X[k]}$$`
            );
        }
        return { steps, result: X };
    }

    // --- Gauss Elimination ---
    function solveLinearSystemGaussElimination(A, B, variableNames, eqStrings) {
        let steps = [];
        let n = A.length;
        steps.push("$$\\text{System of equations:}$$");
        eqStrings.forEach(eq => steps.push("$$" + eq.replace(/([a-z])/g, '\\$1') + "$$"));
        let Ab = A.map((row, i) => [...row, B[i]]);
        steps.push('$$\\text{Initial Augmented Matrix:}$$');
        steps.push(matrixToLatex(Ab));
        // Forward elimination
        for (let i = 0; i < n; i++) {
            // Partial pivoting
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(Ab[k][i]) > Math.abs(Ab[maxRow][i])) maxRow = k;
            }
            if (Math.abs(Ab[maxRow][i]) < 1e-12) {
                steps.push('$$\\text{Zero pivot encountered, system has no unique solution.}$$');
                return { steps, result: null };
            }
            if (maxRow !== i) {
                [Ab[i], Ab[maxRow]] = [Ab[maxRow], Ab[i]];
                steps.push(`$$\\text{Swap row } ${i + 1} \\text{ and } ${maxRow + 1}:$$`);
                steps.push(matrixToLatex(Ab));
            }
            // Eliminate below
            for (let k = i + 1; k < n; k++) {
                let factor = Ab[k][i] / Ab[i][i];
                steps.push(
                    `$$R_{${k + 1}} = R_{${k + 1}} - (${factor.toFixed(3)})R_{${i + 1}}$$`
                );
                for (let j = i; j < n + 1; j++) {
                    Ab[k][j] -= factor * Ab[i][j];
                }
                steps.push(matrixToLatex(Ab));
            }
        }
        // Back substitution
        let X = Array(n);
        for (let i = n - 1; i >= 0; i--) {
            let sum = Ab[i][n];
            for (let j = i + 1; j < n; j++) {
                sum -= Ab[i][j] * X[j];
            }
            if (Math.abs(Ab[i][i]) < 1e-12) {
                steps.push('$$\\text{Zero pivot encountered during back substitution.}$$');
                return { steps, result: null };
            }
            X[i] = sum / Ab[i][i];
            steps.push(`$$${variableNames[i]} = ${X[i].toFixed(6)}$$`);
        }
        return { steps, result: X };
    }

    // --- Gauss-Jordan ---
    function solveLinearSystemGaussJordan(A, B, variableNames, eqStrings) {
        let steps = [];
        let n = A.length;
        steps.push("$$\\text{System of equations:}$$");
        eqStrings.forEach(eq => steps.push("$$" + eq.replace(/([a-z])/g, '\\$1') + "$$"));
        let Ab = A.map((row, i) => [...row, B[i]]);
        steps.push('$$\\text{Initial Augmented Matrix:}$$');
        steps.push(matrixToLatex(Ab));
        for (let i = 0; i < n; i++) {
            // Partial pivoting
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(Ab[k][i]) > Math.abs(Ab[maxRow][i])) maxRow = k;
            }
            if (Math.abs(Ab[maxRow][i]) < 1e-12) {
                steps.push('$$\\text{Zero pivot encountered, system has no unique solution.}$$');
                return { steps, result: null };
            }
            if (maxRow !== i) {
                [Ab[i], Ab[maxRow]] = [Ab[maxRow], Ab[i]];
                steps.push(`$$\\text{Swap row } ${i + 1} \\text{ and } ${maxRow + 1}:$$`);
                steps.push(matrixToLatex(Ab));
            }
            // Make leading 1
            let pivot = Ab[i][i];
            for (let j = 0; j < n + 1; j++) {
                Ab[i][j] /= pivot;
            }
            steps.push(`$$R_{${i + 1}} = \\frac{R_{${i + 1}}}{${pivot.toFixed(3)}}$$`);
            steps.push(matrixToLatex(Ab));
            // Eliminate others
            for (let k = 0; k < n; k++) {
                if (k === i) continue;
                let factor = Ab[k][i];
                for (let j = 0; j < n + 1; j++) {
                    Ab[k][j] -= factor * Ab[i][j];
                }
                steps.push(`$$R_{${k + 1}} = R_{${k + 1}} - (${factor.toFixed(3)})R_{${i + 1}}$$`);
                steps.push(matrixToLatex(Ab));
            }
        }
        let X = Ab.map(row => row[n]);
        for (let i = 0; i < n; i++) {
            steps.push(`$$${variableNames[i]} = ${X[i].toFixed(6)}$$`);
        }
        return { steps, result: X };
    }

    // --- LU Decomposition (Doolittle, no pivoting for square and invertible A) ---
    function solveLinearSystemLUDecomposition(A, B, variableNames, eqStrings) {
        let steps = [];
        let n = A.length;
        steps.push("$$\\text{System of equations:}$$");
        eqStrings.forEach(eq => steps.push("$$" + eq.replace(/([a-z])/g, '\\$1') + "$$"));
        let L = Array.from({length: n}, () => Array(n).fill(0));
        let U = Array.from({length: n}, () => Array(n).fill(0));
        // Doolittle's method
        for (let i = 0; i < n; i++) {
            L[i][i] = 1;
            for (let j = i; j < n; j++) {
                let sum = 0;
                for (let k = 0; k < i; k++) sum += L[i][k] * U[k][j];
                U[i][j] = A[i][j] - sum;
            }
            for (let j = i + 1; j < n; j++) {
                let sum = 0;
                for (let k = 0; k < i; k++) sum += L[j][k] * U[k][i];
                if (Math.abs(U[i][i]) < 1e-12) {
                    steps.push('$$\\text{Zero pivot encountered, system has no unique solution.}$$');
                    return { steps, result: null };
                }
                L[j][i] = (A[j][i] - sum) / U[i][i];
            }
        }
        steps.push('$$L = ' + matrixToLatex(L) + '$$');
        steps.push('$$U = ' + matrixToLatex(U) + '$$');
        // Solve L.y = B (forward)
        let y = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            y[i] = B[i];
            for (let k = 0; k < i; k++) y[i] -= L[i][k] * y[k];
            y[i] /= L[i][i];
        }
        steps.push('$$\\vec{y} = ' + matrixToLatex(y.map(v => [v])) + '$$');
        // Solve U.x = y (backward)
        let X = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            X[i] = y[i];
            for (let k = i + 1; k < n; k++) X[i] -= U[i][k] * X[k];
            if (Math.abs(U[i][i]) < 1e-12) {
                steps.push('$$\\text{Zero pivot encountered during backward substitution.}$$');
                return { steps, result: null };
            }
            X[i] /= U[i][i];
        }
        for (let i = 0; i < n; i++) {
            steps.push(`$$${variableNames[i]} = ${X[i].toFixed(6)}$$`);
        }
        return { steps, result: X };
    }

    // --- Determinant (recursive Laplace) ---
    function determinant(A) {
        const n = A.length;
        if (n === 1) return A[0][0];
        if (n === 2) return A[0][0]*A[1][1] - A[0][1]*A[1][0];
        let det = 0;
        for (let j = 0; j < n; j++) {
            let minor = A.slice(1).map(row => row.filter((_, k) => k !== j));
            det += ((j % 2 === 0 ? 1 : -1) * A[0][j] * determinant(minor));
        }
        return det;
    }

    function matrixToLatex(matrix) {
        if (!Array.isArray(matrix[0])) matrix = matrix.map(x => [x]);
        let latex = "\\begin{pmatrix}";
        latex += matrix.map(row => row.map(x => typeof x === 'number' ? Number(x).toFixed(3) : x).join(' & ')).join(" \\\\ ");
        latex += "\\end{pmatrix}";
        return `${latex}`;
    }

    function displaySolution(solution, variableNames) {
        const stepsDiv = document.getElementById('matrix-setup');
        stepsDiv.innerHTML = '';
        if (solution.error) {
            stepsDiv.innerHTML = `<div class="math-display" style="color:red;">${solution.error}</div>`;
        } else if (solution.steps && Array.isArray(solution.steps)) {
            solution.steps.forEach(latex => {
                const p = document.createElement('div');
                p.className = 'math-display';
                p.innerHTML = latex;
                stepsDiv.appendChild(p);
            });
        }
        const finalDiv = document.getElementById('final-solution');
        finalDiv.innerHTML = '';
        if (solution.result !== null && solution.result !== undefined) {
            if (Array.isArray(solution.result)) {
                finalDiv.innerHTML = solution.result.map((val, idx) =>
                    `<div class="variable-solution">${variableNames[idx]} = <span class="variable-value">${val.toFixed(6)}</span></div>`
                ).join('');
            } else {
                finalDiv.innerHTML = `<div class="variable-solution"><span class="variable-name">Result</span> = <span class="variable-value">${solution.result}</span></div>`;
            }
        } else if (!solution.error) {
            finalDiv.innerHTML = `<div class="variable-solution">No solution.</div>`;
        }
        if (window.MathJax) window.MathJax.typeset();
    }

    // UI setup on load
    createEquationFields();
}