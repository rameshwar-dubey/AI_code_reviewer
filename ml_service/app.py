"""
Flask app for ML Service - Code Quality Analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from model import extract_and_score
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max


@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'name': 'AI Code Reviewer - ML Service',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'analyze': 'POST /analyze',
            'health': 'GET /'
        }
    }), 200


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze code and return quality score + risk level
    
    Request body:
    {
        "code": "source code here"
    }
    
    Response:
    {
        "score": 82,
        "risk_level": "Low",
        "features": {...},
        "success": true
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'code' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing "code" field in request body'
            }), 400
        
        code = data.get('code', '')
        
        if not code or len(code.strip()) == 0:
            return jsonify({
                'success': False,
                'error': 'Code cannot be empty'
            }), 400
        
        # Extract features and generate score
        result = extract_and_score(code)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple code snippets
    
    Request body:
    {
        "codes": ["code1", "code2", ...]
    }
    
    Response:
    {
        "results": [...],
        "success": true
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'codes' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing "codes" field in request body'
            }), 400
        
        codes = data.get('codes', [])
        
        if not isinstance(codes, list):
            return jsonify({
                'success': False,
                'error': '"codes" must be a list'
            }), 400
        
        # Analyze each code
        results = []
        for code in codes:
            result = extract_and_score(code)
            results.append(result)
        
        return jsonify({
            'results': results,
            'success': True
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', False) == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
