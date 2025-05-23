from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_cors import CORS
import numpy as np

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Routes
@app.route('/')
def home():
    return render_template('homepage.html')

@app.route('/auth')
def auth():
    return render_template('auth.html')

@app.route('/login')
def login():
    return redirect(url_for('auth'))

@app.route('/learn/<topic>')
def learn(topic):
    return render_template('learn.html', topic=topic)

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    method = data.get('method')
    matrix = data.get('matrix')
    
    result = {
        'success': True,
        'method': method,
        'result': 'calculation placeholder'
    }
    
    # TODO: Implement actual matrix calculations
    if method == 'cramers-rule':
        # Placeholder for Cramer's Rule calculation
        pass
    elif method == 'gauss-elimination':
        # Placeholder for Gauss Elimination
        pass
    elif method == 'gauss-jordan':
        # Placeholder for Gauss-Jordan
        pass
    elif method == 'lu-decomposition':
        # Placeholder for LU Decomposition
        pass
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True) 