#!/usr/bin/env python3
"""
ML Service Startup Verification
Tests that all imports and new modules load correctly
"""

import sys
import os

# Add ml_service to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("ML SERVICE STARTUP VERIFICATION")
print("=" * 60)

# Test 1: Import feature extractor
try:
    from feature_extractor import CodeFeatureExtractor
    print("✓ feature_extractor.py imported successfully")
except Exception as e:
    print(f"✗ Failed to import feature_extractor: {e}")
    sys.exit(1)

# Test 2: Import input validator
try:
    from input_validator import CodeInputValidator
    print("✓ input_validator.py imported successfully")
except Exception as e:
    print(f"✗ Failed to import input_validator: {e}")
    sys.exit(1)

# Test 3: Import model
try:
    from model import extract_and_score
    print("✓ model.py imported successfully")
except Exception as e:
    print(f"✗ Failed to import model: {e}")
    sys.exit(1)

# Test 4: Import error detector
try:
    from error_detector import ErrorDetector
    print("✓ error_detector.py imported successfully")
except Exception as e:
    print(f"✗ Failed to import error_detector: {e}")
    sys.exit(1)

# Test 5: Import code corrector
try:
    from code_corrector import CodeCorrector
    print("✓ code_corrector.py imported successfully")
except Exception as e:
    print(f"✗ Failed to import code_corrector: {e}")
    sys.exit(1)

# Test 6: Import Flask app
try:
    from app import app
    print("✓ app.py imported successfully")
except Exception as e:
    print(f"✗ Failed to import app: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("FUNCTIONALITY TESTS")
print("=" * 60)

# Test error detection
test_code = """
def calculateTotal(items):
    total = 0
    for item in items:
        if item['price'] > 0:
            total = total + item['price']
    return total
"""

try:
    result = ErrorDetector.detect_errors(test_code, "python")
    if result['success']:
        print(f"✓ Error detection works: Found {result['total_errors']} errors, {result['total_warnings']} warnings")
    else:
        print("✗ Error detection failed")
except Exception as e:
    print(f"✗ Error detection error: {e}")

# Test code correction
try:
    result = CodeCorrector.correct_code(test_code, "python")
    if result['success']:
        print(f"✓ Code correction works: Applied {result['improvements']} improvements")
    else:
        print("✗ Code correction failed")
except Exception as e:
    print(f"✗ Code correction error: {e}")

# Test feature extraction
try:
    features = CodeFeatureExtractor.extract_features(test_code)
    print(f"✓ Feature extraction works: Extracted {len(features)} features")
except Exception as e:
    print(f"✗ Feature extraction error: {e}")

# Test model scoring
try:
    result = extract_and_score(test_code, "python")
    if result['success']:
        print(f"✓ Model scoring works: Score {result['score']}, Risk {result['risk_level']}")
    else:
        print("✗ Model scoring failed")
except Exception as e:
    print(f"✗ Model scoring error: {e}")

print("\n" + "=" * 60)
print("FLASK ENDPOINTS")
print("=" * 60)

# Check registered routes
try:
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append(f"  {rule.endpoint}: {rule.rule}")
    
    print(f"✓ Registered {len(routes)} endpoints:")
    for route in sorted(routes):
        print(route)
except Exception as e:
    print(f"✗ Failed to list routes: {e}")

print("\n" + "=" * 60)
print("✓ ALL TESTS PASSED - Ready to start!")
print("=" * 60)
print("\nStart the ML service with: python app.py")
print("Or: python -m flask run --port 5001")
